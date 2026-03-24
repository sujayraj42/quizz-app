const socket = io();
const ui = window.StudyBuddyUI;

const state = {
  roomCode: null,
  roomStatus: "lobby",
  currentChoices: [],
  duration: 15,
};

const elements = {
  connectionLabel: document.getElementById("connectionLabel"),
  hostStatus: document.getElementById("hostStatus"),
  roomCode: document.getElementById("roomCode"),
  displayLink: document.getElementById("displayLink"),
  primaryAction: document.getElementById("primaryAction"),
  questionLabel: document.getElementById("questionLabel"),
  questionPrompt: document.getElementById("questionPrompt"),
  timerRing: document.getElementById("timerRing"),
  timerValue: document.getElementById("timerValue"),
  playerCount: document.getElementById("playerCount"),
  joinedPlayers: document.getElementById("joinedPlayers"),
  leaderboard: document.getElementById("leaderboard"),
  resultCard: document.getElementById("resultCard"),
  resultTitle: document.getElementById("resultTitle"),
  resultAnswer: document.getElementById("resultAnswer"),
  resultStats: document.getElementById("resultStats"),
  finalCard: document.getElementById("finalCard"),
  podium: document.getElementById("podium"),
  questionPackStatus: document.getElementById("questionPackStatus"),
  questionPackFile: document.getElementById("questionPackFile"),
  questionPackEditor: document.getElementById("questionPackEditor"),
  applyQuestionPack: document.getElementById("applyQuestionPack"),
  resetQuestionPack: document.getElementById("resetQuestionPack"),
  loadExamplePack: document.getElementById("loadExamplePack"),
  loadIndiaGkPack: document.getElementById("loadIndiaGkPack"),
};

function parseQuestionPackDraft() {
  const raw = elements.questionPackEditor.value.trim();
  if (!raw) {
    throw new Error("Paste a JSON question pack or import a file first.");
  }

  return JSON.parse(raw);
}

async function loadSamplePack() {
  const response = await fetch("/data/sample-question-pack.json");
  if (!response.ok) {
    throw new Error("Could not load the sample JSON pack.");
  }

  const payload = await response.text();
  elements.questionPackEditor.value = payload;
}

async function loadIndiaGkPack() {
  const response = await fetch("/data/india-gk-pack.json");
  if (!response.ok) {
    throw new Error("Could not load the India GK question pack.");
  }

  const payload = await response.text();
  elements.questionPackEditor.value = payload;
}

function updateQuestionPackStatus(roomState) {
  const pack = roomState.questionPack;
  if (!pack) {
    return;
  }

  elements.questionPackStatus.textContent = `${pack.title} • ${roomState.totalQuestions} questions • ${
    pack.isCustom ? "Custom" : "Demo"
  }`;
}

function syncPrimaryButton(roomState) {
  if (!state.roomCode) {
    elements.primaryAction.textContent = "Create Room";
    elements.primaryAction.disabled = false;
    return;
  }

  if (roomState.status === "lobby") {
    elements.primaryAction.textContent = "Start Quiz";
    elements.primaryAction.disabled = !roomState.canStart;
    return;
  }

  if (roomState.status === "leaderboard") {
    elements.primaryAction.textContent = roomState.hasMoreQuestions
      ? "Next Question"
      : "Show Winner";
    elements.primaryAction.disabled = false;
    return;
  }

  elements.primaryAction.textContent = "Quiz Live";
  elements.primaryAction.disabled = true;
}

function renderLobbyHint(roomState) {
  const playerNames = roomState.players.map((player) => player.name).join(", ");
  elements.questionLabel.textContent = roomState.roomCode
    ? "Waiting in lobby"
    : "Waiting for room";
  elements.questionPrompt.textContent =
    roomState.playerCount > 0
      ? `Players ready: ${playerNames}`
      : "No students joined yet. You can still start a solo demo from the host screen.";
  ui.renderChoiceTiles("answerGrid", [], {
    placeholder: "Question choices will appear here for the host display.",
  });
}

function renderRoomState(roomState) {
  state.roomStatus = roomState.status;
  elements.hostStatus.textContent = ui.humanizeStatus(roomState.status);
  elements.playerCount.textContent = roomState.playerCount;
  updateQuestionPackStatus(roomState);

  ui.renderLeaderboard("joinedPlayers", roomState.players);
  ui.renderLeaderboard("leaderboard", roomState.players);
  syncPrimaryButton(roomState);

  if (roomState.status === "lobby") {
    elements.resultCard.classList.add("hidden");
    elements.finalCard.classList.add("hidden");
    renderLobbyHint(roomState);
  }
}

elements.primaryAction.addEventListener("click", () => {
  if (!state.roomCode) {
    socket.emit("room:create");
    return;
  }

  if (state.roomStatus === "lobby") {
    socket.emit("quiz:start", { roomCode: state.roomCode });
    return;
  }

  if (state.roomStatus === "leaderboard") {
    socket.emit("quiz:next", { roomCode: state.roomCode });
  }
});

