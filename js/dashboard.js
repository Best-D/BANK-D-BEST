let fullTrendSeriesMode = "ALL";
let focusTrendSeriesMode = "ALL";

const STANDARD_EDUCATION_LEVELS = [
  "SMA/SMK/Sederajat",
  "D-I / D-II",
  "D-III",
  "D-IV",
  "S-1",
  "S-2 / Profesi",
  "S-3"
];

function safeText(val) {
  if (typeof escapeHtml === "function") return escapeHtml(val ?? "");
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeAccountKey(val) {
  if (typeof normalizeAccountKey === "function") return normalizeAccountKey(val || "");
  return String(val || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getHistoryKey() {
  return typeof HISTORY_STORAGE_KEY !== "undefined" ? HISTORY_STORAGE_KEY : "cat_skd_exam_history_v1";
}

function getBackupHistoryKey() {
  return typeof BACKUP_HISTORY_STORAGE_KEY !== "undefined" ? BACKUP_HISTORY_STORAGE_KEY : "cat_skd_exam_history_backup_v1";
}

function getScriptEndpoint() {
  return typeof GOOGLE_SCRIPT_URL !== "undefined" ? String(GOOGLE_SCRIPT_URL || "").trim() : "";
}

function formatShortDate(raw) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isFocusOrDrillMode(modeStr) {
  const m = String(modeStr || "").toLowerCase();
  return m.includes("fokus") || m.includes("ulangi");
}

function getActiveUserFilterName() {
  if (typeof loggedUser !== "undefined" && loggedUser && loggedUser.nama) {
    return String(loggedUser.nama).trim();
  }
  const inputVal = (document.getElementById("participantNameInput")?.value || "").trim();
  return inputVal;
}

function getExamHistory() {
  try {
    const raw = localStorage.getItem(getHistoryKey());
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function getBackupExamHistory() {
  try {
    const raw = localStorage.getItem(getBackupHistoryKey());
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function updateRestoreHistoryButtons() {
  const hasBackup = getBackupExamHistory().length > 0;
  document.querySelectorAll(".restore-history-btn").forEach(btn => {
    btn.classList.toggle("hidden", !hasBackup);
  });
}

function saveAttemptToHistory(attemptRecord) {
  const history = getExamHistory();
  history.unshift(attemptRecord);
  localStorage.setItem(getHistoryKey(), JSON.stringify(history.slice(0, 150)));
}

function clearLocalExamHistory() {
  const current = getExamHistory();
  if (!current.length) {
    alert("Riwayat lokal memang sudah kosong.");
    updateRestoreHistoryButtons();
    return;
  }
  if (!confirm("Hapus riwayat ujian lokal di browser ini? Cadangan sementara akan disimpan agar bisa dipulihkan jika terlanjur terhapus.")) {
    return;
  }

  localStorage.setItem(getBackupHistoryKey(), JSON.stringify(current.slice(0, 150)));
  localStorage.removeItem(getHistoryKey());

  updateRestoreHistoryButtons();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  refreshDashboardData();
}

function restoreClearedExamHistory() {
  const backup = getBackupExamHistory();
  if (!backup.length) {
    alert("Tidak ada cadangan riwayat lokal yang bisa dipulihkan.");
    return;
  }

  const existing = getExamHistory();
  const merged = [...existing];
  const seenIds = new Set(existing.map(x => x.id));

  backup.forEach(item => {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  });

  localStorage.setItem(getHistoryKey(), JSON.stringify(merged.slice(0, 150)));
  localStorage.removeItem(getBackupHistoryKey());

  updateRestoreHistoryButtons();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  refreshDashboardData();
  alert("Berhasil mengembalikan " + backup.length + " sesi riwayat ujian lokal.");
}

function mapRekapRowToSession(rec, idx) {
  const keyPart = `${safeAccountKey(rec.nama)}_${rec.total}_${String(rec.waktu || idx).replace(/\W+/g, "")}`;
  return {
    id: `db_${keyPart}`,
    nama: rec.nama || "Peserta",
    username: rec.username || "",
    pendidikan: rec.pendidikan_terakhir || rec.pendidikan || "-",
    formasi: rec.formasi || "-",
    instansi: rec.instansi || "-",
    mode: rec.mode || "Reguler",
    twk: Number(rec.twk || 0),
    tiu: Number(rec.tiu || 0),
    tkp: Number(rec.tkp || 0),
    total: Number(rec.total || 0),
    status_pg: rec.status_pg || "-",
    warning: rec.warning || "Normal",
    waktuLabel: formatShortDate(rec.waktu),
    questions: [],
    answers: [],
    durations: [],
    doubts: [],
    fromDatabase: true
