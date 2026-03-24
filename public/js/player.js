const socket = io();
const ui = window.StudyBuddyUI;
const bootstrap = window.STUDY_BUDDY_BOOTSTRAP || {};

const state = {
  roomCode: String(bootstrap.roomCode || "").trim().toUpperCase(),
  playerName: String(bootstrap.playerName || "").trim(),
  playerId: null,
  lockedChoiceIndex: null,
};

const elements = {
  playerStatus: document.getElementById("playerStatus"),
  playerRoomCode: document.getElementById("playerRoomCode"),
  playerTitle: document.getElementById("playerTitle"),
  playerQuestionLabel: document.getElementById("playerQuestionLabel"),
  playerQuestionPrompt: document.getElementById("playerQuestionPrompt"),
  playerTimerRing: document.getElementById("playerTimerRing"),
  playerTimerValue: document.getElementById("playerTimerValue"),
  playerFeedback: document.getElementById("playerFeedback"),
  playerLeaderboard: document.getElementById("playerLeaderboard"),
  playerRank: document.getElementById("playerRank"),
  scoreBanner: document.getElementById("scoreBanner"),
  playerFinalCard: document.getElementById("playerFinalCard"),
  playerFinalTitle: document.getElementById("playerFinalTitle"),
  playerPodium: document.getElementById("playerPodium"),
};

function renderMissingParams() {
  elements.playerStatus.textContent = "Missing Details";
  elements.playerQuestionLabel.textContent = "Join unavailable";
  elements.playerQuestionPrompt.textContent =
    "Open the landing page and join using a room code and name.";
  ui.renderChoiceTiles("playerAnswerGrid", [], {
    placeholder: "Return to the landing page and rejoin the room.",
  });
}

function renderLeaderboardDetails(players) {
  ui.renderLeaderboard("playerLeaderboard", players, state.playerId);
  const me = players.find((player) => player.id === state.playerId);
  if (!me) {
    return;
  }

  elements.playerRank.textContent = `#${me.rank}`;
  elements.scoreBanner.textContent = `${me.name} • ${me.score} points`;
}

if (!state.roomCode || !state.playerName) {
  renderMissingParams();
} else {
  elements.playerRoomCode.textContent = state.roomCode;
  elements.playerTitle.textContent = state.playerName;
}

socket.on("connect", () => {
  if (!state.roomCode || !state.playerName) {
    return;
  }

  socket.emit("room:join", {
    roomCode: state.roomCode,
    name: state.playerName,
  });
});

socket.on("room:joined", ({ playerId, roomCode, playerName }) => {
  state.playerId = playerId;
  state.roomCode = roomCode;
  state.playerName = playerName;
  elements.playerStatus.textContent = "Lobby";
  elements.playerRoomCode.textContent = roomCode;
  elements.playerTitle.textContent = playerName;
  elements.playerQuestionLabel.textContent = "Joined room";
  elements.playerQuestionPrompt.textContent =
    "You are in. Wait for the host to launch the first question.";
  ui.showToast("toastPlayer", `Joined room ${roomCode}.`, "success");
});

socket.on("room:state", (roomState) => {
  if (roomState.roomCode !== state.roomCode) {
    return;
  }

  elements.playerStatus.textContent = ui.humanizeStatus(roomState.status);
  renderLeaderboardDetails(roomState.players);

  if (roomState.status === "lobby") {
    elements.playerQuestionLabel.textContent = "Lobby";
    elements.playerQuestionPrompt.textContent =
      "Teacher has not started the quiz yet. Stay ready.";
    elements.playerFeedback.textContent = `${roomState.playerCount} players are ready in the room.`;
  }
});

socket.on("quiz:question", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  state.lockedChoiceIndex = null;
  elements.playerFinalCard.classList.add("hidden");
  elements.playerStatus.textContent = "Live Question";
  elements.playerQuestionLabel.textContent = `Question ${payload.questionNumber} of ${payload.totalQuestions}`;
  elements.playerQuestionPrompt.textContent = payload.prompt;
  elements.playerFeedback.textContent = "Select one answer before the timer ends.";
  elements.playerTimerValue.textContent = String(payload.duration);
  ui.setTimerProgress(elements.playerTimerRing, payload.duration, payload.duration);
  ui.renderChoiceTiles("playerAnswerGrid", payload.choices, {
    onChoice(choiceIndex) {
      state.lockedChoiceIndex = choiceIndex;
      socket.emit("quiz:answer", {
        roomCode: state.roomCode,
        choiceIndex,
      });
      ui.renderChoiceTiles("playerAnswerGrid", payload.choices, {
        lockedChoiceIndex: state.lockedChoiceIndex,
        disabled: true,
      });
    },
  });
});

socket.on("quiz:timer", ({ roomCode, remaining, duration }) => {
  if (roomCode !== state.roomCode) {
    return;
  }

  elements.playerTimerValue.textContent = String(remaining);
  ui.setTimerProgress(elements.playerTimerRing, remaining, duration);
});

socket.on("quiz:answerAck", () => {
  elements.playerFeedback.textContent = "Answer locked in. Hold your position.";
});

socket.on("quiz:roundResult", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  const myAward = payload.awards.find((award) => award.playerId === state.playerId);
  const feedback = myAward
    ? myAward.correct
      ? `Correct. You earned ${myAward.pointsAwarded} points.`
      : "Not this round. Regroup for the next question."
    : "Round finished.";

  elements.playerStatus.textContent = "Leaderboard";
  elements.playerQuestionLabel.textContent = "Round reveal";
  elements.playerQuestionPrompt.textContent = `Correct answer: ${payload.correctChoice}`;
  elements.playerFeedback.textContent = feedback;
  ui.renderChoiceTiles(
    "playerAnswerGrid",
    payload.answerStats.map((item) => item.choice),
    {
      lockedChoiceIndex: state.lockedChoiceIndex,
      correctChoiceIndex: payload.correctAnswerIndex,
      disabled: true,
    }
  );
  renderLeaderboardDetails(payload.leaderboard);
});

socket.on("quiz:final", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  const winner = payload.winner ? `${payload.winner.name} wins the room.` : "Quiz finished.";
  elements.playerStatus.textContent = "Final";
  elements.playerQuestionLabel.textContent = "Final result";
  elements.playerQuestionPrompt.textContent = winner;
  elements.playerFeedback.textContent = "Thanks for playing Study-Buddy.";
  elements.playerFinalCard.classList.remove("hidden");
  elements.playerFinalTitle.textContent = winner;
  ui.renderPodium("playerPodium", payload.leaderboard);
  renderLeaderboardDetails(payload.leaderboard);
});

socket.on("room:closed", ({ message }) => {
  elements.playerStatus.textContent = "Closed";
  elements.playerQuestionLabel.textContent = "Room closed";
  elements.playerQuestionPrompt.textContent = message;
  ui.showToast("toastPlayer", message, "error");
});

socket.on("app:error", ({ message }) => {
  ui.showToast("toastPlayer", message, "error");
});
