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
  const fullName = document.getElementById("regFullNameInput")?.value.trim() || "";
  const rawUsername = document.getElementById("regUsernameInput")?.value.trim() || "";
  const emailVal = document.getElementById("regEmailInput")?.value.trim().toLowerCase() || "";
  const educationVal = document.getElementById("regEducationSelect")?.value.trim() || "";
  const passVal = document.getElementById("regPasswordInput")?.value || "";

  if (!fullName || fullName.length < 3) {
    showAuthFeedback("Nama lengkap peserta minimal 3 karakter.", true);
    return;
  }
  if (findProfanityInName(fullName).length > 0) {
    showAuthFeedback("Nama lengkap mengandung kata tidak sopan.", true);
    return;
  }
  if (!rawUsername || rawUsername.length < 3) {
    showAuthFeedback("Username minimal 3 karakter.", true);
    return;
  }
  if (/\s/.test(rawUsername) || !/^[a-zA-Z0-9._-]+$/.test(rawUsername)) {
    showAuthFeedback("Username hanya boleh huruf, angka, titik (.), garis bawah (_), atau tanda hubung (-) tanpa spasi.", true);
    return;
  }
  if (findProfanityInName(rawUsername).length > 0) {
    showAuthFeedback("Username mengandung kata tidak sopan.", true);
    return;
  }
  if (!isValidEmailAddress(emailVal)) {
    showAuthFeedback("Masukkan alamat email yang valid.", true);
    return;
  }
  if (!educationVal) {
    showAuthFeedback("Pilih Pendidikan Terakhir Anda terlebih dahulu.", true);
    return;
  }
  if (!passVal || passVal.length < 6) {
    showAuthFeedback("Password minimal 6 karakter.", true);
    return;
  }

  const nameKey = normalizeAccountKey(fullName);
  const userKey = normalizeUsernameKey(rawUsername);
  const users = getRegisteredUsers();

  if (
    users.some(u =>
      normalizeUsernameKey(u.username || u.nama) === userKey ||
      String(u.email || "").toLowerCase() === emailVal
    )
  ) {
    showAuthFeedback("Username atau email sudah terdaftar. Silakan login atau gunakan username/email lain.", true);
    return;
  }

  const passwordHash = await hashSecretValue(passVal);

  try {
    const remote = await postAuthToSheet({
      action: "register",
      nama: fullName,
      nama_key: nameKey,
      username: rawUsername,
      username_key: userKey,
      email: emailVal,
      pendidikan_terakhir: educationVal,
      password_hash: passwordHash
    });
    if (remote && remote.status === "error") {
      showAuthFeedback(remote.pesan || "Gagal mendaftarkan akun di Google Sheets.", true);
      return;
    }
  } catch (err) {
    console.warn("Sinkronisasi daftar akun ke Sheet gagal, menyimpan secara lokal.", err);
  }

  users.push({
    id: `usr_${Date.now()}`,
    nama: fullName,
    username: rawUsername,
    email: emailVal,
    pendidikan: educationVal,
    passwordHash,
    createdAt: new Date().toISOString()
  });
  saveRegisteredUsers(users);

  loggedUser = {
    nama: fullName,
    username: rawUsername,
    email: emailVal,
    pendidikan: educationVal
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));

  document.getElementById("participantNameInput").value = fullName;
  const eduSelect = document.getElementById("participantEducationSelect");
  if (eduSelect) eduSelect.value = educationVal;
  document.getElementById("regPasswordInput").value = "";

  applyLoggedUserToUI();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  if (typeof pingOnlinePresence_ === "function") {
    pingOnlinePresence_();
  }
  if (typeof loadChatMessages === "function") {
    loadChatMessages(true, false);
  }
  showAuthFeedback(`Akun peserta "${fullName}" (@${rawUsername} • ${educationVal}) berhasil didaftarkan.`);
}

