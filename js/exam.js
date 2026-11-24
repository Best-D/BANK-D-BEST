function recordCurrentQuestionDuration() {
  if (!isExamActive || !currentQuestionEnteredAt) return;
  const elapsedSec = Math.max(0, Math.round((Date.now() - currentQuestionEnteredAt) / 1000));
  questionDurations[currentIndex] = (questionDurations[currentIndex] || 0) + elapsedSec;
  currentQuestionEnteredAt = Date.now();
}

function saveExamSessionToStorage() {
  if (!isExamActive) return;
  try {
    const snapshot = {
      participantName,
      appliedFormation,
      appliedInstitution,
      examModeLabel,
      examStartedAt,
      examEndTime,
      currentIndex,
      currentFilter,
      questionBank,
      userAnswers,
      doubtFlags,
      questionDurations
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn("Gagal menyimpan sesi ke localStorage:", err);
  }
}

function clearExamSessionFromStorage() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {}
}

function enterExamWorkspaceUI() {
  document.getElementById("setupScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("dashboardScreen").classList.add("hidden");
  document.getElementById("reviewSection").classList.add("hidden");
  document.getElementById("examScreen").classList.remove("hidden");

  document.getElementById("navHeaderControls").classList.add("hidden");
  const headerCtrl = document.getElementById("examHeaderControls");
  headerCtrl.classList.remove("hidden");
  headerCtrl.classList.add("flex");

  document.getElementById("headerParticipantName").textContent = `${participantName} • ${appliedInstitution}`;
  document.getElementById("headerExamMode").textContent = `${appliedFormation} (${examModeLabel})`;
}

function tryRestoreExamSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;

    const snap = JSON.parse(raw);
    if (
      !snap ||
      !Array.isArray(snap.questionBank) ||
      snap.questionBank.length === 0 ||
      !snap.examEndTime
    ) {
      clearExamSessionFromStorage();
      return false;
    }

    const secsLeft = Math.floor((Number(snap.examEndTime) - Date.now()) / 1000);

    participantName = snap.participantName || "Peserta Umum";
    appliedFormation = snap.appliedFormation || "-";
    appliedInstitution = snap.appliedInstitution || "Kementerian Pertahanan";
    examModeLabel = snap.examModeLabel || "Reguler (100 Menit)";
    examStartedAt = Number(snap.examStartedAt) || Date.now();
    examEndTime = Number(snap.examEndTime);
    questionBank = snap.questionBank;
    userAnswers = Array.isArray(snap.userAnswers)
      ? snap.userAnswers
      : new Array(questionBank.length).fill(null);
    doubtFlags = Array.isArray(snap.doubtFlags)
      ? snap.doubtFlags
      : new Array(questionBank.length).fill(false);
    questionDurations = Array.isArray(snap.questionDurations)
      ? snap.questionDurations
      : new Array(questionBank.length).fill(0);
    currentIndex = Math.min(Math.max(Number(snap.currentIndex) || 0, 0), questionBank.length - 1);
    currentFilter = snap.currentFilter || "ALL";

    if (secsLeft <= 0) {
      remainingSeconds = 0;
      isExamActive = false;
      clearExamSessionFromStorage();
      alert("Waktu ujian yang sedang berjalan telah habis saat halaman dimuat ulang. Hasil akan dikumpulkan otomatis.");
      finishExam();
      return true;
    }

    const shouldResume = confirm(
      `Ditemukan sesi ujian aktif atas nama "${participantName}" dengan sisa waktu ${Math.floor(secsLeft / 60)} menit ${secsLeft % 60} detik.\n\n` +
      "Klik OK untuk MELANJUTKAN ujian dari soal terakhir, atau Batal untuk memulai ulang dari awal."
    );

    if (!shouldResume) {
      clearExamSessionFromStorage();
      return false;
    }

    remainingSeconds = secsLeft;
    isExamActive = true;
    currentQuestionEnteredAt = Date.now();
    enterExamWorkspaceUI();
    filterNav(currentFilter);
    renderQuestion();
    renderGrid();
    startTimer();
    return true;
  } catch (err) {
    clearExamSessionFromStorage();
    return false;
  }
}

function resetAndRestartFromSetup() {
  clearInterval(timerInterval);
  isExamActive = false;
  clearExamSessionFromStorage();
  document.getElementById("reviewSection").classList.add("hidden");
  showScreen("setup");
}

