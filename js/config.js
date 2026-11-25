const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwIiNsO27aTknlW9PjlVgeSIn1ZNMxqtmg8BICRU4KNxtEkJyYnLesCBdxdTieo3NMk/exec";
const SESSION_STORAGE_KEY = "cat_skd_active_session_v1";
const AUTH_STORAGE_KEY = "cat_skd_logged_user_v1";
const USERS_STORAGE_KEY = "cat_skd_registered_users_v1";
const HISTORY_STORAGE_KEY = "cat_skd_exam_history_v1";
const BACKUP_HISTORY_STORAGE_KEY = "cat_skd_exam_history_backup_v1";

let questionBank = [];
let reviewQuestions = [];
let reviewAnswers = [];
let reviewDurations = [];
let reviewDoubts = [];
let reviewMetaLabel = "";
let reviewOnlyWeakMode = false;
let userAnswers = [];
let doubtFlags = [];
let questionDurations = [];
let currentQuestionEnteredAt = 0;
let currentIndex = 0;
let currentFilter = "ALL";
let timerInterval = null;
let remainingSeconds = 100 * 60;
let examEndTime = 0;
let loggedUser = null;
let participantName = "";
let participantEducation = "";
let appliedFormation = "";
let appliedInstitution = "";
let examModeLabel = "Reguler (100 Menit)";
let lastExamPayload = null;
let examStartedAt = 0;
let isExamActive = false;
let isSubmittingScore = false;
let dashboardRecords = [];
let dashboardScope = "ALL";
let dashboardTop10Only = false;

function normalizeAccountKey(rawName) {
  return String(rawName || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeUsernameKey(rawUser) {
  return String(rawUser || "").trim().replace(/\s+/g, "").toLowerCase();
}

function isValidEmailAddress(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(screenName) {
  if (isExamActive && screenName !== "exam") {
    alert("Ujian sedang berlangsung. Selesaikan ujian terlebih dahulu.");
    return;
  }

  document.getElementById("setupScreen").classList.toggle("hidden", screenName !== "setup");
  document.getElementById("examScreen").classList.toggle("hidden", screenName !== "exam");
  document.getElementById("resultScreen").classList.toggle("hidden", screenName !== "result");
  document.getElementById("dashboardScreen").classList.toggle("hidden", screenName !== "dashboard");

  const profileSec = document.getElementById("profileScreen");
  if (profileSec) {
    profileSec.classList.toggle("hidden", screenName !== "profile");
  }

  const reviewSec = document.getElementById("reviewSection");
  if (reviewSec && screenName !== "result") {
    reviewSec.classList.add("hidden");
  }

  const isExam = screenName === "exam";
  document.getElementById("navHeaderControls").classList.toggle("hidden", isExam);
  document.getElementById("examHeaderControls").classList.toggle("hidden", !isExam);
  if (isExam) {
    document.getElementById("examHeaderControls").classList.add("flex");
  } else {
    document.getElementById("examHeaderControls").classList.remove("flex");
  }

  if (screenName === "dashboard") {
    refreshDashboardData();
  } else if (screenName === "result") {
    updateRestoreHistoryButtons();
    renderAttemptHistory();
  }
}