async function handleLoginSubmit() {
  const identifierRaw = document.getElementById("loginUsernameInput")?.value.trim() || "";
  const identifier = identifierRaw.toLowerCase();
  const passVal = document.getElementById("loginPasswordInput")?.value || "";

  if (!identifier || !passVal) {
    showAuthFeedback("Masukkan username/email dan password.", true);
    return;
  }

  const passwordHash = await hashSecretValue(passVal);
  const localUsers = getRegisteredUsers();
  const localMatch = localUsers.find(u =>
    normalizeUsernameKey(u.username || u.nama) === normalizeUsernameKey(identifier) ||
    normalizeAccountKey(u.nama) === normalizeAccountKey(identifier) ||
    String(u.email || "").toLowerCase() === identifier
  );

  try {
    const remote = await postAuthToSheet({
      action: "login",
      identifier,
      password_hash: passwordHash
    });
    if (remote && remote.status === "sukses") {
      const resolvedName = remote.nama || (localMatch ? localMatch.nama : identifierRaw);
      const resolvedUsername = remote.username || (localMatch ? localMatch.username : identifierRaw);
      const resolvedEducation = remote.pendidikan_terakhir || remote.pendidikan || (localMatch ? localMatch.pendidikan : "");

      loggedUser = {
        nama: resolvedName,
        username: resolvedUsername,
        email: remote.email || (localMatch ? localMatch.email : ""),
        pendidikan: resolvedEducation
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));

      document.getElementById("participantNameInput").value = resolvedName;
      const eduSelect = document.getElementById("participantEducationSelect");
      if (eduSelect && resolvedEducation) eduSelect.value = resolvedEducation;
      document.getElementById("loginPasswordInput").value = "";

      applyLoggedUserToUI();
      renderAttemptHistory();
      renderDashboardUserPreviousExams();
      renderUserScoreTrendChart();
      if (typeof pingOnlinePresence_ === "function") {
        pingOnlinePresence_();
      }
      if (typeof loadChatMessages === "function") {
        loadChatMessages(true, false);
      }
      showAuthFeedback(`Selamat datang kembali, ${resolvedName}.`);
      return;
    }
    if (remote && remote.status === "error") {
      showAuthFeedback(remote.pesan || "Username/email atau password salah.", true);
      return;
    }
  } catch (err) {
    console.warn("Login ke Sheet gagal, memeriksa cache lokal.", err);
  }

  if (!localMatch || passwordHash !== localMatch.passwordHash) {
    showAuthFeedback("Username/email atau password salah. Gunakan tab Reset Password jika lupa.", true);
    return;
  }

  loggedUser = {
    nama: localMatch.nama,
    username: localMatch.username || localMatch.nama,
    email: localMatch.email || "",
    pendidikan: localMatch.pendidikan || ""
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));

  document.getElementById("participantNameInput").value = localMatch.nama;
  const eduSelect = document.getElementById("participantEducationSelect");
  if (eduSelect && localMatch.pendidikan) eduSelect.value = localMatch.pendidikan;
  document.getElementById("loginPasswordInput").value = "";

  applyLoggedUserToUI();
  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  if (typeof pingOnlinePresence_ === "function") {
    pingOnlinePresence_();
  }
  if (typeof loadChatMessages === "function") {
    loadChatMessages(true, false);
  }
  showAuthFeedback(`Selamat datang kembali, ${localMatch.nama} (Mode Lokal).`);
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
      document.getElementById("loginUsernameInput").value = remote.username || remote.nama || emailVal;
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
      loggedUser = {
        nama: parsed.nama,
        username: parsed.username || parsed.nama,
        email: parsed.email || "",
        pendidikan: parsed.pendidikan || ""
      };
      applyLoggedUserToUI();
      if (typeof pingOnlinePresence_ === "function") {
        pingOnlinePresence_();
      }
      if (typeof loadChatMessages === "function") {
        loadChatMessages(true, false);
      }
    }
  } catch (err) {}
}