function startExam(customWeakQuestions = null) {
  const nameVal = document.getElementById("participantNameInput").value.trim();
  const formationVal = document.getElementById("appliedFormationInput").value.trim();
  const institutionVal = document.getElementById("appliedInstitutionInput").value.trim();

  if (!nameVal) {
    alert("Silakan isi Nama Lengkap Peserta terlebih dahulu sebelum memulai ujian.");
    document.getElementById("participantNameInput").focus();
    return;
  }

  const profanityHits = findProfanityInName(nameVal);
  if (profanityHits.length > 0) {
    validateNameInputRealtime();
    alert(
      "⛔ NAMA DITOLAK:\n" +
      `Nama mengandung kata kasar/penghinaan (${profanityHits.join(", ")}). ` +
      "Ujian tidak dapat dimulai sebelum nama diganti dengan nama yang wajar dan sopan."
    );
    document.getElementById("participantNameInput").focus();
    return;
  }

  if (!formationVal) {
    alert("Silakan ketik Formasi yang Dilamar terlebih dahulu.");
    document.getElementById("appliedFormationInput").focus();
    return;
  }

  const formationProfanity = findProfanityInName(formationVal);
  if (formationProfanity.length > 0) {
    validateFormationInputRealtime();
    alert(
      "⛔ FORMASI DITOLAK:\n" +
      `Formasi yang dilamar mengandung kata kasar/penghinaan (${formationProfanity.join(", ")}). ` +
      "Silakan perbaiki sebelum memulai ujian."
    );
    document.getElementById("appliedFormationInput").focus();
    return;
  }

  if (!institutionVal) {
    alert("Silakan ketik Instansi yang Dilamar terlebih dahulu.");
    document.getElementById("appliedInstitutionInput").focus();
    return;
  }

  const institutionProfanity = findProfanityInName(institutionVal);
  if (institutionProfanity.length > 0) {
    validateInstitutionInputRealtime();
    alert(
      "⛔ INSTANSI DITOLAK:\n" +
      `Instansi yang dilamar mengandung kata kasar/penghinaan (${institutionProfanity.join(", ")}). ` +
      "Silakan perbaiki sebelum memulai ujian."
    );
    document.getElementById("appliedInstitutionInput").focus();
    return;
  }

  const inputIssues = checkInputAnomalyPreview(nameVal, formationVal, institutionVal);
  if (inputIssues.length > 0) {
    alert(
      "⚠️ PERINGATAN DATA TIDAK WAJAR:\n" +
      inputIssues.map(item => "• " + item).join("\n") +
      "\n\nSistem akan tetap mencatat aktivitas, perangkat, IP publik, dan menandai data ini sebagai WARNING pada rekap."
    );
  }

  participantName = nameVal;
  appliedFormation = formationVal;
  appliedInstitution = institutionVal;
  examStartedAt = Date.now();
  currentQuestionEnteredAt = Date.now();
  isExamActive = true;

  const durationMinutes = parseInt(document.getElementById("durationSelect").value, 10) || 100;
  const orderMode = document.getElementById("orderSelect").value;
  const focusMode = (document.getElementById("subtestFocusSelect")?.value || "ALL").toUpperCase();
  const isDisability = durationMinutes === 130;
  let activeMinutes = durationMinutes;

  examModeLabel = isDisability ? "Disabilitas (130 Menit)" : "Reguler (100 Menit)";

  if (Array.isArray(customWeakQuestions) && customWeakQuestions.length > 0) {
    const picked = orderMode === "shuffled" ? shuffleArray(customWeakQuestions) : [...customWeakQuestions];
    questionBank = picked.map((item, idx) => ({ ...item, id: idx + 1 }));
    examModeLabel = `${examModeLabel} • Ulangi Soal Salah & Ragu (${questionBank.length} Soal)`;
  } else {
    const defaultBank = buildDefaultQuestionBank();

    function buildSubtestQuota(subtest, targetCount) {
      const sheetItems = questionBank.filter(q => q.subtest === subtest);
      const fallbackItems = defaultBank.filter(q => q.subtest === subtest);

      const seenTexts = new Set();
      const uniqueSheet = [];
      for (const item of sheetItems) {
        const key = String(item.question || "").trim().toLowerCase();
        if (key && !seenTexts.has(key)) {
          seenTexts.add(key);
          uniqueSheet.push({ ...item });
        }
      }

      let selected = orderMode === "shuffled" ? shuffleArray(uniqueSheet) : [...uniqueSheet];
      if (selected.length > targetCount) {
        selected = selected.slice(0, targetCount);
      }

      if (selected.length < targetCount) {
        const extraPool = orderMode === "shuffled" ? shuffleArray(fallbackItems) : [...fallbackItems];
        for (const fb of extraPool) {
          if (selected.length >= targetCount) break;
          const key = String(fb.question || "").trim().toLowerCase();
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            selected.push({ ...fb });
          }
        }
        let idx = 0;
        while (selected.length < targetCount && extraPool.length > 0) {
          selected.push({ ...extraPool[idx % extraPool.length] });
          idx++;
        }
      }

      return orderMode === "shuffled" ? shuffleArray(selected) : selected;
    }

    if (focusMode === "TWK") {
      activeMinutes = isDisability ? 33 : 25;
      questionBank = buildSubtestQuota("TWK", 30).map((item, idx) => ({
        ...item,
        id: idx + 1
      }));
      examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TWK (${activeMinutes} Menit, 30 Soal)`;
    } else if (focusMode === "TIU") {
      activeMinutes = isDisability ? 52 : 40;
      questionBank = buildSubtestQuota("TIU", 35).map((item, idx) => ({
        ...item,
        id: idx + 1
      }));
      examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TIU (${activeMinutes} Menit, 35 Soal)`;
    } else if (focusMode === "TKP") {
      activeMinutes = isDisability ? 45 : 35;
      questionBank = buildSubtestQuota("TKP", 45).map((item, idx) => ({
        ...item,
        id: idx + 1
      }));
      examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TKP (${activeMinutes} Menit, 45 Soal)`;
    } else {
      const twk = buildSubtestQuota("TWK", 30);
      const tiu = buildSubtestQuota("TIU", 35);
      const tkp = buildSubtestQuota("TKP", 45);
      questionBank = [...twk, ...tiu, ...tkp].map((item, idx) => ({
        ...item,
        id: idx + 1
      }));
    }
  }

  remainingSeconds = activeMinutes * 60;
  examEndTime = Date.now() + remainingSeconds * 1000;

  userAnswers = new Array(questionBank.length).fill(null);
  doubtFlags = new Array(questionBank.length).fill(false);
  questionDurations = new Array(questionBank.length).fill(0);
  currentIndex = 0;
  currentFilter = "ALL";

  enterExamWorkspaceUI();
  saveExamSessionToStorage();
  renderQuestion();
  renderGrid();
  startTimer();
}

function retryWrongAndDoubtQuestions() {
  const sourceQ = reviewQuestions.length ? reviewQuestions : questionBank;
  const sourceA = reviewAnswers.length ? reviewAnswers : userAnswers;
  const history = getExamHistory();
  const latestWithQuestions = history.find(h => Array.isArray(h.questions) && h.questions.length > 0);

  const qList = sourceQ.length ? sourceQ : (latestWithQuestions ? latestWithQuestions.questions : []);
  const aList = sourceA.length ? sourceA : (latestWithQuestions ? latestWithQuestions.answers : []);

  if (!qList.length) {
    alert("Belum ada sesi dengan rincian soal untuk diulangi.");
    return;
  }

  const weakQuestions = [];
  qList.forEach((q, idx) => {
    const ans = aList[idx] ?? null;
    const isDoubt = Boolean(doubtFlags[idx]);
    if (q.subtest === "TKP") {
      const pts = ans === null ? 0 : Number(q.scores?.[ans] ?? 0);
      if (ans === null || pts < 5 || isDoubt) {
        weakQuestions.push({ ...q });
      }
    } else {
      if (ans === null || ans !== q.answer || isDoubt) {
        weakQuestions.push({ ...q });
      }
    }
  });

  if (!weakQuestions.length) {
    alert("Hebat! Semua soal pada sesi ini sudah terjawab dengan nilai maksimal tanpa ragu.");
    return;
  }

  if (!document.getElementById("participantNameInput").value.trim() && participantName) {
    document.getElementById("participantNameInput").value = participantName;
  }
  if (!document.getElementById("appliedFormationInput").value.trim() && appliedFormation) {
    document.getElementById("appliedFormationInput").value = appliedFormation;
  }
  if (!document.getElementById("appliedInstitutionInput").value.trim() && appliedInstitution) {
    document.getElementById("appliedInstitutionInput").value = appliedInstitution;
  }

  startExam(weakQuestions);
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingSeconds = Math.max(0, Math.floor((examEndTime - Date.now()) / 1000));
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      alert("Waktu ujian telah habis! Jawaban Anda akan dikumpulkan secara otomatis.");
      finishExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const el = document.getElementById("timerDisplay");
  el.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  if (remainingSeconds <= 300) {
    el.classList.remove("text-emerald-400");
    el.classList.add("text-rose-400");
  } else {
    el.classList.remove("text-rose-400");
    el.classList.add("text-emerald-400");
  }
}

function renderQuestion() {
  const q = questionBank[currentIndex];
  if (!q) return;

  document.getElementById("questionSubtestBadge").textContent = q.subtest;
  document.getElementById("questionCategoryLabel").textContent = q.category;
  document.getElementById("questionNumberTitle").textContent =
    `Soal No. ${currentIndex + 1} dari ${questionBank.length}`;
  document.getElementById("questionText").textContent = q.question;

  const mediaBox = document.getElementById("questionMedia");
  const safeMedia = sanitizeQuestionMedia(q.svg);
  if (safeMedia) {
    mediaBox.innerHTML = safeMedia;
    mediaBox.classList.remove("hidden");
  } else {
    mediaBox.replaceChildren();
    mediaBox.classList.add("hidden");
  }

  const container = document.getElementById("optionsContainer");
  container.replaceChildren();

  q.options.forEach((optText, idx) => {
    const isSelected = userAnswers[currentIndex] === idx;
    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = `w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
      isSelected
        ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600"
        : "bg-white border-slate-200 hover:bg-slate-50"
    }`;
    btn.onclick = () => selectOption(idx);

    const letter = document.createElement("span");
    letter.className = `w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
      isSelected
        ? "bg-blue-600 text-white"
        : "bg-slate-100 text-slate-700"
    }`;
    letter.textContent = ["A", "B", "C", "D", "E"][idx] || String(idx + 1);

    const optionText = document.createElement("span");
    optionText.className = "text-sm text-slate-800 pt-0.5";
    optionText.textContent = optText;

    btn.append(letter, optionText);
    container.appendChild(btn);
  });

  document.getElementById("prevBtn").disabled = currentIndex === 0;

  const answeredCount = userAnswers.filter(answer => answer !== null).length;
  document.getElementById("answeredCounter").textContent =
    `${answeredCount} / ${questionBank.length} Dijawab`;
}

function selectOption(optIdx) {
  const q = questionBank[currentIndex];
  if (!q || !Array.isArray(q.options) || optIdx < 0 || optIdx >= q.options.length) return;
  recordCurrentQuestionDuration();
  userAnswers[currentIndex] = optIdx;
  saveExamSessionToStorage();
  renderQuestion();
  renderGrid();
}

function toggleDoubt() {
  recordCurrentQuestionDuration();
  doubtFlags[currentIndex] = !doubtFlags[currentIndex];
  saveExamSessionToStorage();
  renderGrid();
}

function prevQuestion() {
  if (currentIndex > 0) {
    recordCurrentQuestionDuration();
    currentIndex--;
    currentQuestionEnteredAt = Date.now();
    saveExamSessionToStorage();
    renderQuestion();
    renderGrid();
  }
}

function saveAndNext() {
  recordCurrentQuestionDuration();
  if (currentIndex < questionBank.length - 1) {
    currentIndex++;
    currentQuestionEnteredAt = Date.now();
    saveExamSessionToStorage();
    renderQuestion();
    renderGrid();
  } else {
    confirmFinishExam();
  }
}

function filterNav(subtest) {
  currentFilter = subtest;
  document.querySelectorAll(".nav-filter-btn").forEach(btn => {
    if (btn.dataset.filter === subtest) {
      btn.className = "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white";
    } else {
      btn.className = "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700";
    }
  });
  if (isExamActive) saveExamSessionToStorage();
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("questionGrid");
  grid.innerHTML = "";
  questionBank.forEach((q, idx) => {
    if (currentFilter !== "ALL" && q.subtest !== currentFilter) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = idx + 1;
    btn.onclick = () => {
      recordCurrentQuestionDuration();
      currentIndex = idx;
      currentQuestionEnteredAt = Date.now();
      saveExamSessionToStorage();
      renderQuestion();
      renderGrid();
    };

    let colorClass = "bg-rose-500 text-white";
    if (doubtFlags[idx]) {
      colorClass = "bg-amber-400 text-slate-900";
    } else if (userAnswers[idx] !== null) {
      colorClass = "bg-emerald-500 text-white";
    }

    const activeRing = idx === currentIndex ? "ring-2 ring-offset-1 ring-blue-600 scale-105" : "";
    btn.className = `h-8 rounded-lg text-xs font-bold transition ${colorClass} ${activeRing}`;
    grid.appendChild(btn);
  });
}

function confirmFinishExam() {
  const unanswered = userAnswers.filter(a => a === null).length;
  const msg = unanswered > 0
    ? `Masih ada ${unanswered} soal yang belum dijawab. Apakah Anda yakin ingin mengakhiri ujian sekarang?`
    : "Apakah Anda yakin ingin mengakhiri ujian dan melihat hasil nilai Anda?";
  if (confirm(msg)) {
    finishExam();
  }
}

async function getPublicIpAddress() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal
    });
    if (!res.ok) return "Tidak terdeteksi";
    const json = await res.json();
    return json.ip ? String(json.ip).trim() : "Tidak terdeteksi";
  } catch (err) {
    return "Tidak terdeteksi";
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseDeviceInfo() {
  const ua = navigator.userAgent || "Unknown";

  let os = "OS Lainnya";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Browser Lainnya";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const deviceType = isMobile ? "Mobile/Tablet" : "Desktop/Laptop";

  return `${deviceType} • ${os} • ${browser} (${ua.slice(0, 120)})`;
}

function detectSuspiciousSubmission(payload) {
  const warnings = checkInputAnomalyPreview(
    String(payload.nama || "").trim(),
    String(payload.formasi || "").trim(),
    String(payload.instansi || "").trim()
  );

  const profanityHits = findProfanityInName(payload.nama);
  if (profanityHits.length > 0) {
    warnings.push(`Kata kasar/penghinaan pada nama (${profanityHits.join(", ")})`);
  }

  const formationHits = findProfanityInName(payload.formasi);
  if (formationHits.length > 0) {
    warnings.push(`Kata kasar/penghinaan pada formasi (${formationHits.join(", ")})`);
  }

  const institutionHits = findProfanityInName(payload.instansi);
  if (institutionHits.length > 0) {
    warnings.push(`Kata kasar/penghinaan pada instansi (${institutionHits.join(", ")})`);
  }

  if (
    payload.twk < 0 || payload.twk > 150 ||
    payload.tiu < 0 || payload.tiu > 175 ||
    payload.tkp < 0 || payload.tkp > 225 ||
    payload.total !== (payload.twk + payload.tiu + payload.tkp)
  ) {
    warnings.push("Skor tidak valid/tidak konsisten");
  }

  const elapsedSeconds = examStartedAt ? Math.floor((Date.now() - examStartedAt) / 1000) : 0;
  const answeredCount = userAnswers.filter(a => a !== null).length;
  if (answeredCount >= 20 && elapsedSeconds < 60) {
    warnings.push(`Pengerjaan terlalu cepat (${elapsedSeconds} detik untuk ${answeredCount} soal)`);
  }

  const lastSubmitTime = Number(localStorage.getItem("lastCatSubmitAt") || "0");
  const now = Date.now();
  if (lastSubmitTime && now - lastSubmitTime < 15000) {
    warnings.push("Pengiriman berulang kurang dari 15 detik");
  }
  localStorage.setItem("lastCatSubmitAt", String(now));

  return warnings;
}

function renderResultComparisonWithPrevious(currentSession) {
  const compEl = document.getElementById("resultComparisonNote");
  if (!compEl) return;

  const userSessions = getFilteredUserSessions();
  const prev = userSessions.find(s => s.id !== currentSession.id);
  if (!prev) {
    compEl.textContent = "Perbandingan Sesi: Ini sesi pertama yang tercatat untuk peserta ini.";
    compEl.classList.remove("hidden");
    return;
  }

  const diffTotal = Number(currentSession.total || 0) - Number(prev.total || 0);
  const diffTwk = Number(currentSession.twk || 0) - Number(prev.twk || 0);
  const diffTiu = Number(currentSession.tiu || 0) - Number(prev.tiu || 0);
  const diffTkp = Number(currentSession.tkp || 0) - Number(prev.tkp || 0);

  const fmtSign = (n) => (n > 0 ? `+${n}` : `${n}`);
  compEl.textContent =
    `vs. Sesi Sebelumnya (${prev.total}): Total ${fmtSign(diffTotal)} ` +
    `(TWK ${fmtSign(diffTwk)} • TIU ${fmtSign(diffTiu)} • TKP ${fmtSign(diffTkp)})`;
  compEl.classList.remove("hidden");
}

async function finishExam() {
  recordCurrentQuestionDuration();
  clearInterval(timerInterval);
  isExamActive = false;
  clearExamSessionFromStorage();

  let twkScore = 0;
  let tiuScore = 0;
  let tkpScore = 0;

  questionBank.forEach((q, idx) => {
    const ans = userAnswers[idx];
    if (ans === null) return;
    if (q.subtest === "TWK") {
      if (ans === q.answer) twkScore += 5;
    } else if (q.subtest === "TIU") {
      if (ans === q.answer) tiuScore += 5;
    } else if (q.subtest === "TKP") {
      tkpScore += (q.scores && typeof q.scores[ans] === "number") ? q.scores[ans] : 0;
    }
  });

  const totalScore = twkScore + tiuScore + tkpScore;
  const passTWK = twkScore >= 65;
  const passTIU = tiuScore >= 80;
  const passTKP = tkpScore >= 166;
  const overallPass = passTWK && passTIU && passTKP;
  const statusPG = overallPass ? "LULUS PG" : "TIDAK LULUS PG";

  document.getElementById("examScreen").classList.add("hidden");
  document.getElementById("examHeaderControls").classList.add("hidden");
  document.getElementById("examHeaderControls").classList.remove("flex");
  document.getElementById("navHeaderControls").classList.remove("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  const finishTimeLabel = new Date().toLocaleString("id-ID");
  document.getElementById("resultParticipantTitle").textContent = `Hasil Ujian: ${participantName}`;
  document.getElementById("resultFormationInfo").textContent = `${appliedFormation} • ${appliedInstitution}`;
  document.getElementById("resultMetaInfo").textContent = `${examModeLabel} • Selesai pada ${finishTimeLabel}`;
  document.getElementById("totalScoreDisplay").textContent = totalScore;

  const statusBadge = document.getElementById("resultStatusBadge");
  statusBadge.textContent = overallPass ? "MEMENUHI PASSING GRADE BKN" : "BELUM MEMENUHI PASSING GRADE";
  statusBadge.className = `inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 ${
    overallPass ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
  }`;

  document.getElementById("twkScoreVal").textContent = twkScore;
  document.getElementById("tiuScoreVal").textContent = tiuScore;
  document.getElementById("tkpScoreVal").textContent = tkpScore;

  setSubtestBadge("twkPassBadge", passTWK);
  setSubtestBadge("tiuPassBadge", passTIU);
  setSubtestBadge("tkpPassBadge", passTKP);

  const focusNoteEl = document.getElementById("resultFocusTargetNote");
  if (focusNoteEl) {
    const lowerMode = String(examModeLabel || "").toLowerCase();
    if (lowerMode.includes("fokus twk")) {
      focusNoteEl.textContent = `Target PG Subtes TWK: ${twkScore}/65 (${passTWK ? "Tercapai" : "Belum Tercapai"}) — catatan ini khusus mode fokus subtes.`;
      focusNoteEl.classList.remove("hidden");
    } else if (lowerMode.includes("fokus tiu")) {
      focusNoteEl.textContent = `Target PG Subtes TIU: ${tiuScore}/80 (${passTIU ? "Tercapai" : "Belum Tercapai"}) — catatan ini khusus mode fokus subtes.`;
      focusNoteEl.classList.remove("hidden");
    } else if (lowerMode.includes("fokus tkp")) {
      focusNoteEl.textContent = `Target PG Subtes TKP: ${tkpScore}/166 (${passTKP ? "Tercapai" : "Belum Tercapai"}) — catatan ini khusus mode fokus subtes.`;
      focusNoteEl.classList.remove("hidden");
    } else {
      focusNoteEl.textContent = "";
      focusNoteEl.classList.add("hidden");
    }
  }

  const syncStatusBox = document.getElementById("sheetSyncStatus");
  const syncText = document.getElementById("sheetSyncText");
  syncText.textContent = "Mendeteksi informasi perangkat, IP publik, dan memvalidasi data...";

  const ipAddress = await getPublicIpAddress();
  const deviceInfo = parseDeviceInfo();
  const warnings = detectSuspiciousSubmission({
    nama: participantName,
    formasi: appliedFormation,
    instansi: appliedInstitution,
    twk: twkScore,
    tiu: tiuScore,
    tkp: tkpScore,
    total: totalScore
  });
  const warningText = warnings.length > 0 ? `WARNING: ${warnings.join("; ")}` : "Normal";

  const alertBox = document.getElementById("userAnomalyAlert");
  const alertDetail = document.getElementById("userAnomalyDetail");

  if (warnings.length > 0) {
    syncStatusBox.className =
      "px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs font-medium text-amber-900 flex items-center justify-between gap-3";
    if (alertBox && alertDetail) {
      alertDetail.textContent =
        `Aktivitas atau isian Anda terdeteksi tidak wajar (${warnings.join("; ")}). Informasi perangkat (${deviceInfo.split(" (")[0]}), alamat IP (${ipAddress}), dan status warning telah dicatat ke sistem rekap.`;
      alertBox.classList.remove("hidden");
    }
  } else {
    syncStatusBox.className =
      "px-6 py-3 bg-blue-50 border-b border-blue-100 text-xs font-medium text-blue-800 flex items-center justify-between gap-3";
    if (alertBox) alertBox.classList.add("hidden");
  }

  const newAttempt = {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    nama: participantName,
    formasi: appliedFormation,
    instansi: appliedInstitution,
    mode: examModeLabel,
    twk: twkScore,
    tiu: tiuScore,
    tkp: tkpScore,
    total: totalScore,
    status_pg: statusPG,
    warning: warningText,
    waktuLabel: finishTimeLabel,
    questions: questionBank.map(q => ({ ...q })),
    answers: [...userAnswers],
    durations: [...questionDurations]
  };

  saveAttemptToHistory(newAttempt);
  renderResultComparisonWithPrevious(newAttempt);

  reviewQuestions = questionBank.map(q => ({ ...q }));
  reviewAnswers = [...userAnswers];
  reviewDurations = [...questionDurations];
  reviewOnlyWeakMode = false;
  reviewMetaLabel = `Sesi Terbaru — ${participantName} (${finishTimeLabel})`;
  updateRestoreHistoryButtons();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();

  lastExamPayload = {
    action: "submit_score",
    nama: participantName,
    formasi: appliedFormation,
    instansi: appliedInstitution,
    mode: examModeLabel,
    twk: twkScore,
    tiu: tiuScore,
    tkp: tkpScore,
    total: totalScore,
    status_pg: statusPG,
    perangkat: deviceInfo,
    ip_address: ipAddress,
    warning: warningText
  };

  sendResultsToGoogleSheet(lastExamPayload);
}

function setSubtestBadge(elId, isPass) {
  const el = document.getElementById(elId);
  el.textContent = isPass ? "LULUS" : "TIDAK LULUS";
  el.className = `text-xs font-bold px-2 py-0.5 rounded ${
    isPass ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
  }`;
}

async function sendResultsToGoogleSheet(payload) {
  if (isSubmittingScore) return;
  isSubmittingScore = true;

  const syncText = document.getElementById("sheetSyncText");
  const retryBtn = document.getElementById("retrySyncBtn");
  retryBtn.classList.add("hidden");

  const hasWarning = payload.warning && payload.warning !== "Normal";

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TEMPEL_URL")) {
    syncText.textContent = "Info: URL Google Apps Script belum ditempel pada kode HTML, hasil hanya ditampilkan di layar ini.";
    isSubmittingScore = false;
    return;
  }

  syncText.textContent = hasWarning
    ? `⚠️ Peringatan Data (${payload.warning}). Mengirim rekap nilai ke Google Sheets...`
    : "Mengirim rekap nilai ke Google Sheets...";

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result && result.status === "sukses") {
      const finalWarning = result.warning || payload.warning;
      if (finalWarning && finalWarning !== "Normal") {
        syncText.textContent =
          `⚠️ Rekap nilai terkirim ke Google Sheets dengan catatan ${finalWarning}.`;
      } else {
        syncText.textContent =
          "Rekap nilai, formasi, instansi, serta info perangkat & IP berhasil dikirim ke database Google Sheets!";
      }
    } else {
      syncText.textContent = `Gagal menyimpan ke Google Sheets: ${(result && result.pesan) || "Respons tidak valid"}.`;
      retryBtn.classList.remove("hidden");
    }
  } catch (err) {
    syncText.textContent = "Gagal mengirim rekap nilai ke Google Sheets. Periksa koneksi internet Anda.";
    retryBtn.classList.remove("hidden");
  } finally {
    isSubmittingScore = false;
  }
}

function retrySendToSheet() {
  if (lastExamPayload && !isSubmittingScore) sendResultsToGoogleSheet(lastExamPayload);
}

function populateReviewCategoryFilter(sourceQuestions) {
  const selectEl = document.getElementById("reviewCategoryFilter");
  if (!selectEl) return;

  const prevVal = selectEl.value || "ALL";
  const cats = Array.from(
    new Set(sourceQuestions.map(q => String(q.category || "Umum").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "id"));

  selectEl.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Semua Kategori";
  selectEl.appendChild(allOpt);

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    selectEl.appendChild(opt);
  });

  selectEl.value = cats.includes(prevVal) ? prevVal : "ALL";
}

function updateWeakFilterButtonUI() {
  const btn = document.getElementById("reviewOnlyWeakBtn");
  if (!btn) return;
  btn.className = reviewOnlyWeakMode
    ? "px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white"
    : "px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100";
}

function toggleReviewWeakOnly() {
  reviewOnlyWeakMode = !reviewOnlyWeakMode;
  updateWeakFilterButtonUI();
  const activeSubtest = document.querySelector(".review-subtest-btn.active-subtest")?.dataset.subtest || "ALL";
  renderReview(activeSubtest);
}

function toggleReviewSection() {
  const sec = document.getElementById("reviewSection");
  sec.classList.toggle("hidden");
  if (!sec.classList.contains("hidden")) {
    if (!reviewQuestions.length) {
      reviewQuestions = questionBank;
      reviewAnswers = userAnswers;
      reviewDurations = questionDurations;
    }
    document.getElementById("reviewSectionTitle").textContent = "Pembahasan Lengkap Soal SKD";
    document.getElementById("reviewSessionSubtitle").textContent = reviewMetaLabel;
    populateReviewCategoryFilter(reviewQuestions);
    updateWeakFilterButtonUI();
    renderReview("ALL");
  }
}

function renderReviewSubtestStats(sourceQuestions, sourceAnswers, sourceDurations) {
  const statsEl = document.getElementById("reviewSubtestStats");
  if (!statsEl) return;

  let twkTotal = 0, twkCorrect = 0, twkSec = 0;
  let tiuTotal = 0, tiuCorrect = 0, tiuSec = 0;
  let tkpTotal = 0, tkpPoints = 0, tkpSec = 0;

  sourceQuestions.forEach((q, idx) => {
    const ans = sourceAnswers[idx] ?? null;
    const sec = Number(sourceDurations[idx] || 0);
    if (q.subtest === "TWK") {
      twkTotal++;
      twkSec += sec;
      if (ans !== null && ans === q.answer) twkCorrect++;
    } else if (q.subtest === "TIU") {
      tiuTotal++;
      tiuSec += sec;
      if (ans !== null && ans === q.answer) tiuCorrect++;
    } else if (q.subtest === "TKP") {
      tkpTotal++;
      tkpSec += sec;
      if (ans !== null && Array.isArray(q.scores)) {
        tkpPoints += Number(q.scores[ans] || 0);
      }
    }
  });

  const avgTwk = twkTotal > 0 ? Math.round(twkSec / twkTotal) : 0;
  const avgTiu = tiuTotal > 0 ? Math.round(tiuSec / tiuTotal) : 0;
  const avgTkp = tkpTotal > 0 ? Math.round(tkpSec / tkpTotal) : 0;

  statsEl.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="font-bold text-slate-700">TWK</div>
      <div class="text-sm font-extrabold text-blue-700 mt-0.5">${twkCorrect} / ${twkTotal} Benar (${twkCorrect * 5} Poin)</div>
      <div class="text-[11px] text-slate-500 mt-0.5">Rata-rata waktu: ${avgTwk} dtk/soal</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="font-bold text-slate-700">TIU</div>
      <div class="text-sm font-extrabold text-blue-700 mt-0.5">${tiuCorrect} / ${tiuTotal} Benar (${tiuCorrect * 5} Poin)</div>
      <div class="text-[11px] text-slate-500 mt-0.5">Rata-rata waktu: ${avgTiu} dtk/soal</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div class="font-bold text-slate-700">TKP (${tkpTotal} Soal)</div>
      <div class="text-sm font-extrabold text-emerald-700 mt-0.5">Total ${tkpPoints} Poin</div>
      <div class="text-[11px] text-slate-500 mt-0.5">Rata-rata waktu: ${avgTkp} dtk/soal</div>
    </div>
  `;
}

