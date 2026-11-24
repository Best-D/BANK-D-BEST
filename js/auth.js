const PROFANITY_CONFIG = {
  prefixOrExactWords: [
    "anjing", "anj", "anjg", "anjir", "njir", "anjay", "njay",
    "anjrit", "njrit", "anying", "anyg",
    "bangsat", "bngst", "bgst", "bgsd",
    "bajingan", "kampret", "keparat", "brengsek", "bedebah",
    "tolol", "goblok", "goblog", "ngentot", "ngentd", "entot", "entod",
    "kontol", "kntl", "memek", "mmk", "pepek", "jembut",
    "jancok", "jancuk", "dancok", "bangke", "bangkai", "taik", "laknat", "bejad"
  ],
  exactOnlyWords: [
    "babi", "asu", "monyet", "kunyuk", "kebo", "onta",
    "bego", "idiot", "bodoh", "dungu", "oon", "sialan", "tai", "cok", "cuk"
  ],
  compactWords: [
    "anjing", "anjir", "anjay", "anjrit", "anying",
    "bangsat", "bajingan", "kampret", "keparat", "brengsek",
    "tolol", "goblok", "goblog", "ngentot", "kontol", "memek",
    "pepek", "jembut", "jancok", "jancuk", "dancok", "bangkai"
  ]
};