function applyLoggedUserToUI() {
  if ((!loggedUser || !loggedUser.nama) && typeof AUTH_STORAGE_KEY !== "undefined") {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.nama) {
        loggedUser = {
          nama: parsed.nama,
          username: parsed.username || parsed.nama,
          email: parsed.email || "",
          pendidikan: parsed.pendidikan || ""
        };
      }
    } catch (err) {}
  }

  const badge = document.getElementById("activeSessionBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const formsBox = document.getElementById("authFormsContainer");
  const bannerBox = document.getElementById("loggedInAccountBanner");
  const detailEl = document.getElementById("loggedInAccountDetail");
  const nameInput = document.getElementById("participantNameInput");
  const eduSelect = document.getElementById("participantEducationSelect");
  const loginName = document.getElementById("loginUsernameInput");

  if (loggedUser && loggedUser.nama) {
    const unameLabel = loggedUser.username ? `@${loggedUser.username}` : "";
    if (badge) {
      badge.textContent = `Peserta: ${loggedUser.nama}`;
      badge.classList.remove("hidden");
    }
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (formsBox) formsBox.classList.add("hidden");
    if (bannerBox) bannerBox.classList.remove("hidden");
    if (detailEl) {
      const metaParts = [
        `Nama: ${loggedUser.nama}`,
        unameLabel ? `User: ${unameLabel}` : "",
        loggedUser.email ? `Email: ${loggedUser.email}` : "",
        loggedUser.pendidikan ? `Pendidikan: ${loggedUser.pendidikan}` : ""
      ].filter(Boolean);
      detailEl.textContent = metaParts.join(" • ");
    }
    if (nameInput) {
      nameInput.value = loggedUser.nama;
    }
    if (eduSelect && loggedUser.pendidikan && !eduSelect.value) {
      eduSelect.value = loggedUser.pendidikan;
    }
    if (loginName) {
      loginName.value = loggedUser.username || loggedUser.nama;
    }
  } else {
    if (badge) badge.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (formsBox) formsBox.classList.remove("hidden");
    if (bannerBox) bannerBox.classList.add("hidden");
    if (detailEl) detailEl.textContent = "";
    if (nameInput) nameInput.value = "";
    if (eduSelect) eduSelect.value = "";
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
  if (typeof loadChatMessages === "function") {
    loadChatMessages(false, false);
  }
  showAuthFeedback("Anda telah keluar dari sesi login.");
}

function showProfileFeedback(msg, isError = false) {
  const el = document.getElementById("profileFeedbackText");
  if (!el) return;
  el.textContent = msg;
  el.className = `text-xs font-semibold rounded-xl p-3 ${
    isError
      ? "text-rose-800 bg-rose-50 border border-rose-200"
      : "text-emerald-800 bg-emerald-50 border border-emerald-200"
  }`;
  el.classList.remove("hidden");
}

function populateProfileForm() {
  const noticeEl = document.getElementById("profileAuthNotice");
  if (noticeEl) {
    noticeEl.classList.toggle("hidden", Boolean(loggedUser && loggedUser.nama));
  }

  const fbEl = document.getElementById("profileFeedbackText");
  if (fbEl) fbEl.classList.add("hidden");

  const currentName = (loggedUser?.nama || document.getElementById("participantNameInput")?.value || "").trim();
  const currentUser = (loggedUser?.username || "").trim();
  const currentEmail = (loggedUser?.email || "").trim();
  const currentEdu = (
    document.getElementById("participantEducationSelect")?.value ||
    loggedUser?.pendidikan ||
    participantEducation ||
    ""
  ).trim();
  const currentFormation = (
    document.getElementById("appliedFormationInput")?.value ||
    appliedFormation ||
    ""
  ).trim();
  const currentInstitution = (
    document.getElementById("appliedInstitutionInput")?.value ||
    appliedInstitution ||
    ""
  ).trim();

  const nameEl = document.getElementById("profileFullNameInput");
  const userEl = document.getElementById("profileUsernameInput");
  const emailEl = document.getElementById("profileEmailInput");
  const eduEl = document.getElementById("profileEducationSelect");
  const formEl = document.getElementById("profileFormationInput");
  const instEl = document.getElementById("profileInstitutionInput");

  if (nameEl) nameEl.value = currentName;
  if (userEl) {
    userEl.value = currentUser;
    userEl.readOnly = Boolean(loggedUser && loggedUser.username);
    userEl.classList.toggle("bg-slate-100", Boolean(loggedUser && loggedUser.username));
  }
  if (emailEl) {
    emailEl.value = currentEmail;
    emailEl.readOnly = Boolean(loggedUser && loggedUser.email);
    emailEl.classList.toggle("bg-slate-100", Boolean(loggedUser && loggedUser.email));
  }
  if (eduEl) eduEl.value = currentEdu;
  if (formEl) formEl.value = currentFormation;
  if (instEl) instEl.value = currentInstitution;
}

function openProfileScreen() {
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Selesaikan ujian terlebih dahulu sebelum membuka menu Profil Peserta.");
    return;
  }
  populateProfileForm();
  showScreen("profile");
}