function renderReviewCategoryStats(sourceQuestions, sourceAnswers) {
  const catBox = document.getElementById("reviewCategoryStats");
  if (!catBox) return;

  const map = new Map();
  sourceQuestions.forEach((q, idx) => {
    const cat = q.category || "Umum";
    if (!map.has(cat)) {
      map.set(cat, { subtest: q.subtest, total: 0, correct: 0, tkpPoints: 0 });
    }
    const entry = map.get(cat);
    entry.total++;
    const ans = sourceAnswers[idx] ?? null;
    if (q.subtest === "TKP") {
      if (ans !== null && Array.isArray(q.scores)) {
        entry.tkpPoints += Number(q.scores[ans] || 0);
      }
    } else if (ans !== null && ans === q.answer) {
      entry.correct++;
    }
  });

  catBox.replaceChildren();
  map.forEach((val, catName) => {
    const card = document.createElement("div");
    card.className = "bg-slate-50 border border-slate-200 rounded-lg px-3 py-2";
    const metricText = val.subtest === "TKP"
      ? `${val.tkpPoints} Poin (${val.total} soal)`
      : `${val.correct}/${val.total} Benar (${Math.round((val.correct / Math.max(1, val.total)) * 100)}%)`;

    card.innerHTML = `
      <div class="text-[11px] font-bold text-slate-700">${escapeHtml(catName)} <span class="text-blue-700">(${escapeHtml(val.subtest)})</span></div>
      <div class="text-xs font-extrabold text-slate-900 mt-0.5">${escapeHtml(metricText)}</div>
    `;
    catBox.appendChild(card);
  });
}

