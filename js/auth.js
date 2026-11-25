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
  if (/^[^a-zA-Z\s]+$/.test(formationVal) \vert{}\vert{} /^[^a-zA-Z\s]+$/.test(institutionVal)) {
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
  const