async function saveParticipantProfile(goToSetupAfterSave = false) {
  const fullName = (document.getElementById("profileFullNameInput")?.value || "").trim();
  const rawUser = (document.getElementById("profileUsernameInput")?.value || "").trim();
  const emailVal = (document.getElementById("profileEmailInput")?.value || "").trim().toLowerCase();
  const educationVal = (document.getElementById("profileEducationSelect")?.value || "").trim();
  const formationVal = (document.getElementById("profileFormationInput")?.value || "").trim();
  const profInstEl = document.getElementById("profileInstitutionInput");
  if (profInstEl) applyAutoCapitalizeToInput(profInstEl, true);
  const institutionVal = (profInstEl?.value || "").trim();

  if (!fullName || fullName.length < 3) {
    showProfileFeedback("Nama lengkap peserta minimal 3 karakter.", true);
    return;
  }
  if (findProfanityInName(fullName).length > 0) {
    showProfileFeedback("Nama lengkap mengandung kata tidak sopan.", true);
    return;
  }
  if (!educationVal) {
    showProfileFeedback("Pilih Pendidikan Terakhir terlebih dahulu.", true);
    return;
  }
  if (!formationVal || findProfanityInName(formationVal).length > 0) {
    showProfileFeedback("Isi Formasi yang Dilamar dengan kata yang wajar dan sopan.", true);
    return;
  }
  if (!institutionVal || findProfanityInName(institutionVal).length > 0) {
    showProfileFeedback("Isi Instansi yang Dilamar dengan kata yang wajar dan sopan.", true);
    return;
  }

  participantName = fullName;
  participantEducation = educationVal;
  appliedFormation = formationVal;
  appliedInstitution = institutionVal;

  const setupNameEl = document.getElementById("participantNameInput");
  const setupEduEl = document.getElementById("participantEducationSelect");
  const setupFormEl = document.getElementById("appliedFormationInput");
  const setupInstEl = document.getElementById("appliedInstitutionInput");

  if (setupNameEl) setupNameEl.value = fullName;
  if (setupEduEl) setupEduEl.value = educationVal;
  if (setupFormEl) setupFormEl.value = formationVal;
  if (setupInstEl) setupInstEl.value = institutionVal;

  if (loggedUser && loggedUser.nama) {
    const prevKey = normalizeUsernameKey(loggedUser.username || loggedUser.nama);
    loggedUser = {
      ...loggedUser,
      nama: fullName,
      username: rawUser || loggedUser.username || fullName,
      email: emailVal || loggedUser.email || "",
      pendidikan: educationVal
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));

    const users = getRegisteredUsers();
    const idx = users.findIndex(u =>
      normalizeUsernameKey(u.username || u.nama) === prevKey ||
      String(u.email || "").toLowerCase() === String(loggedUser.email || "").toLowerCase()
    );
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        nama: fullName,
        pendidikan: educationVal
      };
      saveRegisteredUsers(users);
    }

    applyLoggedUserToUI();

    try {
      await postAuthToSheet({
        action: "update_profile",
        username: loggedUser.username,
        email: loggedUser.email,
        nama: fullName,
        nama_key: normalizeAccountKey(fullName),
        pendidikan_terakhir: educationVal
      });
    } catch (err) {
      console.warn("Sinkronisasi profil ke Sheet gagal:", err);
    }
  }

  renderAttemptHistory();
  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  showProfileFeedback(`Profil "${fullName}" (${educationVal} • ${formationVal}) berhasil disimpan.`);

  if (goToSetupAfterSave) {
    showScreen("setup");
  }
}

