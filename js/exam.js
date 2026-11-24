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

  document.getElementById("headerParticipantName").textContent = `${participantName} •${appliedInstitution}`;
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
      `Ditemukan sesi ujian aktif atas nama "${participantName}" dengan sisa waktu ${Math.floor(secsLeft / 60)} menit${secsLeft % 60} detik.\n\n` +
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
      `Instansi yang dilamar mengandung kata kasar/penghinaan (${institutionProfanity.join(", ")}). ` + "Silakan perbaiki sebelum memulai ujian." ); document.getElementById("appliedInstitutionInput").focus(); return; }  const inputIssues = checkInputAnomalyPreview(nameVal, formationVal, institutionVal); if (inputIssues.length > 0) { alert( "⚠️ PERINGATAN DATA TIDAK WAJAR:\n" + inputIssues.map(item => "• " + item).join("\n") + "\n\nSistem akan tetap mencatat aktivitas, perangkat, IP publik, dan menandai data ini sebagai WARNING pada rekap." ); }  participantName = nameVal; appliedFormation = formationVal; appliedInstitution = institutionVal; examStartedAt = Date.now(); currentQuestionEnteredAt = Date.now(); isExamActive = true;  const durationMinutes = parseInt(document.getElementById("durationSelect").value, 10) \vert{}\vert{} 100; const orderMode = document.getElementById("orderSelect").value; const focusMode = (document.getElementById("subtestFocusSelect")?.value \vert{}\vert{} "ALL").toUpperCase(); const isDisability = durationMinutes === 130; let activeMinutes = durationMinutes;  examModeLabel = isDisability ? "Disabilitas (130 Menit)" : "Reguler (100 Menit)";  if (Array.isArray(customWeakQuestions) && customWeakQuestions.length > 0) { const picked = orderMode === "shuffled" ? shuffleArray(customWeakQuestions) : [...customWeakQuestions]; questionBank = picked.map((item, idx) => ({ ...item, id: idx + 1 })); examModeLabel = `${examModeLabel} • Ulangi Soal Salah & Ragu (${questionBank.length} Soal)`; } else { const defaultBank = buildDefaultQuestionBank();  function buildSubtestQuota(subtest, targetCount) { const sheetItems = questionBank.filter(q => q.subtest === subtest); const fallbackItems = defaultBank.filter(q => q.subtest === subtest);  const seenTexts = new Set(); const uniqueSheet = []; for (const item of sheetItems) { const key = String(item.question \vert{}\vert{} "").trim().toLowerCase(); if (key && !seenTexts.has(key)) { seenTexts.add(key); uniqueSheet.push({ ...item }); } }  let selected = orderMode === "shuffled" ? shuffleArray(uniqueSheet) : [...uniqueSheet]; if (selected.length > targetCount) { selected = selected.slice(0, targetCount); }  if (selected.length < targetCount) { const extraPool = orderMode === "shuffled" ? shuffleArray(fallbackItems) : [...fallbackItems]; for (const fb of extraPool) { if (selected.length >= targetCount) break; const key = String(fb.question \vert{}\vert{} "").trim().toLowerCase(); if (!seenTexts.has(key)) { seenTexts.add(key); selected.push({ ...fb }); } } let idx = 0; while (selected.length < targetCount && extraPool.length > 0) { selected.push({ ...extraPool[idx \% extraPool.length] }); idx++; } }  return orderMode === "shuffled" ? shuffleArray(selected) : selected; }  if (focusMode === "TWK") { activeMinutes = isDisability ? 33 : 25; questionBank = buildSubtestQuota("TWK", 30).map((item, idx) => ({ ...item, id: idx + 1 })); examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TWK (${activeMinutes} Menit, 30 Soal)`; } else if (focusMode === "TIU") { activeMinutes = isDisability ? 52 : 40; questionBank = buildSubtestQuota("TIU", 35).map((item, idx) => ({ ...item, id: idx + 1 })); examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TIU (${activeMinutes} Menit, 35 Soal)`; } else if (focusMode === "TKP") { activeMinutes = isDisability ? 45 : 35; questionBank = buildSubtestQuota("TKP", 45).map((item, idx) => ({ ...item, id: idx + 1 })); examModeLabel = `${isDisability ? "Disabilitas" : "Reguler"} • Fokus TKP (${activeMinutes} Menit, 45 Soal)`;
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
  el.textContent = `${String(mins).padStart(2, "0")}:${String(secs).
