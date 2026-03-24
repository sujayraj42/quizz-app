(function attachStudyBuddyUI() {
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showToast(containerId, message, tone = "info") {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${tone}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("toast-exit");
      window.setTimeout(() => toast.remove(), 260);
    }, 2400);
  }

  function setTimerProgress(element, remaining, duration) {
    if (!element || !duration) {
      return;
    }

    const ratio = Math.max(Math.min(remaining / duration, 1), 0);
    element.style.setProperty("--progress", `${ratio * 100}%`);
  }

  function renderLeaderboard(containerId, players, highlightPlayerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    if (!players || players.length === 0) {
      container.innerHTML = '<div class="empty-state">No players yet.</div>';
      return;
    }

    container.innerHTML = players
      .map(
        (player) => `
          <div class="leaderboard-item ${
            player.id === highlightPlayerId ? "leaderboard-item-active" : ""
          }">
            <div class="leaderboard-left">
              <span class="leader-rank">#${player.rank}</span>
              <span class="leader-avatar" style="background:${player.color}22; color:${player.color}">
                ${escapeHtml(player.name.slice(0, 1).toUpperCase())}
              </span>
              <strong>${escapeHtml(player.name)}</strong>
            </div>
            <span class="leader-score">${player.score}</span>
          </div>
        `
      )
      .join("");
  }

  function renderChoiceTiles(containerId, choices, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    const {
      lockedChoiceIndex = null,
      correctChoiceIndex = null,
      onChoice,
      disabled = false,
      placeholder = "Waiting for the next question.",
    } = options;

    if (!choices || choices.length === 0) {
      container.innerHTML = `<div class="answer-tile placeholder">${escapeHtml(
        placeholder
      )}</div>`;
      return;
    }

    container.innerHTML = choices
      .map((choice, index) => {
        const selected = lockedChoiceIndex === index;
        const correct = correctChoiceIndex === index;
        const wrong = correctChoiceIndex !== null && selected && !correct;
        const classes = [
          "answer-tile",
          selected ? "selected" : "",
          correct ? "correct" : "",
          wrong ? "wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <button class="${classes}" data-choice-index="${index}" ${
            disabled || lockedChoiceIndex !== null ? "disabled" : ""
          }>
            <span class="choice-index">${index + 1}</span>
            <span>${escapeHtml(choice)}</span>
          </button>
        `;
      })
      .join("");

    if (typeof onChoice === "function") {
      container.querySelectorAll("[data-choice-index]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) {
            return;
          }

          onChoice(Number(button.dataset.choiceIndex));
        });
      });
    }
  }

  function renderAnswerStats(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    if (!stats || stats.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = stats
      .map(
        (item) => `
          <div class="stat-tile ${item.isCorrect ? "stat-tile-correct" : ""}">
            <span class="stat-choice">${escapeHtml(item.choice)}</span>
            <strong>${item.count}</strong>
          </div>
        `
      )
      .join("");
  }

  function renderPodium(containerId, players) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    if (!players || players.length === 0) {
      container.innerHTML = '<div class="empty-state">No podium yet.</div>';
      return;
    }

    container.innerHTML = players
      .slice(0, 3)
      .map(
        (player) => `
          <div class="podium-card podium-rank-${player.rank}">
            <div class="podium-rank">#${player.rank}</div>
            <h3>${escapeHtml(player.name)}</h3>
            <p>${player.score} pts</p>
          </div>
        `
      )
      .join("");
  }

  function humanizeStatus(status) {
    return (
      {
        lobby: "Lobby",
        question: "Live Question",
        leaderboard: "Leaderboard",
        final: "Final",
      }[status] || "Ready"
    );
  }

  window.StudyBuddyUI = {
    humanizeStatus,
    renderAnswerStats,
    renderChoiceTiles,
    renderLeaderboard,
    renderPodium,
    setTimerProgress,
    showToast,
  };
})();
