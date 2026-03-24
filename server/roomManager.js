const crypto = require("node:crypto");
const { questions: seedQuestions } = require("./questions");

const QUESTION_DURATION_SECONDS = 15;
const QUESTIONS_PER_GAME = 5;
const PLAYER_COLORS = [
  "#7ef7ff",
  "#9cff8f",
  "#ffd166",
  "#ff8fab",
  "#b388ff",
  "#ff9f5a",
];
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeRoomCode(roomCode = "") {
  return String(roomCode).trim().toUpperCase();
}

function normalizePlayerName(name = "") {
  return String(name).trim().replace(/\s+/g, " ").slice(0, 20);
}

function buildDefaultQuestionSet() {
  return shuffle(seedQuestions)
    .slice(0, QUESTIONS_PER_GAME)
    .map((question) => ({ ...question, choices: [...question.choices] }));
}

function normalizeQuestionPack(input) {
  const payload = Array.isArray(input) ? { questions: input } : input;
  const questions = payload?.questions;

  if (!Array.isArray(questions) || questions.length < 3) {
    throw new Error("Provide at least 3 quiz questions.");
  }

  const normalizedQuestions = questions.map((question, index) => {
    const prompt = String(question?.prompt || "").trim();
    const choices = Array.isArray(question?.choices)
      ? question.choices
          .map((choice) => String(choice || "").trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];
    const answerIndex = Number(question?.answerIndex);

    if (!prompt) {
      throw new Error(`Question ${index + 1} is missing a prompt.`);
    }

    if (choices.length < 2) {
      throw new Error(`Question ${index + 1} needs at least 2 choices.`);
    }

    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
      throw new Error(`Question ${index + 1} has an invalid answerIndex.`);
    }

    return {
      id: String(question?.id || `custom-${index + 1}`),
      prompt,
      choices,
      answerIndex,
      theme: String(question?.theme || "custom").trim() || "custom",
    };
  });

  return {
    title: String(payload?.title || "Custom Question Pack").trim() || "Custom Question Pack",
    questions: normalizedQuestions,
  };
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.socketIndex = new Map();
  }

  createRoom(hostSocketId) {
    const existingBinding = this.socketIndex.get(hostSocketId);
    if (existingBinding?.role === "host") {
      const existingRoom = this.rooms.get(existingBinding.roomCode);
      if (existingRoom) {
        return existingRoom;
      }
    }

    let roomCode = "";
    while (!roomCode || this.rooms.has(roomCode)) {
      roomCode = Array.from({ length: 5 }, () =>
        ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
      ).join("");
    }

    const room = {
      code: roomCode,
      hostSocketId,
      status: "lobby",
      createdAt: Date.now(),
      currentQuestionIndex: -1,
      currentQuestionStartedAt: null,
      currentQuestionEndsAt: null,
      questions: buildDefaultQuestionSet(),
      questionPackTitle: "Demo Question Pack",
      questionPackSource: "demo",
      players: [],
      roundAnswers: new Map(),
      lastRound: null,
    };

    this.rooms.set(room.code, room);
    this.socketIndex.set(hostSocketId, { roomCode: room.code, role: "host" });
    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(normalizeRoomCode(roomCode));
  }

  getBinding(socketId) {
    return this.socketIndex.get(socketId);
  }

  addPlayer(roomCode, socketId, playerName) {
    const room = this.getRoom(roomCode);
    const normalizedName = normalizePlayerName(playerName);

    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "lobby") {
      throw new Error("Quiz already started. Ask the teacher to create a new room.");
    }

    if (!normalizedName) {
      throw new Error("Enter a player name before joining.");
    }

    const duplicate = room.players.find(
      (player) => player.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (duplicate) {
      throw new Error("That player name is already in the room.");
    }

    const player = {
      id: crypto.randomUUID(),
      socketId,
      name: normalizedName,
      score: 0,
      color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
    };

    room.players.push(player);
    this.socketIndex.set(socketId, {
      roomCode: room.code,
      role: "player",
      playerId: player.id,
    });

    return player;
  }

  buildLeaderboard(room) {
    return [...room.players]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.name.localeCompare(right.name);
      })
      .map((player, index) => ({
        id: player.id,
        name: player.name,
        score: player.score,
        color: player.color,
        rank: index + 1,
      }));
  }

  getRoomState(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return null;
    }

    const currentQuestion =
      room.currentQuestionIndex >= 0
        ? room.questions[room.currentQuestionIndex]
        : null;

    return {
      roomCode: room.code,
      status: room.status,
      players: this.buildLeaderboard(room),
      playerCount: room.players.length,
      answeredCount: room.roundAnswers.size,
      questionNumber: currentQuestion ? room.currentQuestionIndex + 1 : 0,
      totalQuestions: room.questions.length,
      questionPrompt: room.status === "question" ? currentQuestion?.prompt : null,
      questionPack: {
        title: room.questionPackTitle,
        source: room.questionPackSource,
        isCustom: room.questionPackSource === "custom",
      },
      canStart: room.status === "lobby" && room.questions.length > 0,
      canAdvance: room.status === "leaderboard",
      hasMoreQuestions:
        room.status === "leaderboard" &&
        room.currentQuestionIndex < room.questions.length - 1,
      lastRound: room.lastRound,
    };
  }

  advanceQuestion(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.currentQuestionIndex + 1 >= room.questions.length) {
      return null;
    }

    room.currentQuestionIndex += 1;
    room.status = "question";
    room.roundAnswers = new Map();
    room.lastRound = null;
    room.currentQuestionStartedAt = Date.now();
    room.currentQuestionEndsAt =
      room.currentQuestionStartedAt + QUESTION_DURATION_SECONDS * 1000;

    const question = room.questions[room.currentQuestionIndex];
    return {
      roomCode: room.code,
      questionNumber: room.currentQuestionIndex + 1,
      totalQuestions: room.questions.length,
      prompt: question.prompt,
      choices: question.choices,
      duration: QUESTION_DURATION_SECONDS,
      endsAt: room.currentQuestionEndsAt,
      theme: question.theme,
    };
  }

  getCurrentQuestionSnapshot(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "question") {
      return null;
    }

    const question = room.questions[room.currentQuestionIndex];
    return {
      roomCode: room.code,
      questionNumber: room.currentQuestionIndex + 1,
      totalQuestions: room.questions.length,
      prompt: question.prompt,
      choices: question.choices,
      duration: QUESTION_DURATION_SECONDS,
      endsAt: room.currentQuestionEndsAt,
      remaining: Math.max(
        Math.ceil((room.currentQuestionEndsAt - Date.now()) / 1000),
        0
      ),
      theme: question.theme,
    };
  }

  recordAnswer(roomCode, socketId, choiceIndex) {
    const room = this.getRoom(roomCode);
    const binding = this.socketIndex.get(socketId);

    if (!room || !binding || binding.role !== "player") {
      throw new Error("Player session not found.");
    }

    if (binding.roomCode !== room.code) {
      throw new Error("You are not connected to this room.");
    }

    if (room.status !== "question") {
      throw new Error("Question is not active right now.");
    }

    const question = room.questions[room.currentQuestionIndex];
    if (
      !Number.isInteger(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= question.choices.length
    ) {
      throw new Error("Invalid answer choice.");
    }

    if (room.roundAnswers.has(binding.playerId)) {
      throw new Error("Answer already submitted for this round.");
    }

    room.roundAnswers.set(binding.playerId, {
      choiceIndex,
      submittedAt: Date.now(),
    });

    const player = room.players.find((entry) => entry.id === binding.playerId);
    return {
      playerId: binding.playerId,
      playerName: player?.name || "Player",
    };
  }

  finishRound(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "question") {
      return null;
    }

    const question = room.questions[room.currentQuestionIndex];
    const answerEntries = [...room.roundAnswers.values()];

    const awards = room.players.map((player) => {
      const answer = room.roundAnswers.get(player.id);
      const isCorrect = answer?.choiceIndex === question.answerIndex;
      let pointsAwarded = 0;

      if (isCorrect && answer) {
        const remainingMs = Math.max(
          room.currentQuestionEndsAt - answer.submittedAt,
          0
        );
        pointsAwarded = 100 + Math.floor(remainingMs / 1000) * 5;
        player.score += pointsAwarded;
      }

      return {
        playerId: player.id,
        playerName: player.name,
        pointsAwarded,
        correct: isCorrect,
        selectedChoiceIndex: answer?.choiceIndex ?? null,
        score: player.score,
      };
    });

    const answerStats = question.choices.map((choice, choiceIndex) => ({
      choice,
      choiceIndex,
      count: answerEntries.filter((entry) => entry.choiceIndex === choiceIndex).length,
      isCorrect: choiceIndex === question.answerIndex,
    }));

    room.status = "leaderboard";
    room.currentQuestionStartedAt = null;
    room.currentQuestionEndsAt = null;
    room.lastRound = {
      questionPrompt: question.prompt,
      correctAnswerIndex: question.answerIndex,
      correctChoice: question.choices[question.answerIndex],
      answerStats,
    };

    return {
      roomCode: room.code,
      questionNumber: room.currentQuestionIndex + 1,
      totalQuestions: room.questions.length,
      questionPrompt: question.prompt,
      correctAnswerIndex: question.answerIndex,
      correctChoice: question.choices[question.answerIndex],
      answerStats,
      awards,
      leaderboard: this.buildLeaderboard(room),
      isLastQuestion: room.currentQuestionIndex === room.questions.length - 1,
    };
  }

  getRoundResultSnapshot(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "leaderboard" || !room.lastRound) {
      return null;
    }

    return {
      roomCode: room.code,
      questionNumber: room.currentQuestionIndex + 1,
      totalQuestions: room.questions.length,
      questionPrompt: room.lastRound.questionPrompt,
      correctAnswerIndex: room.lastRound.correctAnswerIndex,
      correctChoice: room.lastRound.correctChoice,
      answerStats: room.lastRound.answerStats,
      awards: [],
      leaderboard: this.buildLeaderboard(room),
      isLastQuestion: room.currentQuestionIndex === room.questions.length - 1,
    };
  }

  finalize(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return null;
    }

    room.status = "final";
    const leaderboard = this.buildLeaderboard(room);

    return {
      roomCode: room.code,
      leaderboard,
      winner: leaderboard[0] || null,
    };
  }

  setRoomQuestions(roomCode, questionPack) {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "lobby") {
      throw new Error("Questions can only be changed before the quiz starts.");
    }

    const normalizedPack = normalizeQuestionPack(questionPack);
    room.questions = normalizedPack.questions;
    room.questionPackTitle = normalizedPack.title;
    room.questionPackSource = "custom";

    return {
      title: room.questionPackTitle,
      source: room.questionPackSource,
      count: room.questions.length,
    };
  }

  resetRoomQuestions(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "lobby") {
      throw new Error("Questions can only be reset before the quiz starts.");
    }

    room.questions = buildDefaultQuestionSet();
    room.questionPackTitle = "Demo Question Pack";
    room.questionPackSource = "demo";

    return {
      title: room.questionPackTitle,
      source: room.questionPackSource,
      count: room.questions.length,
    };
  }

  removeSocket(socketId) {
    const binding = this.socketIndex.get(socketId);
    if (!binding) {
      return null;
    }

    this.socketIndex.delete(socketId);

    if (binding.role === "host") {
      const room = this.rooms.get(binding.roomCode);
      if (!room) {
        return null;
      }

      for (const player of room.players) {
        this.socketIndex.delete(player.socketId);
      }

      this.rooms.delete(room.code);
      return {
        type: "host",
        roomCode: room.code,
        playerSockets: room.players.map((player) => player.socketId),
      };
    }

    const room = this.rooms.get(binding.roomCode);
    if (!room) {
      return null;
    }

    const playerIndex = room.players.findIndex(
      (player) => player.id === binding.playerId
    );
    if (playerIndex === -1) {
      return null;
    }

    const [player] = room.players.splice(playerIndex, 1);
    room.roundAnswers.delete(player.id);
    return {
      type: "player",
      roomCode: room.code,
      playerName: player.name,
    };
  }
}

module.exports = {
  RoomManager,
  QUESTION_DURATION_SECONDS,
  normalizeRoomCode,
  normalizeQuestionPack,
};
