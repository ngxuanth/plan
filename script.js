(() => {
  const RETRO_PALETTE = [
    '#996652',
    '#DDA26F',
    '#DAC180',
    '#DFD8A6',
    '#729B98',
    '#567782',
  ];

  const STORAGE_KEY = 'my_retro_invite_state_v1';

  const state = {
    tonightPlace: 'Hồ Tây',
    tonightAfter: 'Về lại GS25 chơi boardgame',
    morningOption: 'opt2',
    note: '',
    confirmed: false,
  };

  // Elements
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const openBtn = document.getElementById('open-btn');
  const invitationCard = document.getElementById('invitation-card');
  const summaryPreview = document.getElementById('summary-preview');
  const noteInput = document.getElementById('my-note');
  const confirmBtn = document.getElementById('confirm-btn');
  const copyBtn = document.getElementById('copy-btn');
  const printBtn = document.getElementById('print-btn');
  const rubberStamp = document.getElementById('rubber-stamp');
  const statusMsg = document.getElementById('status-msg');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // ==================== PERSISTENCE ====================
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        if (saved.tonightPlace) state.tonightPlace = saved.tonightPlace;
        if (saved.tonightAfter) state.tonightAfter = saved.tonightAfter;
        if (saved.morningOption) state.morningOption = saved.morningOption;
        if (typeof saved.note === 'string') state.note = saved.note;
        if (typeof saved.confirmed === 'boolean') state.confirmed = saved.confirmed;
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
    envelope.classList.add('opening');

    setTimeout(() => {
      envelopeScreen.classList.add('hidden');
      invitationCard.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 680);
  }

  envelope.addEventListener('click', openInvitation);
  openBtn.addEventListener('click', openInvitation);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInvitation();
    }
  });

  // ==================== SELECTION UI SYNC ====================
  function syncUI() {
    // Sync choice chips
    document.querySelectorAll('.choice-group').forEach((group) => {
      const key = group.dataset.group;
      const currentVal = state[key];
      group.querySelectorAll('.choice-chip').forEach((chip) => {
        const isActive = chip.dataset.value === currentVal;
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-checked', String(isActive));
      });
    });

    // Sync morning option cards
    document.querySelectorAll('.option-card').forEach((card) => {
      const isActive = card.dataset.morning === state.morningOption;
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-checked', String(isActive));
    });

    // Sync note & stamp
    if (noteInput.value !== state.note) {
      noteInput.value = state.note;
    }
    rubberStamp.classList.toggle('stamped', state.confirmed);

    renderSummary();
  }

  function getMorningLabel() {
    if (state.morningOption === 'opt1') {
      return 'Option 1: Ngủ nướng nạp năng lượng';
    }
    return 'Option 2: 07:30 ăn sáng → 08:00 tham quan địa điểm free ngày lễ';
  }

  function renderSummary() {
    const rows = [
      { key: '21:00 (Tối nay)', val: 'Qua đón My' },
      { key: '21:45 – 23:30', val: `Đi dạo ở ${state.tonightPlace}` },
      { key: '23:30', val: state.tonightAfter },
      { key: 'Sáng mai', val: getMorningLabel() },
      { key: 'Trưa – Đêm mai', val: '12:00 ăn trưa → 12:30–16:00 study → 18:00 ăn tối → 19:00–đêm cafe' },
    ];

    summaryPreview.innerHTML = '';
    rows.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'summary-row';

      const keyEl = document.createElement('span');
      keyEl.className = 'summary-key';
      keyEl.textContent = item.key;

      const valEl = document.createElement('span');
      valEl.className = 'summary-val';
      valEl.textContent = item.val;

      row.append(keyEl, valEl);
      summaryPreview.appendChild(row);
    });
  }

  // Event listeners for chips
  document.querySelectorAll('.choice-group').forEach((group) => {
    const key = group.dataset.group;
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.choice-chip');
      if (!chip) return;
      state[key] = chip.dataset.value;
      state.confirmed = false;
      statusMsg.textContent = '';
      saveState();
      syncUI();
    });
  });

  // Event listeners for morning options
  document.querySelectorAll('.option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.morningOption = card.dataset.morning;
      state.confirmed = false;
      statusMsg.textContent = '';
      saveState();
      syncUI();
    });
  });

  noteInput.addEventListener('input', (e) => {
    state.note = e.target.value;
    saveState();
  });

  // ==================== CONFIRM + CONFETTI ====================
  confirmBtn.addEventListener('click', () => {
    state.confirmed = true;
    saveState();
    syncUI();
    statusMsg.textContent = 'Đã đóng dấu chốt kèo! Bấm "Sao chép lịch đã chọn" để gửi lại tin nhắn nhé ♥';
    launchRetroConfetti();
  });

  function buildShareText() {
    const lines = [
      '✨ LỊCH HẸN ĐÃ CHỐT — GỬI MY ✨',
      '',
      '🌙 TỐI NAY:',
      '• 21:00: Qua đón My',
      `• 21:45 – 23:30: Đi dạo ở ${state.tonightPlace}`,
      `• 23:30: ${state.tonightAfter}`,
      '',
      '☀️ NGÀY MAI:',
      state.morningOption === 'opt1'
        ? '• Sáng (Opt 1): Ngủ'
        : '• Sáng (Opt 2): 07:30 ăn sáng → 08:00 tham quan địa điểm vui chơi free ngày lễ',
      '• 12:00 – 12:30: Ăn trưa',
      '• 12:30 – 16:00: Study ở chỗ hôm nọ',
      '• 18:00 – 19:00: Ăn tối',
      '• 19:00 – Đêm: Cafe',
    ];

    if (state.note.trim()) {
      lines.push('', `💌 Ghi chú: ${state.note.trim()}`);
    }

    return lines.join('\n');
  }

  copyBtn.addEventListener('click', async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      statusMsg.textContent = 'Đã sao chép lịch hẹn vào clipboard!';
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      statusMsg.textContent = 'Đã sao chép lịch hẹn vào clipboard!';
    }
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // ==================== RETRO CONFETTI ====================
  let animFrameId = null;

  function launchRetroConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = Array.from({ length: 75 }, () => ({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 140,
      w: 7 + Math.random() * 7,
      h: 5 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 3.4,
      vy: 2.6 + Math.random() * 3.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.16,
      color: RETRO_PALETTE[Math.floor(Math.random() * RETRO_PALETTE.length)],
      alpha: 1,
    }));

    if (animFrameId) cancelAnimationFrame(animFrameId);

    function frame() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.rot += p.vRot;
        if (p.y > confettiCanvas.height * 0.78) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }
        if (p.alpha > 0 && p.y < confettiCanvas.height + 30) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive) {
        animFrameId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        animFrameId = null;
      }
    }

    animFrameId = requestAnimationFrame(frame);
  }

  // Init
  loadState();
  syncUI();
})();
