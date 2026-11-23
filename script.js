(() => {
  const STORAGE_KEY = "my_retro_invite_state_v1";

  const state = {
    tonightPlace: "Hồ Tây",
    tonightAfter: "Về lại GS25 chơi boardgame",
    morningOption: "opt2",
  };

  // Elements
  const envelopeScreen = document.getElementById("envelope-screen");
  const envelope = document.getElementById("envelope");
  const openBtn = document.getElementById("open-btn");
  const invitationCard = document.getElementById("invitation-card");

  // ==================== PERSISTENCE ====================
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        if (saved.tonightPlace) state.tonightPlace = saved.tonightPlace;
        if (saved.tonightAfter) state.tonightAfter = saved.tonightAfter;
        if (saved.morningOption) state.morningOption = saved.morningOption;
      }
    } catch (_) {
      // Ignore storage restrictions
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // Ignore storage restrictions
    }
  }

  // ==================== ENVELOPE TRANSITION ====================
  let envelopeOpened = false;

  function openInvitation() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelope.classList.add("opening");

    setTimeout(() => {
      envelopeScreen.classList.add("hidden");
      invitationCard.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 680);
  }

  envelope.addEventListener("click", openInvitation);
  openBtn.addEventListener("click", openInvitation);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  // ==================== SELECTION UI SYNC ====================
  function syncUI() {
    document.querySelectorAll(".choice-group").forEach((group) => {
      const key = group.dataset.group;
      const currentVal = state[key];
      group.querySelectorAll(".choice-chip").forEach((chip) => {
        const isActive = chip.dataset.value === currentVal;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-checked", String(isActive));
      });
    });

    document.querySelectorAll(".option-card").forEach((card) => {
      const isActive = card.dataset.morning === state.morningOption;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-checked", String(isActive));
    });
  }

  // Event listeners for chips
  document.querySelectorAll(".choice-group").forEach((group) => {
    const key = group.dataset.group;
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".choice-chip");
      if (!chip) return;
      state[key] = chip.dataset.value;
      saveState();
      syncUI();
    });
  });

  // Event listeners for morning options
  document.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.morningOption = card.dataset.morning;
      saveState();
      syncUI();
    });
  });

  // Init
  loadState();
  syncUI();
})();