function isWeakReviewItem(q, userAns) {
  if (q.subtest === "TKP") {
    const pts = userAns === null ? 0 : Number(q.scores?.[userAns] ?? 0);
    return userAns === null || pts < 5;
  }
  return userAns === null || userAns !== q.answer;
}

function renderReview(filterSubtest) {
  document.querySelectorAll(".review-subtest-btn").forEach(btn => {
    const isMatch = btn.dataset.subtest === filterSubtest;
    btn.classList.toggle("active-subtest", isMatch);
    btn.className = `review-subtest-btn px-3 py-1 text-xs font-bold rounded-lg ${
      isMatch ? "bg-slate-800 text-white active-subtest" : "bg-slate-100 text-slate-700"
    }`;
  });

  const selectedCat = document.getElementById("reviewCategoryFilter")?.value || "ALL";
  const list = document.getElementById("reviewList");
  const letters = ["A", "B", "C", "D", "E"];
  const sourceQuestions = reviewQuestions.length ? reviewQuestions : questionBank;
  const sourceAnswers = reviewAnswers.length ? reviewAnswers : userAnswers;
  const sourceDurations = reviewDurations.length ? reviewDurations : questionDurations;

  renderReviewSubtestStats(sourceQuestions, sourceAnswers, sourceDurations);
  renderReviewCategoryStats(sourceQuestions, sourceAnswers);
  list.replaceChildren();

  sourceQuestions.forEach((q, idx) => {
    if (filterSubtest !== "ALL" && q.subtest !== filterSubtest) return;
    if (selectedCat !== "ALL" && (q.category || "Umum") !== selectedCat) return;

    const userAns = sourceAnswers[idx] ?? null;
    if (reviewOnlyWeakMode && !isWeakReviewItem(q, userAns)) return;

    const durSec = Number(sourceDurations[idx] || 0);
    const card = document.createElement("div");
    card.className =
      "p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2";

    const heading = document.createElement("div");
    heading.className = "text-xs font-bold text-blue-700 flex flex-wrap items-center justify-between gap-2";
    heading.innerHTML = `
      <span>No. ${idx + 1} • ${escapeHtml(q.subtest)} (${escapeHtml(q.category)})</span>
      <span class="text-[11px] font-semibold text-slate-500">Durasi: ${durSec} dtk</span>
    `;

    const answer = document.createElement("p");
    answer.className = "text-xs";

    if (q.subtest === "TKP") {
      const points = userAns === null ? 0 : (q.scores?.[userAns] ?? 0);
      const bestIndex = Array.isArray(q.scores) ? q.scores.indexOf(5) : -1;
      const bestAnswer =
        bestIndex >= 0 ? letters[bestIndex] : "tidak tersedia";

      answer.textContent =
        `Jawaban Anda: ${
          userAns === null
            ? "Kosong (0 poin)"
            : `${letters[userAns]} (${points} poin)`
        } • Poin tertinggi: ${bestAnswer}`;
    } else {
      const ansIdx = typeof q.answer === "number"
        ? q.answer
        : letters.indexOf(String(q.keyRaw || "A").trim().toUpperCase());
      const validAnsIdx = ansIdx >= 0 ? ansIdx : 0;

      answer.textContent =
        `Jawaban Anda: ${
          userAns === null ? "Kosong" : letters[userAns]
        } • Kunci benar: ${letters[validAnsIdx]}`;
    }

    const question = document.createElement("p");
    question.className = "text-sm text-slate-800 font-medium";
    question.textContent = q.question;

    const rawExplanation = String(q.explanation || q.pembahasan || "").trim();
    const explanation = document.createElement("p");
    explanation.className =
      "text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200";
    explanation.textContent = `Pembahasan: ${
      rawExplanation || "Pembahasan belum tersedia pada baris soal ini."
    }`;

    card.append(heading, answer, question, explanation);
    list.appendChild(card);
  });
}