elements.applyQuestionPack.addEventListener("click", () => {
  if (!state.roomCode) {
    ui.showToast("toastHost", "Create a room before applying a custom question pack.", "error");
    return;
  }

  try {
    const questionPack = parseQuestionPackDraft();
    socket.emit("quiz:configureQuestions", {
      roomCode: state.roomCode,
      questionPack,
    });
  } catch (error) {
    ui.showToast("toastHost", error.message || "Invalid JSON question pack.", "error");
  }
});

elements.resetQuestionPack.addEventListener("click", () => {
  if (!state.roomCode) {
    ui.showToast("toastHost", "Create a room before resetting questions.", "error");
    return;
  }

  socket.emit("quiz:resetQuestions", { roomCode: state.roomCode });
});

elements.loadExamplePack.addEventListener("click", async () => {
  try {
    await loadSamplePack();
    ui.showToast("toastHost", "Sample question pack loaded into the editor.", "success");
  } catch (error) {
    ui.showToast("toastHost", error.message, "error");
  }
});

elements.loadIndiaGkPack.addEventListener("click", async () => {
  try {
    await loadIndiaGkPack();
    ui.showToast("toastHost", "India GK question pack loaded into the editor.", "success");
  } catch (error) {
    ui.showToast("toastHost", error.message, "error");
  }
});

elements.questionPackFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const text = await file.text();
  elements.questionPackEditor.value = text;
  ui.showToast("toastHost", `${file.name} loaded into the editor.`, "success");
});

socket.on("connect", () => {
  elements.connectionLabel.textContent = "Socket Connected";
});

socket.on("disconnect", () => {
  elements.connectionLabel.textContent = "Socket Offline";
});

socket.on("room:created", ({ roomCode }) => {
  state.roomCode = roomCode;
  elements.roomCode.textContent = roomCode;
  elements.displayLink.href = `/display?room=${roomCode}`;
  ui.showToast(
    "toastHost",
    `Room ${roomCode} is ready. Share the code with students.`,
    "success"
  );
});

socket.on("room:state", (roomState) => {
  if (state.roomCode && roomState.roomCode !== state.roomCode) {
    return;
  }

  if (!state.roomCode) {
    state.roomCode = roomState.roomCode;
    elements.roomCode.textContent = roomState.roomCode;
  }

  renderRoomState(roomState);
});

socket.on("quiz:question", (payload) => {
  state.roomStatus = "question";
  state.currentChoices = payload.choices;
  state.duration = payload.duration;
  elements.hostStatus.textContent = "Live Question";
  elements.resultCard.classList.add("hidden");
  elements.finalCard.classList.add("hidden");
  elements.questionLabel.textContent = `Question ${payload.questionNumber} of ${payload.totalQuestions}`;
  elements.questionPrompt.textContent = payload.prompt;
  elements.timerValue.textContent = String(payload.duration);
  ui.setTimerProgress(elements.timerRing, payload.duration, payload.duration);
  ui.renderChoiceTiles("answerGrid", payload.choices, {
    disabled: true,
    placeholder: "Choices are being broadcast to students.",
  });
});

socket.on("quiz:timer", ({ remaining, duration }) => {
  elements.timerValue.textContent = String(remaining);
  ui.setTimerProgress(elements.timerRing, remaining, duration);
});

socket.on("quiz:roundResult", (payload) => {
  state.roomStatus = "leaderboard";
  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = payload.questionPrompt;
  elements.resultAnswer.textContent = `Correct answer: ${payload.correctChoice}`;
  ui.renderChoiceTiles("answerGrid", state.currentChoices, {
    correctChoiceIndex: payload.correctAnswerIndex,
    disabled: true,
  });
  ui.renderAnswerStats("resultStats", payload.answerStats);
  ui.renderLeaderboard("leaderboard", payload.leaderboard);
});

socket.on("quiz:final", (payload) => {
  state.roomStatus = "final";
  elements.hostStatus.textContent = "Final";
  elements.finalCard.classList.remove("hidden");
  elements.resultCard.classList.add("hidden");
  elements.questionLabel.textContent = "Quiz Complete";
  elements.questionPrompt.textContent = payload.winner
    ? `${payload.winner.name} takes the crown with ${payload.winner.score} points.`
    : "Quiz complete.";
  ui.renderPodium("podium", payload.leaderboard);
  ui.renderLeaderboard("leaderboard", payload.leaderboard);
  elements.primaryAction.textContent = "Quiz Complete";
  elements.primaryAction.disabled = true;
});

socket.on("quiz:questionsUpdated", (payload) => {
  elements.questionPackStatus.textContent = `${payload.title} • ${payload.count} questions • ${
    payload.source === "custom" ? "Custom" : "Demo"
  }`;
  ui.showToast("toastHost", `${payload.title} applied to room ${state.roomCode}.`, "success");
});

socket.on("app:error", ({ message }) => {
  ui.showToast("toastHost", message, "error");
});
