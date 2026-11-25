const FAVORITE_QUESTIONS_KEY = "cat_skd_favorite_questions_v1";
let reviewOnlyFavoriteMode = false;

function getFavoriteQuestionIds() {
  try {
    const raw = localStorage.getItem(FAVORITE_QUESTIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function getQuestionBookmarkKey(q) {
  const sub = String(q?.subtest || "").trim().toUpperCase();
  const cat = String(q?.category || "").trim().toLowerCase();
  const text = String(q?.question || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
  return `${sub}|${cat}|${text}`;
}

function isQuestionFavorited(q) {
  const key = getQuestionBookmarkKey(q);
  return getFavoriteQuestionIds().includes(key);
}

function toggleFavoriteQuestion(q) {
  const key = getQuestionBookmarkKey(q);
  if (!key) return;
  const current = getFavoriteQuestionIds();
  const exists = current.includes(key);
  const next = exists ? current.filter(k => k !== key) : [...current, key];
  localStorage.setItem(FAVORITE_QUESTIONS_KEY, JSON.stringify(next));

  const activeSub = document.querySelector(".review-subtest-btn.active-subtest")?.dataset.subtest || "ALL";
  if (typeof renderReview === "function") {
    renderReview(activeSub);
  }
}

function toggleReviewFavoriteOnly() {
  reviewOnlyFavoriteMode = !reviewOnlyFavoriteMode;
  const btn = document.getElementById("reviewOnlyFavoriteBtn");
  if (btn) {
    btn.className = reviewOnlyFavoriteMode
      ? "px-3 py-1 text-xs font-bold rounded-lg bg-amber-600 text-white"
      : "px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100";
  }
  const activeSub = document.querySelector(".review-subtest-btn.active-subtest")?.dataset.subtest || "ALL";
  if (typeof renderReview === "function") {
    renderReview(activeSub);
  }
}

async function reportQuestionToSheet(q, questionNumber) {
  const note = prompt(
    `Laporkan kendala pada Soal No. ${questionNumber} (${q.subtest || "-"} • ${q.category || "-"}):\n` +
    "Tuliskan catatan (misal: salah ketik opsi, kunci jawaban kurang tepat, atau ambigu):"
  );
  if (note === null) return;
  const cleanNote = String(note || "").trim();
  if (cleanNote.length < 5) {
    alert("Tuliskan catatan laporan minimal 5 karakter agar mudah diperiksa.");
    return;
  }

  const endpoint = typeof GOOGLE_SCRIPT_URL !== "undefined" ? String(GOOGLE_SCRIPT_URL || "").trim() : "";
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    alert("Laporan dicatat lokal. Hubungkan GOOGLE_SCRIPT_URL agar terkirim ke tab LaporanSoal di Google Sheets.");
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "report_question",
        nomor_soal: questionNumber,
        subtest: q.subtest || "-",
        category: q.category || "-",
        question: String(q.question || "").slice(0, 500),
        catatan: cleanNote,
        pelapor: (typeof loggedUser !== "undefined" && loggedUser?.nama) || participantName || "Peserta"
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      alert("Terima kasih, laporan soal berhasil dikirim ke tab LaporanSoal di Google Sheets.");
    } else {
      alert("Laporan belum terkirim: " + ((json && json.pesan) || "periksa deployment Apps Script."));
    }
  } catch (err) {
    alert("Gagal mengirim laporan soal. Periksa koneksi internet Anda.");
  }
}

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
      participantEducation,
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

  const eduTag = participantEducation ? ` (${participantEducation})` : "";
  document.getElementById("headerParticipantName").textContent = `${participantName}${eduTag} • ${appliedInstitution}`;
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
    participantEducation = snap.participantEducation || (loggedUser?.pendidikan || "-");
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
  if (!loggedUser || !loggedUser.nama) {
    alert(
      "Silakan Daftar Akun atau Login terlebih dahulu pada bagian Akun Peserta Unik sebelum memulai ujian."
    );
    switchAuthMode("login");
    document.getElementById("loginUsernameInput")?.focus();
    return;
  }

  const educationVal = (document.getElementById("participantEducationSelect")?.value || loggedUser.pendidikan || "").trim();
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

  if (!educationVal) {
    alert("Silakan pilih Pendidikan Terakhir Anda terlebih dahulu.");
    document.getElementById("participantEducationSelect")?.focus();
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
      inputIssues.
