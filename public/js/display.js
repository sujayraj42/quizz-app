const socket = io();
const ui = window.StudyBuddyUI;
const bootstrap = window.STUDY_BUDDY_DISPLAY || {};

const state = {
  roomCode: String(bootstrap.roomCode || "").trim().toUpperCase(),
  currentChoices: [],
};

const elements = {
  displayRoomCode: document.getElementById("displayRoomCode"),
  displayStatus: document.getElementById("displayStatus"),
  displayQuestionLabel: document.getElementById("displayQuestionLabel"),
  displayQuestionPrompt: document.getElementById("displayQuestionPrompt"),
  displayTimerRing: document.getElementById("displayTimerRing"),
  displayTimerValue: document.getElementById("displayTimerValue"),
  displayAnswerGrid: document.getElementById("displayAnswerGrid"),
  displayResultCard: document.getElementById("displayResultCard"),
  displayResultTitle: document.getElementById("displayResultTitle"),
  displayResultAnswer: document.getElementById("displayResultAnswer"),
  displayResultStats: document.getElementById("displayResultStats"),
  displayFinalCard: document.getElementById("displayFinalCard"),
  displayFinalTitle: document.getElementById("displayFinalTitle"),
  displayPodium: document.getElementById("displayPodium"),
  displayPlayerCount: document.getElementById("displayPlayerCount"),
  displayPackInfo: document.getElementById("displayPackInfo"),
  displayLeaderboard: document.getElementById("displayLeaderboard"),
};

function renderMissingRoom() {
  elements.displayStatus.textContent = "Missing Room";
  elements.displayQuestionLabel.textContent = "No room selected";
  elements.displayQuestionPrompt.textContent =
    "Open this page with /display?room=ABCDE from the host screen.";
}

if (!state.roomCode) {
  renderMissingRoom();
} else {
  elements.displayRoomCode.textContent = state.roomCode;
}

socket.on("connect", () => {
  if (!state.roomCode) {
    return;
  }

  socket.emit("display:join", { roomCode: state.roomCode });
});

socket.on("display:joined", ({ roomCode }) => {
  state.roomCode = roomCode;
  elements.displayRoomCode.textContent = roomCode;
  elements.displayStatus.textContent = "Connected";
});

socket.on("room:state", (roomState) => {
  if (roomState.roomCode !== state.roomCode) {
    return;
  }

  elements.displayStatus.textContent = ui.humanizeStatus(roomState.status);
  elements.displayPlayerCount.textContent = roomState.playerCount;
  elements.displayPackInfo.textContent = `${roomState.questionPack.title} • ${roomState.totalQuestions} questions`;
  ui.renderLeaderboard("displayLeaderboard", roomState.players);

  if (roomState.status === "lobby") {
    elements.displayResultCard.classList.add("hidden");
    elements.displayFinalCard.classList.add("hidden");
    elements.displayQuestionLabel.textContent = "Lobby";
    elements.displayQuestionPrompt.textContent =
      roomState.playerCount > 0
        ? `${roomState.playerCount} students are ready.`
        : "Waiting for students to join.";
    ui.renderChoiceTiles("displayAnswerGrid", [], {
      placeholder: "The live question will appear here when the host starts.",
    });
  }
});

socket.on("quiz:question", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  state.currentChoices = payload.choices;
  elements.displayResultCard.classList.add("hidden");
  elements.displayFinalCard.classList.add("hidden");
  elements.displayStatus.textContent = "Live Question";
  elements.displayQuestionLabel.textContent = `Question ${payload.questionNumber} of ${payload.totalQuestions}`;
  elements.displayQuestionPrompt.textContent = payload.prompt;
  elements.displayTimerValue.textContent = String(payload.duration);
  ui.setTimerProgress(elements.displayTimerRing, payload.remaining ?? payload.duration, payload.duration);
  ui.renderChoiceTiles("displayAnswerGrid", payload.choices, { disabled: true });
});

socket.on("quiz:timer", ({ roomCode, remaining, duration }) => {
  if (roomCode !== state.roomCode) {
    return;
  }

  elements.displayTimerValue.textContent = String(remaining);
  ui.setTimerProgress(elements.displayTimerRing, remaining, duration);
});

socket.on("quiz:roundResult", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  elements.displayStatus.textContent = "Leaderboard";
  elements.displayResultCard.classList.remove("hidden");
  elements.displayResultTitle.textContent = payload.questionPrompt;
  elements.displayResultAnswer.textContent = `Correct answer: ${payload.correctChoice}`;
  ui.renderChoiceTiles("displayAnswerGrid", state.currentChoices, {
    correctChoiceIndex: payload.correctAnswerIndex,
    disabled: true,
  });
  ui.renderAnswerStats("displayResultStats", payload.answerStats);
  ui.renderLeaderboard("displayLeaderboard", payload.leaderboard);
});

socket.on("quiz:final", (payload) => {
  if (payload.roomCode !== state.roomCode) {
    return;
  }

  elements.displayStatus.textContent = "Final";
  elements.displayFinalCard.classList.remove("hidden");
  elements.displayResultCard.classList.add("hidden");
  elements.displayQuestionLabel.textContent = "Champion";
  elements.displayQuestionPrompt.textContent = payload.winner
    ? `${payload.winner.name} wins with ${payload.winner.score} points.`
    : "Quiz complete.";
  elements.displayFinalTitle.textContent = elements.displayQuestionPrompt.textContent;
  ui.renderPodium("displayPodium", payload.leaderboard);
  ui.renderLeaderboard("displayLeaderboard", payload.leaderboard);
});

socket.on("room:closed", ({ message }) => {
  elements.displayStatus.textContent = "Closed";
  elements.displayQuestionLabel.textContent = "Room closed";
  elements.displayQuestionPrompt.textContent = message;
  ui.showToast("toastDisplay", message, "error");
});

socket.on("app:error", ({ message }) => {
  ui.showToast("toastDisplay", message, "error");
});