function normalizeForProfanityCheck(text) {
  let cleaned = String(text || "")
    .toLowerCase()
    .replace(/4|@/g, "a")
    .replace(/3/g, "e")
    .replace(/1|!|\|/g, "i")
    .replace(/0/g, "o")
    .replace(/5|\$/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned.replace(/([a-z])\1{2,}/g, "$1");
  cleaned = cleaned.replace(/\b([a-z])(?:\s+([a-z])){2,}\b/g, (match) =>
    match.replace(/\s+/g, "")
  );

  return cleaned;
}

function findProfanityInName(rawText) {
  const normalized = normalizeForProfanityCheck(rawText);
  if (!normalized) return [];

  const tokens = normalized.split(" ").filter(Boolean);
  const hits = new Set();

  for (const token of tokens) {
    for (const bad of PROFANITY_CONFIG.prefixOrExactWords) {
      if (
        token === bad ||
        (bad.length >= 3 && token.startsWith(bad) && token.length <= bad.length + 4)
      ) {
        hits.add(bad);
      }
    }
    for (const exactBad of PROFANITY_CONFIG.exactOnlyWords) {
      if (token === exactBad) {
        hits.add(exactBad);
      }
    }
  }

  const compact = normalized.replace(/\s+/g, "");
  for (const strictWord of PROFANITY_CONFIG.compactWords) {
    if (compact.includes(strictWord)) {
      hits.add(strictWord);
    }
  }

  return Array.from(hits);
}

function validateFieldProfanityRealtime(inputId, warningId, fieldLabel) {
  const inputEl = document.getElementById(inputId);
  const warnEl = document.getElementById(warningId);
  if (!inputEl || !warnEl) return true;

  const hits = findProfanityInName(inputEl.value);
  if (hits.length > 0) {
    warnEl.textContent =
      `⚠️ ${fieldLabel} tidak diperbolehkan: terdeteksi kata kasar/penghinaan ("${hits.join(", ")}"). Silakan gunakan isian yang sopan.`;
    warnEl.classList.remove("hidden");
    inputEl.classList.remove("border-slate-300", "focus:ring-blue-600", "focus:border-blue-600");
    inputEl.classList.add("border-rose-500", "bg-rose-50/40", "focus:ring-rose-500", "focus:border-rose-500");
    return false;
  } else {
    warnEl.textContent = "";
    warnEl.classList.add("hidden");
    inputEl.classList.remove("border-rose-500", "bg-rose-50/40", "focus:ring-rose-500", "focus:border-rose-500");
    inputEl.classList.add("border-slate-300", "focus:ring-blue-600", "focus:border-blue-600");
    return true;
  }
}

function validateNameInputRealtime() {
  return validateFieldProfanityRealtime(
    "participantNameInput",
    "nameProfanityWarning",
    "Nama peserta"
  );
}

function validateFormationInputRealtime() {
  return validateFieldProfanityRealtime(
    "appliedFormationInput",
    "formationProfanityWarning",
    "Formasi yang dilamar"
  );
}

function validateInstitutionInputRealtime() {
  return validateFieldProfanityRealtime(
    "appliedInstitutionInput",
    "institutionProfanityWarning",
    "Instansi yang dilamar"
  );
}

function checkInputAnomalyPreview(nameVal, formationVal, institutionVal) {
  const issues = [];
  if (nameVal.length < 3 || /^[^a-zA-Z\s]+$/.test(nameVal)) {
    issues.push("Nama peserta terlalu singkat atau tidak menggunakan huruf wajar");
  }
  if (
    /(.)\1{4,}/.test(nameVal) ||
    /(.)\1{4,}/.test(formationVal) ||
    /(.)\1{4,}/.test(institutionVal)
  ) {
    issues.push("Terdapat karakter berulang secara tidak wajar");
  }
  if (/^(tes|test|asdf|qwer|xxx|zzz|admin|user|abc|123)+$/i.test(nameVal)) {
    issues.push("Nama terindikasi sebagai isian uji coba/acak");
  }
  if (formationVal.length < 3 || institutionVal.length < 3) {
    issues.push("Formasi atau instansi terlalu singkat");
  }
  if (/^[^a-zA-Z\s]+$/.test(formationVal) || /^[^a-zA-Z\s]+$/.test(institutionVal)) {
    issues.push("Formasi atau instansi tidak menggunakan huruf wajar");
  }
  return issues;
}

async function hashSecretValue(value) {
  const clean = String(value || "");
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    const buf = new TextEncoder().encode(clean);
    const digest = await window.crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fb_${(h >>> 0).toString(16)}`;
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function showAuthFeedback(message, isError = false) {
  const el = document.getElementById("authFeedbackText");
  if (!el) return;
  el.textContent = message;
  el.className = `text-xs font-semibold mt-2.5 ${
    isError ? "text-rose-600" : "text-emerald-700"
  }`;
  el.classList.remove("hidden");
}

function switchAuthMode(mode) {
  const loginPanel = document.getElementById("loginModePanel");
  const regPanel = document.getElementById("registerModePanel");
  const resetPanel = document.getElementById("resetModePanel");

  const tabLogin = document.getElementById("tabLoginBtn");
  const tabReg = document.getElementById("tabRegisterBtn");
  const tabReset = document.getElementById("tabResetBtn");

  loginPanel.classList.toggle("hidden", mode !== "login");
  regPanel.classList.toggle("hidden", mode !== "register");
  regPanel.classList.toggle("grid", mode === "register");
  resetPanel.classList.toggle("hidden", mode !== "reset");

  const activeCls = "px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm";
  const idleCls = "px-3 py-1.5 rounded-lg text-slate-700";

  tabLogin.className = mode === "login" ? activeCls : idleCls;
  tabReg.className = mode === "register" ? activeCls : idleCls;
  tabReset.className = mode === "reset" ? activeCls : idleCls;

  document.getElementById("authFeedbackText").classList.add("hidden");
}

async function postAuthToSheet(payload) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TEMPEL_URL")) {
    return { offline: true };
  }
  const res = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function handleRegisterSubmit() {
  const rawName = document.getElementById("regUsernameInput").value.trim();
  const emailVal = document.getElementById("regEmailInput").value.trim().toLowerCase();
  const passVal = document.getElementById("regPasswordInput").value;

  if (!rawName || rawName.length < 3) {
    showAuthFeedback("Nama akun minimal 3 karakter.", true);
    return;
  }
  if (findProfanityInName(rawName).length > 0) {
    showAuthFeedback("Nama akun mengandung kata tidak sopan.", true);
    return;
  }
  if (!isValidEmailAddress(emailVal)) {
    showAuthFeedback("Masukkan alamat email yang valid.", true);
    return;
  }
  if (!passVal || passVal.length < 6) {
    showAuthFeedback("Password minimal 6 karakter.", true);
    return;
  }

  const key = normalizeAccountKey(rawName);
  const users = getRegisteredUsers();
  if (users.some(u => normalizeAccountKey(u.nama) === key || String(u.email || "").toLowerCase() === emailVal)) {
    showAuthFeedback("Nama akun atau email sudah terdaftar. Silakan login atau gunakan isian unik lain.", true);
    return;
  }

  const passwordHash = await hashSecretValue(passVal);

  try {
    const remote = await postAuthToSheet({
      action: "register",
      nama: rawName,
      nama_key: key,
      email: emailVal,
      password_hash: passwordHash
    });
    if (remote && remote.status === "error") {
      showAuthFeedback(remote.pesan || "Gagal mendaftarkan akun di Google Sheets.", true);
      return;
    }
  } catch (err) {
    console.warn("Sinkronisasi daftar akun ke Sheet gagal.", err);
  }

  users.push({
    id: `usr_${Date.now()}`,
    nama: rawName,
    email: emailVal,
    passwordHash,
    createdAt: new Date().toISOString()
  });
  saveRegisteredUsers(users);

  loggedUser = { nama: rawName, email: emailVal };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
  document.getElementById("participantNameInput").value = rawName;
  document.getElementById("regPasswordInput").value = "";

  applyLoggedUserToUI();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  showAuthFeedback(`Akun "${rawName}" (${emailVal}) berhasil didaftarkan.`);
}

async function handleLoginSubmit() {
  const identifier = document.getElementById("loginUsernameInput").value.trim().toLowerCase();
  const passVal = document.getElementById("loginPasswordInput").value;

  if (!identifier || !passVal) {
    showAuthFeedback("Masukkan nama akun/email dan password.", true);
    return;
  }

  const passwordHash = await hashSecretValue(passVal);

  try {
    const remote = await postAuthToSheet({
      action: "login",
      identifier,
      password_hash: passwordHash
    });
    if (remote && remote.status === "sukses") {
      const resolvedName = remote.nama || identifier;
      loggedUser = { nama: resolvedName, email: remote.email || "" };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      document.getElementById("participantNameInput").value = resolvedName;
      document.getElementById("loginPasswordInput").value = "";
      applyLoggedUserToUI();
      renderAttemptHistory();
      renderDashboardUserPreviousExams();
      renderUserScoreTrendChart();
      showAuthFeedback(`Selamat datang kembali, ${resolvedName}.`);
      return;
    }
    if (remote && remote.status === "error") {
      showAuthFeedback(remote.pesan || "Nama akun/email atau password salah.", true);
      return;
    }
  } catch (err) {
    console.warn("Login ke Sheet gagal, memeriksa cache lokal.", err);
  }

  const users = getRegisteredUsers();
  const found = users.find(u =>
    normalizeAccountKey(u.nama) === identifier ||
    String(u.email || "").toLowerCase() === identifier
  );
  if (!found || passwordHash !== found.passwordHash) {
    showAuthFeedback("Nama akun/email atau password salah. Gunakan tab Reset Password jika lupa.", true);
    return;
  }

  loggedUser = { nama: found.nama, email: found.email || "" };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
  document.getElementById("participantNameInput").value = found.nama;
  document.getElementById("loginPasswordInput").value = "";
  applyLoggedUserToUI();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  showAuthFeedback(`Selamat datang kembali, ${found.nama} (Mode Lokal).`);
}

async function handleRequestResetOtp() {
  const emailVal = document.getElementById("resetEmailInput").value.trim().toLowerCase();
  if (!isValidEmailAddress(emailVal)) {
    showAuthFeedback("Masukkan alamat email terdaftar yang valid.", true);
    return;
  }

  const btn = document.getElementById("sendResetOtpBtn");
  btn.disabled = true;
  btn.textContent = "Mengirim...";

  try {
    const remote = await postAuthToSheet({
      action: "request_reset_otp",
      email: emailVal
    });
    if (remote && remote.status === "sukses") {
      showAuthFeedback(remote.pesan || `Kode reset dikirim ke ${emailVal}. Cek kotak masuk atau folder Spam.`);
    } else {
      showAuthFeedback((remote && remote.pesan) || "Gagal mengirim kode reset ke email.", true);
    }
  } catch (err) {
    showAuthFeedback("Gagal terhubung ke layanan email Apps Script. Periksa koneksi atau deployment Web App.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Kirim Kode ke Email";
  }
}

async function handleConfirmResetOtp() {
  const emailVal = document.getElementById("resetEmailInput").value.trim().toLowerCase();
  const otpVal = document.getElementById("resetOtpInput").value.trim();
  const newPassVal = document.getElementById("resetNewPasswordInput").value;

  if (!isValidEmailAddress(emailVal) || !otpVal || !newPassVal) {
    showAuthFeedback("Lengkapi email, kode 6 digit dari email, dan password baru.", true);
    return;
  }
  if (newPassVal.length < 6) {
    showAuthFeedback("Password baru minimal 6 karakter.", true);
    return;
  }

  const newPasswordHash = await hashSecretValue(newPassVal);

  try {
    const remote = await postAuthToSheet({
      action: "confirm_reset_otp",
      email: emailVal,
      otp_code: otpVal,
      new_password_hash: newPasswordHash
    });
    if (remote && remote.status === "sukses") {
      const users = getRegisteredUsers();
      const idx = users.findIndex(u => String(u.email || "").toLowerCase() === emailVal);
      if (idx !== -1) {
        users[idx].passwordHash = newPasswordHash;
        saveRegisteredUsers(users);
      }

      document.getElementById("resetOtpInput").value = "";
      document.getElementById("resetNewPasswordInput").value = "";
      document.getElementById("loginUsernameInput").value = remote.nama || emailVal;
      switchAuthMode("login");
      showAuthFeedback(remote.pesan || "Password berhasil diubah. Silakan login.");
      return;
    }
    showAuthFeedback((remote && remote.pesan) || "Kode reset tidak valid atau kedaluwarsa.", true);
  } catch (err) {
    showAuthFeedback("Gagal memverifikasi kode reset. Coba beberapa saat lagi.", true);
  }
}

function loadLoggedUserFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.nama) {
      loggedUser = { nama: parsed.nama, email: parsed.email || "" };
      applyLoggedUserToUI();
    }
  } catch (err) {}
}

function applyLoggedUserToUI() {
  const badge = document.getElementById("activeSessionBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const formsBox = document.getElementById("authFormsContainer");
  const bannerBox = document.getElementById("loggedInAccountBanner");
  const detailEl = document.getElementById("loggedInAccountDetail");
  const nameInput = document.getElementById("participantNameInput");
  const loginName = document.getElementById("loginUsernameInput");

  if (loggedUser && loggedUser.nama) {
    if (badge) {
      badge.textContent = `Akun Aktif: ${loggedUser.nama}`;
      badge.classList.remove("hidden");
    }
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (formsBox) formsBox.classList.add("hidden");
    if (bannerBox) bannerBox.classList.remove("hidden");
    if (detailEl) {
      detailEl.textContent = loggedUser.email
        ? `Akun: ${loggedUser.nama} • Email: ${loggedUser.email}`
        : `Akun: ${loggedUser.nama}`;
    }
    if (nameInput && !nameInput.value.trim()) {
      nameInput.value = loggedUser.nama;
    }
    if (loginName) loginName.value = loggedUser.nama;
  } else {
    if (badge) badge.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (formsBox) formsBox.classList.remove("hidden");
    if (bannerBox) bannerBox.classList.add("hidden");
    if (detailEl) detailEl.textContent = "";
  }
}

function logoutParticipant() {
  if (!confirm("Keluar dari sesi login saat ini?")) return;
  loggedUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  applyLoggedUserToUI();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  showAuthFeedback("Anda telah keluar dari sesi login.");
}