window.addEventListener("beforeunload", (e) => {
  if (isExamActive) {
    recordCurrentQuestionDuration();
    saveExamSessionToStorage();
    e.preventDefault();
    e.returnValue = "Ujian simulasi CAT sedang berlangsung. Progres otomatis tersimpan jika halaman di-refresh.";
    return e.returnValue;
  }
});

window.addEventListener("keydown", (e) => {
  if (!isExamActive) return;
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
  if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key.toUpperCase();
  const optionMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  if (Object.prototype.hasOwnProperty.call(optionMap, key)) {
    e.preventDefault();
    selectOption(optionMap[key]);
    return;
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevQuestion();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    saveAndNext();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadLoggedUserFromStorage();
  updateRestoreHistoryButtons();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();

  syncHistoryFromDatabaseIfEmpty().then((synced) => {
    if (synced && synced.length > 0) {
      renderAttemptHistory();
      renderDashboardUserPreviousExams();
      renderUserScoreTrendChart();
    }
  });

  const nameInput = document.getElementById("participantNameInput");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      validateNameInputRealtime();
      renderDashboardUserPreviousExams();
      renderUserScoreTrendChart();
    });
    nameInput.addEventListener("blur", validateNameInputRealtime);
  }

  const formationInput = document.getElementById("appliedFormationInput");
  if (formationInput) {
    formationInput.addEventListener("input", validateFormationInputRealtime);
    formationInput.addEventListener("blur", validateFormationInputRealtime);
  }

  const institutionInput = document.getElementById("appliedInstitutionInput");
  if (institutionInput) {
    institutionInput.addEventListener("input", validateInstitutionInputRealtime);
    institutionInput.addEventListener("blur", validateInstitutionInputRealtime);
  }

  if (!tryRestoreExamSession()) {
    muatBankSoalDariSheet();
  } else {
    const badge = document.getElementById("scriptConfigBadge");
    if (badge && GOOGLE_SCRIPT_URL) {
      badge.textContent = "Terhubung ke Google Sheets";
      badge.className = "font-semibold text-emerald-700";
    }
  }
});