function formatInstitutionInputValue(rawText, finalizeCase = false) {
  const src = String(rawText || "");
  if (!src) return "";

  const minorWords = new Set(["dan", "atau", "serta", "di", "ke", "dari", "yang", "untuk", "pada", "dalam"]);
  const hasTrailingSpace = /\s$/.test(src);

  const tokens = src.split(/(\s+)/);
  const wordTokens = tokens.filter(t => t && !/^\s+$/.test(t));
  let wordIdx = 0;

  const formatted = tokens.map(part => {
    if (!part || /^\s+$/.test(part)) return part;

    const currentWordIndex = wordIdx++;
    const isLastWord = currentWordIndex === wordTokens.length - 1;
    const lowerPart = part.toLowerCase();

    if (lowerPart === "kementerian") {
      return "Kementerian" + part.slice(11);
    }

    if (finalizeCase && currentWordIndex > 0 && !isLastWord && minorWords.has(lowerPart)) {
      return lowerPart;
    }

    const firstAlphaMatch = part.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/);
    if (!firstAlphaMatch) return part;

    const pos = firstAlphaMatch.index;
    const before = part.slice(0, pos);
    const ch = part.charAt(pos).toUpperCase();
    const after = finalizeCase ? part.slice(pos + 1).toLowerCase() : part.slice(pos + 1);
    return `${before}${ch}${after}`;
  }).join("");

  if (!finalizeCase && !hasTrailingSpace) {
    return formatted;
  }
  return formatted;
}

function applyAutoCapitalizeToInput(inputEl, finalizeCase = false) {
  if (!inputEl) return;
  const originalVal = inputEl.value;
  if (!originalVal) return;

  const selStart = inputEl.selectionStart;
  const selEnd = inputEl.selectionEnd;
  const nextVal = formatInstitutionInputValue(originalVal, finalizeCase);

  if (nextVal !== originalVal) {
    inputEl.value = nextVal;
    if (!finalizeCase && typeof selStart === "number" && typeof selEnd === "number") {
      const diff = nextVal.length - originalVal.length;
      const safeStart = Math.max(0, Math.min(nextVal.length, selStart + diff));
      const safeEnd = Math.max(0, Math.min(nextVal.length, selEnd + diff));
      try {
        inputEl.setSelectionRange(safeStart, safeEnd);
      } catch (err) {}
    }
  }
}

function bindInstitutionAutoCapitalize() {
  const instInput = document.getElementById("appliedInstitutionInput");
  if (instInput && !instInput.dataset.autoCapBound) {
    instInput.dataset.autoCapBound = "1";
    instInput.addEventListener("input", () => {
      applyAutoCapitalizeToInput(instInput, false);
      validateInstitutionInputRealtime();
    });
    instInput.addEventListener("blur", () => {
      applyAutoCapitalizeToInput(instInput, true);
      validateInstitutionInputRealtime();
    });
  }

  const profileInstInput = document.getElementById("profileInstitutionInput");
  if (profileInstInput && !profileInstInput.dataset.autoCapBound) {
    profileInstInput.dataset.autoCapBound = "1";
    profileInstInput.addEventListener("input", () => {
      applyAutoCapitalizeToInput(profileInstInput, false);
    });
    profileInstInput.addEventListener("blur", () => {
      applyAutoCapitalizeToInput(profileInstInput, true);
    });
  }
}
