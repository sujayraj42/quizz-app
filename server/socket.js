const { RoomManager } = require("./roomManager");

const roomManager = new RoomManager();
const roomTimers = new Map();

function emitError(socket, message) {
  socket.emit("app:error", { message });
}

function emitRoomState(io, roomCode) {
  const state = roomManager.getRoomState(roomCode);
  if (state) {
    io.to(roomCode).emit("room:state", state);
  }
}

function emitRoomStateToSocket(socket, roomCode) {
  const state = roomManager.getRoomState(roomCode);
  if (state) {
    socket.emit("room:state", state);
  }
}

function clearRoomTimer(roomCode) {
  const timers = roomTimers.get(roomCode);
  if (!timers) {
    return;
  }

  clearInterval(timers.intervalId);
  clearTimeout(timers.timeoutId);
  roomTimers.delete(roomCode);
}

function finishRound(io, roomCode) {
  clearRoomTimer(roomCode);
  const roundResult = roomManager.finishRound(roomCode);
  if (!roundResult) {
    return;
  }

  io.to(roomCode).emit("quiz:roundResult", roundResult);
  emitRoomState(io, roomCode);
}

function startQuestion(io, roomCode) {
  clearRoomTimer(roomCode);

  const question = roomManager.advanceQuestion(roomCode);
  if (!question) {
    const finalState = roomManager.finalize(roomCode);
    if (finalState) {
      io.to(roomCode).emit("quiz:final", finalState);
      emitRoomState(io, roomCode);
    }
    return;
  }

  io.to(roomCode).emit("quiz:question", question);
  io.to(roomCode).emit("quiz:timer", {
    roomCode,
    remaining: question.duration,
    duration: question.duration,
  });
  emitRoomState(io, roomCode);

  const intervalId = setInterval(() => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== "question") {
      clearRoomTimer(roomCode);
      return;
    }

    const remaining = Math.max(
      Math.ceil((room.currentQuestionEndsAt - Date.now()) / 1000),
      0
    );

    io.to(roomCode).emit("quiz:timer", {
      roomCode,
      remaining,
      duration: question.duration,
    });
  }, 1000);

  const timeoutId = setTimeout(() => {
    finishRound(io, roomCode);
  }, question.duration * 1000 + 50);

  roomTimers.set(roomCode, { intervalId, timeoutId });
}

function hostOwnsRoom(socket, roomCode) {
  const binding = roomManager.getBinding(socket.id);
  return binding?.role === "host" && binding.roomCode === roomCode;
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("room:create", () => {
      try {
        const room = roomManager.createRoom(socket.id);
        socket.join(room.code);
        socket.emit("room:created", {
          roomCode: room.code,
          questionCount: room.questions.length,
        });
        emitRoomState(io, room.code);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("room:join", ({ roomCode, name }) => {
      try {
        const player = roomManager.addPlayer(roomCode, socket.id, name);
        const joinedRoomCode = roomManager.getBinding(socket.id).roomCode;
        socket.join(joinedRoomCode);
        socket.emit("room:joined", {
          playerId: player.id,
          roomCode: joinedRoomCode,
          playerName: player.name,
        });
        emitRoomState(io, joinedRoomCode);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("display:join", ({ roomCode }) => {
      try {
        const room = roomManager.getRoom(roomCode);
        if (!room) {
          throw new Error("Room not found.");
        }

        socket.join(room.code);
        socket.emit("display:joined", { roomCode: room.code });
        emitRoomStateToSocket(socket, room.code);

        const liveQuestion = roomManager.getCurrentQuestionSnapshot(room.code);
        if (liveQuestion) {
          socket.emit("quiz:question", liveQuestion);
          socket.emit("quiz:timer", {
            roomCode: room.code,
            remaining: liveQuestion.remaining,
            duration: liveQuestion.duration,
          });
          return;
        }

        const roundResult = roomManager.getRoundResultSnapshot(room.code);
        if (roundResult) {
          socket.emit("quiz:roundResult", roundResult);
          return;
        }

        if (room.status === "final") {
          const finalState = roomManager.finalize(room.code);
          if (finalState) {
            socket.emit("quiz:final", finalState);
          }
        }
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("quiz:configureQuestions", ({ roomCode, questionPack }) => {
      if (!hostOwnsRoom(socket, roomCode)) {
        emitError(socket, "Only the host can change the question pack.");
        return;
      }

      try {
        const result = roomManager.setRoomQuestions(roomCode, questionPack);
        socket.emit("quiz:questionsUpdated", result);
        emitRoomState(io, roomCode);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("quiz:resetQuestions", ({ roomCode }) => {
      if (!hostOwnsRoom(socket, roomCode)) {
        emitError(socket, "Only the host can reset the question pack.");
        return;
      }

      try {
        const result = roomManager.resetRoomQuestions(roomCode);
        socket.emit("quiz:questionsUpdated", result);
        emitRoomState(io, roomCode);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("quiz:start", ({ roomCode }) => {
      if (!hostOwnsRoom(socket, roomCode)) {
        emitError(socket, "Only the host can start this quiz.");
        return;
      }

      const room = roomManager.getRoom(roomCode);
      if (!room || room.status !== "lobby") {
        emitError(socket, "Quiz cannot be started right now.");
        return;
      }

      startQuestion(io, roomCode);
    });

    socket.on("quiz:answer", ({ roomCode, choiceIndex }) => {
      try {
        const result = roomManager.recordAnswer(roomCode, socket.id, choiceIndex);
        socket.emit("quiz:answerAck", result);
        emitRoomState(io, roomCode);

        const room = roomManager.getRoom(roomCode);
        if (room && room.roundAnswers.size >= room.players.length && room.players.length > 0) {
          finishRound(io, roomCode);
        }
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on("quiz:next", ({ roomCode }) => {
      if (!hostOwnsRoom(socket, roomCode)) {
        emitError(socket, "Only the host can advance the quiz.");
        return;
      }

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        emitError(socket, "Room not found.");
        return;
      }

      if (room.status !== "leaderboard") {
        emitError(socket, "Wait for the round to finish first.");
        return;
      }

      if (room.currentQuestionIndex >= room.questions.length - 1) {
        const finalState = roomManager.finalize(roomCode);
        if (finalState) {
          io.to(roomCode).emit("quiz:final", finalState);
          emitRoomState(io, roomCode);
        }
        return;
      }

      startQuestion(io, roomCode);
    });

    socket.on("disconnect", () => {
      const result = roomManager.removeSocket(socket.id);
      if (!result) {
        return;
      }

      if (result.type === "host") {
        clearRoomTimer(result.roomCode);
        io.to(result.roomCode).emit("room:closed", {
          message: "The host left, so this room has been closed.",
        });
        return;
      }

      const room = roomManager.getRoom(result.roomCode);
      if (room && room.status === "question") {
        if (room.players.length > 0 && room.roundAnswers.size >= room.players.length) {
          finishRound(io, result.roomCode);
          return;
        }
      }

      emitRoomState(io, result.roomCode);
    });
  });
}

module.exports = {
  registerSocketHandlers,
};
