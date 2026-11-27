let fullTrendSeriesMode = "ALL";
let focusTrendSeriesMode = "ALL";
let cachedChatMessages = [];
let pendingChatImageData = "";
let chatPollTimer = null;
let bestScorePerAccountOnly = true;

const SURVEY_HISTORY_STORAGE_KEY = "cat_skd_skm_survey_v1";
const SURVEY_COMPLETED_ACCOUNTS_KEY = "cat_skd_skm_completed_accounts_v1";

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

function getSurveyAccountKey_() {
  if (typeof loggedUser !== "undefined" && loggedUser) {
    const raw = loggedUser.username || loggedUser.email || loggedUser.nama || "";
    const norm = safeAccountKey(raw);
    if (norm) return norm;
  }
  if (typeof AUTH_STORAGE_KEY !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      if (saved) {
        const savedRaw = saved.username || saved.email || saved.nama || "";
        const savedNorm = safeAccountKey(savedRaw);
        if (savedNorm) return savedNorm;
      }
    } catch (err) {}
  }
  const activeName = getActiveUserFilterName();
  return activeName ? safeAccountKey(activeName) : "guest_default";
}

function getAllSurveyAccountKeysForCurrentUser_() {
  const keys = new Set();
  const primary = getSurveyAccountKey_();
  if (primary) keys.add(primary);

  if (typeof loggedUser !== "undefined" && loggedUser) {
    [loggedUser.username, loggedUser.email, loggedUser.nama].forEach(val => {
      const k = safeAccountKey(val);
      if (k) keys.add(k);
    });
  }

  if (typeof AUTH_STORAGE_KEY !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      if (saved) {
        [saved.username, saved.email, saved.nama].forEach(val => {
          const k = safeAccountKey(val);
          if (k) keys.add(k);
        });
      }
    } catch (err) {}
  }

  const activeName = getActiveUserFilterName();
  if (activeName) {
    const k = safeAccountKey(activeName);
    if (k) keys.add(k);
  }

  return Array.from(keys);
}

function getCompletedSurveyAccountsMap_() {
  try {
    const raw = localStorage.getItem(SURVEY_COMPLETED_ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function hasAccountCompletedSurvey_(accountKey = "") {
  const targetKeys = accountKey
    ? [safeAccountKey(accountKey)].filter(Boolean)
    : getAllSurveyAccountKeysForCurrentUser_();
  if (!targetKeys.length) return false;

  const map = getCompletedSurveyAccountsMap_();
  if (targetKeys.some(k => Boolean(map[k]))) return true;

  const localSurveys = getLocalSurveyHistory();
  return localSurveys.some(item => {
    const itemKeys = [
      safeAccountKey(item.accountKey || ""),
      safeAccountKey(item.username || ""),
      safeAccountKey(item.nama || "")
    ].filter(Boolean);
    return itemKeys.some(ik => targetKeys.includes(ik));
  });
}

function markAccountSurveyCompleted_(accountKey = "") {
  const targetKeys = accountKey
    ? [safeAccountKey(accountKey)].filter(Boolean)
    : getAllSurveyAccountKeysForCurrentUser_();
  const map = getCompletedSurveyAccountsMap_();
  targetKeys.forEach(k => {
    if (k) map[k] = true;
  });
  localStorage.setItem(SURVEY_COMPLETED_ACCOUNTS_KEY, JSON.stringify(map));
  markPostExamSurveyCompleted_();
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
  };
}

async function syncHistoryFromDatabaseIfEmpty() {
  const localHistory = getExamHistory();
  if (localHistory.length > 0) return localHistory;
  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) return [];

  try {
    const res = await fetch(`${endpoint}?mode=rekap`);
    const json = await res.json();
    if (json && json.status === "sukses" && Array.isArray(json.rekap) && json.rekap.length > 0) {
      const seenIds = new Set();
      const mapped = [];
      json.rekap.slice().reverse().forEach((r, i) => {
        const item = mapRekapRowToSession(r, i);
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          mapped.push(item);
        }
      });
      localStorage.setItem(getHistoryKey(), JSON.stringify(mapped.slice(0, 150)));
      return mapped;
    }
  } catch (err) {
    console.warn("Gagal memuat riwayat dari database:", err);
  }
  return [];
}

function setBackToDashboardButtonVisible(visible) {
  const btn = document.getElementById("backToDashboardFromReviewBtn");
  if (!btn) return;
  btn.classList.toggle("hidden", !visible);
}

function returnToDashboardFromReview() {
  const sec = document.getElementById("reviewSection");
  if (sec) sec.classList.add("hidden");
  setBackToDashboardButtonVisible(false);
  const dashSec = document.getElementById("dashboardScreen");
  if (dashSec) {
    dashSec.classList.remove("hidden");
    dashSec.scrollIntoView({ behavior: "smooth" });
  }
}

function loadAttemptIntoReview(attemptId, fromDashboard = false) {
  const history = getExamHistory();
  const found = history.find(h => h.id === attemptId);
  if (!found) return;

  if (!Array.isArray(found.questions) || found.questions.length === 0) {
    alert(
      `Sesi ${found.nama} (${found.waktuLabel || "-"}) berasal dari rekap database — Total Skor: ${found.total} ` +
      `(TWK ${found.twk} | TIU ${found.tiu} | TKP ${found.tkp} • ${found.status_pg}). ` +
      "Rincian pembahasan per butir soal hanya tersimpan untuk sesi yang dikerjakan di browser ini."
    );
    return;
  }

  reviewQuestions = found.questions;
  reviewAnswers = Array.isArray(found.answers) ? found.answers : [];
  reviewDurations = Array.isArray(found.durations) ? found.durations : [];
  reviewDoubts = Array.isArray(found.doubts) ? found.doubts : [];
  reviewOnlyWeakMode = false;

  const extraInfo = [
    found.pendidikan && found.pendidikan !== "-" ? found.pendidikan : "",
    found.formasi && found.formasi !== "-" ? found.formasi : ""
  ].filter(Boolean).join(" • ");

  reviewMetaLabel =
    `Sesi ${found.nama}${extraInfo ? ` (${extraInfo})` : ""} (${found.waktuLabel || ""}) — Total Skor: ${found.total}`;

  const sec = document.getElementById("reviewSection");
  if (!sec) return;
  sec.classList.remove("hidden");
  setBackToDashboardButtonVisible(Boolean(fromDashboard));

  const titleEl = document.getElementById("reviewSectionTitle");
  const subEl = document.getElementById("reviewSessionSubtitle");
  if (titleEl) titleEl.textContent = "Pembahasan & Jawaban Sesi Terpilih";
  if (subEl) subEl.textContent = reviewMetaLabel;
  if (typeof populateReviewCategoryFilter === "function") {
    populateReviewCategoryFilter(reviewQuestions);
  }
  if (typeof updateWeakFilterButtonUI === "function") {
    updateWeakFilterButtonUI();
  }
  if (typeof renderReview === "function") {
    renderReview("ALL");
  }
  sec.scrollIntoView({ behavior: "smooth" });
}

function exportLocalHistoryToCsv() {
  const history = getExamHistory();
  if (!history.length) {
    alert("Belum ada riwayat ujian lokal untuk diunduh.");
    return;
  }

  const headers = [
    "Waktu",
    "Nama",
    "Username",
    "Pendidikan Terakhir",
    "Formasi",
    "Instansi",
    "Mode",
    "TWK",
    "TIU",
    "TKP",
    "Total",
    "Status PG",
    "Warning"
  ];
  const escapeCsv = (val) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [
    headers.map(escapeCsv).join(","),
    ...history.map(h => [
      h.waktuLabel || "-",
      h.nama || "-",
      h.username || "-",
      h.pendidikan || "-",
      h.formasi || "-",
      h.instansi || "-",
      h.mode || "-",
      Number(h.twk || 0),
      Number(h.tiu || 0),
      Number(h.tkp || 0),
      Number(h.total || 0),
      h.status_pg || "-",
      h.warning || "Normal"
    ].map(escapeCsv).join(","))
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `riwayat_cat_skd_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getFilteredUserSessions() {
  const allHistory = getExamHistory();
  const activeName = getActiveUserFilterName();
  return activeName
    ? allHistory.filter(item => safeAccountKey(item.nama) === safeAccountKey(activeName))
    : allHistory;
}

function renderAttemptHistory() {
  const filtered = getFilteredUserSessions();
  const listEl = document.getElementById("attemptHistoryList");
  const countBadge = document.getElementById("historyCountBadge");
  if (!listEl || !countBadge) return;

  countBadge.textContent = `${filtered.length} Sesi`;
  listEl.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "col-span-full text-xs text-slate-500 py-2";
    empty.textContent = "Belum ada riwayat sesi tersimpan untuk review.";
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((item, idx) => {
    const urutanLabel = idx === 0 ? "Terbaru (Sesudah)" : `Sebelumnya #${filtered.length - idx}`;
    const card = document.createElement("div");
    card.className = "bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3";

    const eduLabel = item.pendidikan && item.pendidikan !== "-" ? ` • ${safeText(item.pendidikan)}` : "";
    const info = document.createElement("div");
    info.innerHTML = `
      <div class="text-xs font-extrabold text-slate-800">${urutanLabel} • Skor ${item.total}</div>
      <div class="text-[11px] text-slate-500">TWK ${item.twk} | TIU ${item.tiu} | TKP ${item.tkp} • ${safeText(item.status_pg)}</div>
      <div class="text-[10px] text-slate-400">${safeText(item.formasi || "-")}${eduLabel} • ${safeText(item.waktuLabel || "")}</div>
    `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shrink-0";
    btn.textContent = item.fromDatabase ? "Detail" : "Review";
    btn.onclick = () => loadAttemptIntoReview(item.id, false);

    card.append(info, btn);
    listEl.appendChild(card);
  });
}

function renderDashboardUserPreviousExams() {
  const titleEl = document.getElementById("dashUserHistoryTitle");
  const countEl = document.getElementById("dashUserHistoryCount");
  const listEl = document.getElementById("dashUserHistoryList");
  if (!titleEl || !countEl || !listEl) return;

  const activeName = getActiveUserFilterName();
  const userSessions = getFilteredUserSessions();

  titleEl.textContent = activeName
    ? `Ujian Sebelumnya — ${activeName}`
    : "Ujian Sebelumnya (Semua Sesi Tersimpan)";
  countEl.textContent = `${userSessions.length} Sesi`;
  listEl.replaceChildren();

  if (userSessions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "col-span-full text-xs text-slate-600 py-1";
    empty.textContent = activeName
      ? `Belum ada sesi ujian tersimpan untuk "${activeName}".`
      : "Belum ada sesi ujian tersimpan.";
    listEl.appendChild(empty);
    return;
  }

  userSessions.forEach((item, idx) => {
    const label = idx === 0 ? "Ujian Terakhir" : `Ujian Sebelumnya #${userSessions.length - idx}`;
    const card = document.createElement("div");
    card.className = "bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2.5";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="text-xs font-extrabold text-slate-800">${safeText(label)} • Skor ${item.total}</div>
      <div class="text-[11px] text-slate-500">TWK ${item.twk} | TIU ${item.tiu} | TKP ${item.tkp} • ${safeText(item.status_pg)}</div>
      <div class="text-[10px] text-slate-400">${safeText(item.formasi || "-")} • ${safeText(item.waktuLabel || "")}</div>
    `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0";
    btn.textContent = item.fromDatabase ? "Detail" : "Review";
    btn.onclick = () => loadAttemptIntoReview(item.id, true);

    card.append(info, btn);
    listEl.appendChild(card);
  });
}

function setFullTrendSeriesMode(mode) {
  fullTrendSeriesMode = mode || "ALL";
  renderUserScoreTrendChart();
}

function setFocusTrendSeriesMode(mode) {
  focusTrendSeriesMode = mode || "ALL";
  renderUserScoreTrendChart();
}

function inspectTrendSession_(chartId, idx) {
  const host = document.getElementById(chartId);
  if (!host || !host._trendSessions || !host._trendSessions[idx]) return;
  const s = host._trendSessions[idx];
  const infoEl = host.querySelector("[data-trend-detail]");
  if (!infoEl) return;

  const pgTag = s.status_pg ? ` • ${s.status_pg}` : "";
  const timeTag = s.waktuLabel ? ` • ${s.waktuLabel}` : "";
  infoEl.innerHTML =
    `Sesi #${idx + 1}: <span class="text-blue-700 font-extrabold">Tot ${Number(s.total || 0)}</span> • ` +
    `<span class="text-violet-700 font-extrabold">TWK ${Number(s.twk || 0)}</span> • ` +
    `<span class="text-teal-700 font-extrabold">TIU ${Number(s.tiu || 0)}</span> • ` +
    `<span class="text-orange-700 font-extrabold">TKP ${Number(s.tkp || 0)}</span>` +
    `<span class="text-slate-500">${safeText(pgTag + timeTag)}</span>`;
}

function renderSingleTrendGroup(containerEl, sessionsChronological, seriesMode, onSelectFnName, showPgLine, emptyText) {
  if (!containerEl) return;

  if (sessionsChronological.length < 2) {
    const single = sessionsChronological[0];
    containerEl.innerHTML = `
      <div class="text-xs text-slate-500 text-center py-4">
        ${!single
          ? emptyText
          : `1 sesi tercatat (Tot ${single.total} • TWK ${single.twk} | TIU ${single.tiu} | TKP ${single.tkp}). Tambah 1 sesi lagi untuk grafik tren.`}
      </div>
    `;
    return;
  }

  const chartDomId = containerEl.id || `trend_box_${Math.random().toString(36).slice(2, 7)}`;
  containerEl._trendSessions = sessionsChronological;

  const width = 440;
  const height = 152;
  const padLeft = 28;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 22;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const totalPgThreshold = 311;
  const pgY = padTop + plotHeight - (totalPgThreshold / 550) * plotHeight;

  const seriesMeta = [
    { key: "total", label: "Total", max: 550, color: "#2563eb", show: seriesMode === "ALL" || seriesMode === "TOTAL" },
    { key: "twk", label: "TWK", max: 150, color: "#7c3aed", show: seriesMode === "ALL" || seriesMode === "TWK" },
    { key: "tiu", label: "TIU", max: 175, color: "#0d9488", show: seriesMode === "ALL" || seriesMode === "TIU" },
    { key: "tkp", label: "TKP", max: 225, color: "#ea580c", show: seriesMode === "ALL" || seriesMode === "TKP" }
  ];

  const getX = (idx) => {
    if (sessionsChronological.length === 1) return padLeft + plotWidth / 2;
    return padLeft + (idx / (sessionsChronological.length - 1)) * plotWidth;
  };

  const getY = (val, max) => {
    const clamped = Math.max(0, Math.min(max, Number(val || 0)));
    return padTop + plotHeight - (clamped / max) * plotHeight;
  };

  const gridLinesHtml = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = padTop + plotHeight * (1 - ratio);
    const pctLabel = Math.round(ratio * 100);
    return `
      <line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - padRight}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="0.9" />
      <text x="${padLeft - 4}" y="${(y + 2.5).toFixed(1)}" text-anchor="end" font-size="7.5" fill="#94a3b8">${pctLabel}%</text>
    `;
  }).join("");

  const xLabelsHtml = sessionsChronological.map((_, idx) => {
    const x = getX(idx);
    return `
      <text x="${x.toFixed(1)}" y="${height - 5}" text-anchor="middle" font-size="8.5" font-weight="600" fill="#64748b"
        class="cursor-pointer" onmouseenter="inspectTrendSession_('${chartDomId}', ${idx})" onclick="inspectTrendSession_('${chartDomId}', ${idx})">#${idx + 1}</text>
    `;
  }).join("");

  const activeSeries = seriesMeta.filter(sr => sr.show);
  const gradId = `grad_${chartDomId}_${seriesMode}`;

  const seriesSvgHtml = activeSeries.map(sr => {
    const rawVals = sessionsChronological.map(s => Number(s[sr.key] || 0));
    const maxVal = Math.max(...rawVals);
    const minVal = Math.min(...rawVals);

    const pts = sessionsChronological.map((s, idx) => {
      const rawVal = Number(s[sr.key] || 0);
      return {
        idx,
        x: getX(idx),
        y: getY(rawVal, sr.max),
        val: rawVal
      };
    });

    const linePointsStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPointsStr = pts.length > 0
      ? `${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} ${pts[pts.length - 1].x.toFixed(1)},${(padTop + plotHeight).toFixed(1)} ${pts[0].x.toFixed(1)},${(padTop + plotHeight).toFixed(1)}`
      : "";

    const showArea = seriesMode !== "ALL" || sr.key === "total";
    const areaHtml = showArea && areaPointsStr
      ? `<polygon points="${areaPointsStr}" fill="url(#${gradId}_${sr.key})" opacity="0.22" />`
      : "";

    const pointsHtml = pts.map((p, i) => {
      const isEndpoint = i === 0 || i === pts.length - 1;
      const isExtremum = (p.val === maxVal || p.val === minVal) && maxVal !== minVal;
      const shouldShowLabel = seriesMode !== "ALL"
        ? (isEndpoint || isExtremum || pts.length <= 6)
        : (sr.key === "total" && (isEndpoint || isExtremum));

      const labelY = p.y < padTop + 12 ? p.y + 11 : p.y - 5;
      const labelHtml = shouldShowLabel
        ? `<text x="${p.x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${sr.color}">${p.val}</text>`
        : "";

      return `
        <g class="cursor-pointer" onmouseenter="inspectTrendSession_('${chartDomId}', ${p.idx})" onclick="inspectTrendSession_('${chartDomId}', ${p.idx})">
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" fill="transparent" />
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${sr.key === "total" ? "3.6" : "3"}" fill="${sr.color}" stroke="#ffffff" stroke-width="1.4" />
          ${labelHtml}
        </g>
      `;
    }).join("");

    return `
      ${areaHtml}
      <polyline fill="none" stroke="${sr.color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${sr.key === "total" ? "2.4" : "1.8"}" points="${linePointsStr}" />
      ${pointsHtml}
    `;
  }).join("");

  const defsHtml = activeSeries.map(sr => `
    <linearGradient id="${gradId}_${sr.key}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sr.color}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${sr.color}" stop-opacity="0.02" />
    </linearGradient>
  `).join("");

  const pgLineHtml = showPgLine && (seriesMode === "ALL" || seriesMode === "TOTAL")
    ? `
      <line x1="${padLeft}" y1="${pgY.toFixed(1)}" x2="${width - padRight}" y2="${pgY.toFixed(1)}" stroke="#059669" stroke-dasharray="4 3" stroke-width="1.1" />
      <rect x="${width - padRight - 46}" y="${(pgY - 11).toFixed(1)}" width="46" height="10" rx="2" fill="#ecfdf5" />
      <text x="${width - padRight - 3}" y="${(pgY - 3.5).toFixed(1)}" text-anchor="end" font-size="7.2" font-weight="bold" fill="#047857">PG ≥ 311</text>
    `
    : "";

  const latest = sessionsChronological[sessionsChronological.length - 1];
  const btnCls = (m) => seriesMode === m
    ? "px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white"
    : "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200";

  containerEl.innerHTML = `
    <div class="w-full space-y-1.5">
      <div class="flex flex-wrap items-center justify-between gap-1">
        <div class="flex flex-wrap items-center gap-1">
          <button type="button" onclick="${onSelectFnName}('ALL')" class="${btnCls("ALL")}">Semua</button>
          <button type="button" onclick="${onSelectFnName}('TOTAL')" class="${btnCls("TOTAL")}">Total</button>
          <button type="button" onclick="${onSelectFnName}('TWK')" class="${btnCls("TWK")}">TWK</button>
          <button type="button" onclick="${onSelectFnName}('TIU')" class="${btnCls("TIU")}">TIU</button>
          <button type="button" onclick="${onSelectFnName}('TKP')" class="${btnCls("TKP")}">TKP</button>
        </div>
      </div>

      <div data-trend-detail class="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded px-2 py-1 truncate">
        Sesi #${sessionsChronological.length} (Terakhir): <span class="text-blue-700 font-extrabold">Tot ${latest.total}</span> •
        <span class="text-violet-700 font-extrabold">TWK ${latest.twk}</span> •
        <span class="text-teal-700 font-extrabold">TIU ${latest.tiu}</span> •
        <span class="text-orange-700 font-extrabold">TKP ${latest.tkp}</span>
      </div>

      <svg viewBox="0 0 ${width} ${height}" class="w-full h-36">
        <defs>${defsHtml}</defs>
        ${gridLinesHtml}
        <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${width - padRight}" y2="${padTop + plotHeight}" stroke="#94a3b8" stroke-width="1" />
        ${pgLineHtml}
        ${seriesSvgHtml}
        ${xLabelsHtml}
      </svg>

      <div class="flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-slate-600">
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-1 rounded bg-blue-600 inline-block"></span> Total (/550)</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-1 rounded bg-violet-600 inline-block"></span> TWK (/150)</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-1 rounded bg-teal-600 inline-block"></span> TIU (/175)</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-1 rounded bg-orange-600 inline-block"></span> TKP (/225)</span>
      </div>
    </div>
  `;
}

function renderUserScoreTrendChart() {
  const fullBox = document.getElementById("userFullTrendChart");
  const focusBox = document.getElementById("userFocusTrendChart");
  const fullBadge = document.getElementById("fullTrendBadge");
  const focusBadge = document.getElementById("focusTrendBadge");
  const pgSummaryEl = document.getElementById("trendPgSummary");
  if (!fullBox && !focusBox) return;

  const userSessions = getFilteredUserSessions().slice().reverse();
  const fullSessions = userSessions.filter(s => !isFocusOrDrillMode(s.mode));
  const focusSessions = userSessions.filter(s => isFocusOrDrillMode(s.mode));

  if (fullBadge) fullBadge.textContent = `${fullSessions.length} Sesi`;
  if (focusBadge) focusBadge.textContent = `${focusSessions.length} Sesi`;

  if (pgSummaryEl) {
    if (userSessions.length === 0) {
      pgSummaryEl.textContent = "PG Acuan: TWK >= 65 • TIU >= 80 • TKP >= 166 (Total >= 311)";
    } else {
      const avgTwk = Math.round(userSessions.reduce((a, b) => a + Number(b.twk || 0), 0) / userSessions.length);
      const avgTiu = Math.round(userSessions.reduce((a, b) => a + Number(b.tiu || 0), 0) / userSessions.length);
      const avgTkp = Math.round(userSessions.reduce((a, b) => a + Number(b.tkp || 0), 0) / userSessions.length);
      pgSummaryEl.textContent =
        `Rata-rata — TWK: ${avgTwk}/65 • TIU: ${avgTiu}/80 • TKP: ${avgTkp}/166`;
    }
  }

  renderSingleTrendGroup(
    fullBox,
    fullSessions,
    fullTrendSeriesMode,
    "setFullTrendSeriesMode",
    true,
    "Belum ada sesi paket lengkap untuk grafik tren."
  );

  renderSingleTrendGroup(
    focusBox,
    focusSessions,
    focusTrendSeriesMode,
    "setFocusTrendSeriesMode",
    false,
    "Belum ada sesi fokus subtes / ulangi soal untuk grafik tren."
  );
}

function getRecordEducation(rec) {
  const direct = String(rec?.pendidikan_terakhir || rec?.pendidikan || "").trim();
  if (direct && direct !== "-") return direct;

  try {
    if (typeof USERS_STORAGE_KEY !== "undefined") {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
      if (Array.isArray(users) && users.length > 0) {
        const recName = safeAccountKey(rec?.nama || "");
        const recUser = String(rec?.username || "").trim().toLowerCase();
        const found = users.find(u =>
          (recUser && String(u.username || "").trim().toLowerCase() === recUser) ||
          (recName && safeAccountKey(u.nama || "") === recName)
        );
        const foundEdu = String(found?.pendidikan_terakhir || found?.pendidikan || "").trim();
        if (foundEdu && foundEdu !== "-") return foundEdu;
      }
    }
  } catch (err) {}

  return direct;
}

function populateDashboardEducationFilter() {
  const selectEl = document.getElementById("dashboardFilterEducation");
  if (!selectEl) return;

  const previousValue = selectEl.value || "ALL";
  const fromRecords = Array.isArray(dashboardRecords)
    ? dashboardRecords.map(r => getRecordEducation(r)).filter(v => v && v !== "-")
    : [];

  const mergedSet = new Set([...STANDARD_EDUCATION_LEVELS, ...fromRecords]);
  const educations = Array.from(mergedSet);

  selectEl.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Semua Pendidikan Terakhir";
  selectEl.appendChild(allOpt);

  educations.forEach(edu => {
    const opt = document.createElement("option");
    opt.value = edu;
    opt.textContent = edu;
    selectEl.appendChild(opt);
  });

  selectEl.value = educations.includes(previousValue) ? previousValue : "ALL";
}

function populateDashboardFormationFilter() {
  const selectEl = document.getElementById("dashboardFilterFormation");
  if (!selectEl || !Array.isArray(dashboardRecords)) return;

  const previousValue = selectEl.value || "ALL";
  const formations = Array.from(
    new Set(
      dashboardRecords
        .map(r => String(r.formasi || "").trim())
        .filter(v => v && v !== "-")
    )
  ).sort((a, b) => a.localeCompare(b, "id"));

  selectEl.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Semua Formasi Dilamar";
  selectEl.appendChild(allOpt);

  formations.forEach(formasi => {
    const opt = document.createElement("option");
    opt.value = formasi;
    opt.textContent = formasi;
    selectEl.appendChild(opt);
  });

  selectEl.value = formations.includes(previousValue) ? previousValue : "ALL";
}

function populateDashboardInstitutionFilter() {
  const selectEl = document.getElementById("dashboardFilterInstansi");
  if (!selectEl || typeof dashboardRecords === "undefined" || !Array.isArray(dashboardRecords)) return;

  const previousValue = selectEl.value || "ALL";
  const institutions = Array.from(
    new Set(
      dashboardRecords
        .map(r => String(r.instansi || "").trim())
        .filter(v => v && v !== "-")
    )
  ).sort((a, b) => a.localeCompare(b, "id"));

  selectEl.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Semua Instansi";
  selectEl.appendChild(allOpt);

  institutions.forEach(inst => {
    const opt = document.createElement("option");
    opt.value = inst;
    opt.textContent = inst;
    selectEl.appendChild(opt);
  });

  selectEl.value = institutions.includes(previousValue) ? previousValue : "ALL";
}

function setDashboardScope(scope) {
  if (typeof dashboardScope !== "undefined") dashboardScope = scope;
  const allBtn = document.getElementById("scopeAllBtn");
  const mineBtn = document.getElementById("scopeMineBtn");
  if (allBtn && mineBtn) {
    if (scope === "MINE") {
      mineBtn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white";
      allBtn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200";
    } else {
      allBtn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white";
      mineBtn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200";
    }
  }
  renderDashboardTable();
}

function handleDashboardLimitChange() {
  const sel = document.getElementById("dashboardLimitSelect");
  const val = sel ? sel.value : "ALL";
  if (typeof dashboardTop10Only !== "undefined") {
    dashboardTop10Only = val === "10";
  }
  const btn = document.getElementById("scopeTop10Btn");
  if (btn) {
    btn.className = val === "10"
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white"
      : "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200";
  }
  renderDashboardTable();
}

function setDashboardTop10Mode() {
  const nextTop10 = !(typeof dashboardTop10Only !== "undefined" && dashboardTop10Only);
  if (typeof dashboardTop10Only !== "undefined") dashboardTop10Only = nextTop10;

  const sel = document.getElementById("dashboardLimitSelect");
  if (sel) sel.value = nextTop10 ? "10" : "ALL";

  const btn = document.getElementById("scopeTop10Btn");
  if (btn) {
    btn.className = nextTop10
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white"
      : "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200";
  }
  renderDashboardTable();
}

function getAccountGroupKey_(rec) {
  const uname = String(rec?.username || "").trim().toLowerCase().replace(/\s+/g, "");
  if (uname) return `u:${uname}`;

  const email = String(rec?.email || "").trim().toLowerCase();
  if (email) return `e:${email}`;

  const nameKey = safeAccountKey(rec?.nama || "");
  return nameKey ? `n:${nameKey}` : "";
}

function collapseToBestPerAccount_(rows) {
  const bestMap = new Map();

  (Array.isArray(rows) ? rows : []).forEach((rec, idx) => {
    const key = getAccountGroupKey_(rec) || `row_${idx}`;
    const currentScore = Number(rec?.total || 0);
    const existing = bestMap.get(key);

    if (!existing || currentScore > Number(existing.total || 0)) {
      bestMap.set(key, rec);
    }
  });

  return Array.from(bestMap.values());
}

function toggleBestScorePerAccountMode() {
  bestScorePerAccountOnly = !bestScorePerAccountOnly;
  const btn = document.getElementById("bestPerAccountBtn");
  if (btn) {
    btn.className = bestScorePerAccountOnly
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
      : "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200";
    btn.textContent = bestScorePerAccountOnly ? "Terbaik per Akun" : "Semua Percobaan";
  }
  renderDashboardTable();
}

async function openDashboard() {
  if (typeof showScreen === "function") showScreen("dashboard");
  if (typeof refreshDashboardData === "function") await refreshDashboardData();
}

async function refreshDashboardData() {
  const infoEl = document.getElementById("dashboardSourceInfo");
  if (infoEl) infoEl.textContent = "Mengambil data rekap skor peserta...";
  updateRestoreHistoryButtons();

  const localRecords = getExamHistory().map(h => ({
    waktu: h.waktuLabel || "-",
    nama: h.nama || "Peserta",
    username: h.username || "",
    pendidikan_terakhir: h.pendidikan || "-",
    formasi: h.formasi || "-",
    instansi: h.instansi || "-",
    mode: h.mode || "-",
    twk: Number(h.twk || 0),
    tiu: Number(h.tiu || 0),
    tkp: Number(h.tkp || 0),
    total: Number(h.total || 0),
    status_pg: h.status_pg || "-",
    warning: h.warning || "Normal"
  }));

  const endpoint = getScriptEndpoint();

  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (typeof dashboardRecords !== "undefined") dashboardRecords = localRecords;
    if (infoEl) infoEl.textContent = `Status Koneksi: Lokal Saja • ${localRecords.length} data di browser ini.`;
    renderDashboardUserPreviousExams();
    renderUserScoreTrendChart();
    populateDashboardEducationFilter();
    populateDashboardFormationFilter();
    populateDashboardInstitutionFilter();
    renderDashboardTable();
    loadVerifiedDonationsForDashboard();
    renderDashboardSurveySummary();
    return;
  }

  try {
    const res = await fetch(`${endpoint}?mode=rekap`);
    const json = await res.json();
    if (json && json.status === "sukses" && Array.isArray(json.rekap) && json.rekap.length > 0) {
      const reversedRekap = json.rekap.slice().reverse();
      if (typeof dashboardRecords !== "undefined") dashboardRecords = reversedRekap;

      if (getExamHistory().length === 0 && !getBackupExamHistory().length) {
        const seenIds = new Set();
        const mapped = [];
        reversedRekap.forEach((r, i) => {
          const item = mapRekapRowToSession(r, i);
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            mapped.push(item);
          }
        });
        localStorage.setItem(getHistoryKey(), JSON.stringify(mapped.slice(0, 150)));
      }

      if (infoEl) infoEl.textContent = `Status Koneksi: Terhubung ke Google Sheets • ${reversedRekap.length} data tercatat.`;
    } else {
      if (typeof dashboardRecords !== "undefined") dashboardRecords = localRecords;
      if (infoEl) infoEl.textContent = `Status Koneksi: Lokal (${localRecords.length} data tersimpan di browser).`;
    }
  } catch (err) {
    if (typeof dashboardRecords !== "undefined") dashboardRecords = localRecords;
    if (infoEl) infoEl.textContent = `Status Koneksi: Cadangan Lokal / Offline (${localRecords.length} data di browser).`;
  }

  renderDashboardUserPreviousExams();
  renderUserScoreTrendChart();
  populateDashboardEducationFilter();
  populateDashboardFormationFilter();
  populateDashboardInstitutionFilter();
  renderDashboardTable();
  loadVerifiedDonationsForDashboard();
  renderDashboardSurveySummary();
}

function renderTimeAnalysisOnResult() {
  const boxEl = document.getElementById("timeAnalysisBox");
  const cardsEl = document.getElementById("subtestAvgTimeCards");
  const alertEl = document.getElementById("slowQuestionAlert");
  const topListEl = document.getElementById("topSlowQuestionsList");
  const badgeEl = document.getElementById("slowestSubtestBadge");
  if (!boxEl || !cardsEl || !topListEl) return;

  const qs = Array.isArray(reviewQuestions) && reviewQuestions.length
    ? reviewQuestions
    : (typeof examQuestions !== "undefined" && Array.isArray(examQuestions) ? examQuestions : []);
  const durs = Array.isArray(reviewDurations) && reviewDurations.length
    ? reviewDurations
    : (typeof questionDurations !== "undefined" && Array.isArray(questionDurations) ? questionDurations : []);

  if (!qs.length || !durs.length) {
    boxEl.classList.add("hidden");
    return;
  }
  boxEl.classList.remove("hidden");

  const stats = {
    TWK: { totalSec: 0, count: 0, benchmark: 55 },
    TIU: { totalSec: 0, count: 0, benchmark: 55 },
    TKP: { totalSec: 0, count: 0, benchmark: 54 }
  };

  const perQuestionItems = [];

  qs.forEach((q, idx) => {
    const sub = String(q.subtest || "TWK").toUpperCase();
    const sec = Math.max(0, Math.round(Number(durs[idx] || 0)));
    if (stats[sub]) {
      stats[sub].totalSec += sec;
      stats[sub].count += 1;
    }
    perQuestionItems.push({
      no: idx + 1,
      subtest: sub,
      category: q.category || "Umum",
      prompt: String(q.question || "").replace(/\s+/g, " ").trim(),
      sec
    });
  });

  let slowestSub = null;
  let highestAvg = 0;

  cardsEl.replaceChildren();
  ["TWK", "TIU", "TKP"].forEach(sub => {
    const st = stats[sub];
    const avgSec = st.count > 0 ? Math.round(st.totalSec / st.count) : 0;
    if (st.count > 0 && avgSec > highestAvg) {
      highestAvg = avgSec;
      slowestSub = sub;
    }
    const isSlow = avgSec > st.benchmark + 20;
    const card = document.createElement("div");
    card.className = `bg-white border rounded-lg p-3 ${isSlow ? "border-amber-300" : "border-slate-200"}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-extrabold text-slate-800">${sub} (${st.count} soal)</span>
        <span class="text-[11px] font-bold ${isSlow ? "text-amber-700" : "text-emerald-700"}">${avgSec} dtk/soal</span>
      </div>
      <div class="text-[11px] text-slate-500 mt-1">Total waktu: ${st.totalSec} detik</div>
    `;
    cardsEl.appendChild(card);
  });

  if (badgeEl) {
    if (slowestSub && highestAvg > 75) {
      badgeEl.textContent = `⚠️ Paling Lambat: ${slowestSub} (${highestAvg} dtk/soal)`;
      badgeEl.className = "text-[11px] font-extrabold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full";
    } else if (slowestSub) {
      badgeEl.textContent = `Terlama: ${slowestSub} (${highestAvg} dtk/soal)`;
      badgeEl.className = "text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full";
    }
  }

  const slowQuestions = perQuestionItems.filter(item => item.sec >= 90);
  if (alertEl) {
    if (slowQuestions.length > 0) {
      alertEl.classList.remove("hidden");
      alertEl.textContent =
        `Terdeteksi ${slowQuestions.length} soal dengan waktu pengerjaan ≥ 90 detik. ` +
        "Jika soal hitungan/analisis memakan waktu lebih dari 1,5 menit, tandai Ragu-Ragu dan lanjutkan agar soal lain tetap terjawab.";
    } else {
      alertEl.classList.add("hidden");
      alertEl.textContent = "";
    }
  }

  const top5 = perQuestionItems
    .slice()
    .sort((a, b) => b.sec - a.sec)
    .slice(0, 5);

  topListEl.replaceChildren();
  top5.forEach((item, rank) => {
    const row = document.createElement("div");
    const overTime = item.sec >= 90;
    row.className = `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded border ${
      overTime ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-200"
    }`;
    const snippet = item.prompt.length > 85 ? `${item.prompt.slice(0, 85)}...` : item.prompt;
    row.innerHTML = `
      <div class="truncate">
        <span class="font-extrabold text-slate-800">#${rank + 1} • Soal No. ${item.no}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 ml-1">${safeText(item.subtest)}</span>
        <span class="text-slate-600 ml-1">${safeText(snippet)}</span>
      </div>
      <span class="font-mono font-extrabold shrink-0 ${overTime ? "text-rose-700" : "text-slate-700"}">${item.sec} dtk</span>
    `;
    topListEl.appendChild(row);
  });
}

function renderFormationCompetitionSummary(filteredRows, eduFilter, formationFilter) {
  const countEl = document.getElementById("compApplicantCount");
  const topEl = document.getElementById("compTopScore");
  const pctEl = document.getElementById("compPassPercentage");
  const badgeEl = document.getElementById("competitionPassRateBadge");
  const capEl = document.getElementById("competitionFilterCaption");
  if (!countEl || !topEl || !pctEl) return;

  const total = filteredRows.length;
  const highest = total > 0 ? Math.max(...filteredRows.map(r => Number(r.total || 0))) : 0;
  const passed = filteredRows.filter(r => r.status_pg === "LULUS PG").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  countEl.textContent = String(total);
  topEl.textContent = String(highest);
  pctEl.textContent = `${passRate}%`;
  if (badgeEl) badgeEl.textContent = `Kelulusan PG: ${passRate}% (${passed}/${total})`;

  if (capEl) {
    const parts = [];
    parts.push(eduFilter && eduFilter !== "ALL" ? `Pendidikan: ${eduFilter}` : "Semua Pendidikan");
    parts.push(formationFilter && formationFilter !== "ALL" ? `Formasi: ${formationFilter}` : "Semua Formasi");
    capEl.textContent = `Statistik kelompok aktif — ${parts.join(" • ")}`;
  }
}

function renderDashboardTable() {
  const tbody = document.getElementById("dashboardTableBody");
  if (!tbody) return;

  const records = (typeof dashboardRecords !== "undefined" && Array.isArray(dashboardRecords)) ? dashboardRecords : [];
  const scope = typeof dashboardScope !== "undefined" ? dashboardScope : "ALL";
  const top10Only = typeof dashboardTop10Only !== "undefined" ? dashboardTop10Only : false;

  const qText = (document.getElementById("dashboardSearchInput")?.value || "").trim().toLowerCase();
  const eduFilter = document.getElementById("dashboardFilterEducation")?.value || "ALL";
  const formationFilter = document.getElementById("dashboardFilterFormation")?.value || "ALL";
  const instFilter = document.getElementById("dashboardFilterInstansi")?.value || "ALL";
  const modeFilter = document.getElementById("dashboardFilterMode")?.value || "ALL";
  const pgFilter = document.getElementById("dashboardFilterPg")?.value || "ALL";

  const activeName = getActiveUserFilterName();
  const activeKey = activeName ? safeAccountKey(activeName) : "";

  const filtered = records.filter(rec => {
    if (scope === "MINE") {
      if (!activeKey || safeAccountKey(rec.nama) !== activeKey) {
        return false;
      }
    }

    const recEdu = getRecordEducation(rec);
    const matchEdu = eduFilter === "ALL" || recEdu === eduFilter;
    const matchFormation = formationFilter === "ALL" || String(rec.formasi || "").trim() === formationFilter;
    const matchInst = instFilter === "ALL" || String(rec.instansi || "").trim() === instFilter;
    const matchPg = pgFilter === "ALL" || rec.status_pg === pgFilter;

    const isFocus = isFocusOrDrillMode(rec.mode);
    const matchMode =
      modeFilter === "ALL" ||
      (modeFilter === "FULL" && !isFocus) ||
      (modeFilter === "FOCUS" && isFocus);

    const hay = `${rec.nama} ${recEdu} ${rec.formasi} ${rec.instansi} ${rec.mode || ""}`.toLowerCase();
    const matchText = !qText || hay.includes(qText);

    return matchEdu && matchFormation && matchInst && matchPg && matchMode && matchText;
  });

  const scopedRows = bestScorePerAccountOnly ? collapseToBestPerAccount_(filtered) : filtered;

  const sortedRows = scopedRows
    .slice()
    .sort((a, b) => Number(b.total || 0) - Number(a.total || 0));

  renderFormationCompetitionSummary(sortedRows, eduFilter, formationFilter);

  const limitRaw = document.getElementById("dashboardLimitSelect")?.value || (top10Only ? "10" : "ALL");
  const parsedLimit = limitRaw === "ALL" ? null : Math.max(1, Math.min(100, parseInt(limitRaw, 10) || 10));
  const rowsToDisplay = parsedLimit ? sortedRows.slice(0, parsedLimit) : sortedRows;

  const totalAttempts = rowsToDisplay.length;
  const highestScore = totalAttempts > 0 ? Math.max(...rowsToDisplay.map(r => Number(r.total || 0))) : 0;
  const avgScore = totalAttempts > 0
    ? Math.round(rowsToDisplay.reduce((acc, r) => acc + Number(r.total || 0), 0) / totalAttempts)
    : 0;
  const passCount = rowsToDisplay.filter(r => r.status_pg === "LULUS PG").length;

  const elTotal = document.getElementById("dashTotalAttempts");
  const elHigh = document.getElementById("dashHighestScore");
  const elAvg = document.getElementById("dashAverageScore");
  const elPass = document.getElementById("dashPassCount");
  if (elTotal) elTotal.textContent = totalAttempts;
  if (elHigh) elHigh.textContent = highestScore;
  if (elAvg) elAvg.textContent = avgScore;
  if (elPass) elPass.textContent = passCount;

  tbody.replaceChildren();

  if (rowsToDisplay.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="11" class="py-6 px-4 text-center text-slate-500">Belum ada data skor peserta yang sesuai filter.</td>`;
    tbody.appendChild(tr);
    return;
  }

  rowsToDisplay.forEach((rec, i) => {
    const tr = document.createElement("tr");
    const isCurrentUserRow = activeKey && safeAccountKey(rec.nama) === activeKey;
    tr.className = isCurrentUserRow ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-slate-50";

    const isPass = rec.status_pg === "LULUS PG";
    const badgeClass = isPass
      ? "bg-emerald-100 text-emerald-800"
      : "bg-rose-100 text-rose-800";
    const rankNum = i + 1;
    const rankBadge = rankNum <= 3
      ? `<span class="ml-1 inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Top #${rankNum}</span>`
      : "";
    const youBadge = isCurrentUserRow
      ? `<span class="ml-1 inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Anda</span>`
      : "";
    const focusTag = isFocusOrDrillMode(rec.mode)
      ? `<span class="ml-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Fokus</span>`
      : "";
    const eduDisplay = getRecordEducation(rec) || "-";

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-semibold text-slate-500">${rankNum}</td>
      <td class="py-2.5 px-3 font-bold text-slate-800">${safeText(rec.nama)}${rankBadge}${youBadge}</td>
      <td class="py-2.5 px-3">
        <span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100">
          ${safeText(eduDisplay)}
        </span>
      </td>
      <td class="py-2.5 px-3 font-medium text-slate-800">${safeText(rec.formasi)}${focusTag}</td>
      <td class="py-2.5 px-3 text-slate-600">${safeText(rec.instansi)}</td>
      <td class="py-2.5 px-3 text-center font-semibold">${Number(rec.twk || 0)}</td>
      <td class="py-2.5 px-3 text-center font-semibold">${Number(rec.tiu || 0)}</td>
      <td class="py-2.5 px-3 text-center font-semibold">${Number(rec.tkp || 0)}</td>
      <td class="py-2.5 px-3 text-center font-extrabold text-blue-700">${Number(rec.total || 0)}</td>
      <td class="py-2.5 px-3 text-center">
        <span class="text-xs font-bold px-2 py-0.5 rounded ${badgeClass}">${safeText(rec.status_pg)}</span>
      </td>
      <td class="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">${safeText(formatShortDate(rec.waktu))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openDonationModal() {
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Selesaikan atau keluar dari sesi ujian aktif terlebih dahulu sebelum membuka menu donasi.");
    return;
  }
  const modal = document.getElementById("donationModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeDonationModal() {
  const modal = document.getElementById("donationModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function selectDonationPreset(amountLabel) {
  const inputEl = document.getElementById("donationAmountInput");
  if (inputEl) {
    inputEl.value = amountLabel;
  }
  document.querySelectorAll(".donation-preset-btn").forEach(btn => {
    const isMatch = btn.dataset.amount === amountLabel;
    btn.className = isMatch
      ? "donation-preset-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white"
      : "donation-preset-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100";
  });
}

async function copyDonationText(textToCopy, feedbackId) {
  const fb = document.getElementById(feedbackId);
  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    const tempInput = document.createElement("input");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }
  if (fb) {
    fb.textContent = `Tersalin: ${textToCopy}`;
    fb.classList.remove("hidden");
    setTimeout(() => fb.classList.add("hidden"), 2500);
  }
}

async function confirmDonationNote() {
  const amountVal = (document.getElementById("donationAmountInput")?.value || "Seikhlasnya").trim();
  const senderVal = (document.getElementById("donationSenderInput")?.value || "Donatur Anonim").trim();
  const noteEl = document.getElementById("donationThankYouNote");
  if (!noteEl) return;

  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    noteEl.textContent =
      `Terima kasih ${senderVal} atas dukungan donasi (${amountVal}). Hubungkan GOOGLE_SCRIPT_URL agar masuk antrean verifikasi sebelum tampil di Dashboard.`;
    noteEl.classList.remove("hidden");
    return;
  }

  noteEl.textContent = "Mengirim konfirmasi donasi untuk antrean verifikasi...";
  noteEl.classList.remove("hidden");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "submit_donation_pending",
        nama: senderVal,
        nominal: amountVal,
        kanal: "ShopeePay 082388494114 / BSI 1149630924",
        catatan: "Menunggu pengecekan mutasi oleh admin"
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      noteEl.textContent =
        `Terima kasih ${senderVal} (${amountVal}). Konfirmasi Anda berstatus MENUNGGU VERIFIKASI dan akan tampil di Dashboard setelah dana dipastikan diterima.`;
    } else {
      noteEl.textContent = "Konfirmasi belum terkirim ke server. Silakan coba lagi.";
    }
  } catch (err) {
    noteEl.textContent = "Gagal mengirim konfirmasi donasi. Periksa koneksi internet Anda.";
  }
}

async function loadVerifiedDonationsForDashboard() {
  const listEl = document.getElementById("dashboardVerifiedDonationsList");
  const countEl = document.getElementById("dashboardVerifiedDonationsCount");
  if (!listEl) return;

  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (countEl) countEl.textContent = "0 Terverifikasi";
    listEl.innerHTML = `<div class="text-xs text-slate-500">Donasi berstatus TERVERIFIKASI akan tampil otomatis setelah GOOGLE_SCRIPT_URL aktif.</div>`;
    return;
  }

  try {
    const res = await fetch(`${endpoint}?mode=donasi`);
    const json = await res.json();
    const list = (json && json.status === "sukses" && Array.isArray(json.donasi)) ? json.donasi : [];

    if (countEl) countEl.textContent = `${list.length} Terverifikasi`;
    listEl.replaceChildren();

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-xs text-slate-500";
      empty.textContent = "Belum ada donasi yang berstatus TERVERIFIKASI.";
      listEl.appendChild(empty);
      return;
    }

    list.forEach(item => {
      const row = document.createElement("div");
      row.className = "bg-white border border-emerald-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2";
      row.innerHTML = `
        <div>
          <div class="text-xs font-extrabold text-slate-800">${safeText(item.nama)} • <span class="text-emerald-700">${safeText(item.nominal)}</span></div>
          <div class="text-[10px] text-slate-500">${safeText(item.kanal || "")} • ${safeText(formatShortDate(item.waktu))}</div>
        </div>
        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">TERVERIFIKASI</span>
      `;
      listEl.appendChild(row);
    });
  } catch (err) {
    listEl.innerHTML = `<div class="text-xs text-slate-500">Tidak dapat memuat daftar donasi terverifikasi saat ini.</div>`;
  }
}

function normalizeChatUserKey(raw) {
  if (typeof normalizeUsernameKey === "function") {
    return normalizeUsernameKey(raw || "");
  }
  return String(raw || "").trim().replace(/\s+/g, "").toLowerCase();
}

function getCurrentChatUserKey() {
  if (typeof deskAdminLoggedIn !== "undefined" && deskAdminLoggedIn && typeof DESK_ADMIN_CREDENTIALS !== "undefined") {
    return normalizeChatUserKey(DESK_ADMIN_CREDENTIALS.adminKey);
  }
  let raw = "";
  if (typeof loggedUser !== "undefined" && loggedUser) {
    raw = loggedUser.username || loggedUser.nama || loggedUser.email || "";
  }
  if (!raw && typeof AUTH_STORAGE_KEY !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      if (saved) {
        raw = saved.username || saved.nama || saved.email || "";
      }
    } catch (err) {}
  }
  if (!raw) {
    raw = (document.getElementById("participantNameInput")?.value || "").trim();
  }
  return normalizeChatUserKey(raw);
}

function getCurrentChatSenderName() {
  if (typeof deskAdminLoggedIn !== "undefined" && deskAdminLoggedIn && typeof DESK_ADMIN_CREDENTIALS !== "undefined") {
    return DESK_ADMIN_CREDENTIALS.adminLabel;
  }
  if (typeof loggedUser !== "undefined" && loggedUser && loggedUser.nama) {
    return String(loggedUser.nama).trim();
  }
  if (typeof AUTH_STORAGE_KEY !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      if (saved && saved.nama) return String(saved.nama).trim();
    } catch (err) {}
  }
  return (document.getElementById("participantNameInput")?.value || "").trim() || "Peserta";
}

async function pingOnlinePresence_() {
  const endpoint = getScriptEndpoint();
  const myKey = getCurrentChatUserKey();
  if (!endpoint || endpoint.includes("TEMPEL_URL") || !myKey) return;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "ping_online",
        user_key: myKey,
        nama: getCurrentChatSenderName(),
        username: myKey
      })
    });
  } catch (err) {}
}

function startChatPolling_() {
  stopChatPolling_();
  chatPollTimer = setInterval(() => {
    const panel = document.getElementById("chatPanel");
    const isHidden = !panel || panel.classList.contains("hidden");
    if (isHidden || (typeof isExamActive !== "undefined" && isExamActive)) {
      return;
    }
    pingOnlinePresence_();
    loadChatMessages(true, true);
  }, 15000);
}

function stopChatPolling_() {
  if (chatPollTimer) {
    clearInterval(chatPollTimer);
    chatPollTimer = null;
  }
}

function openChatPanel() {
  const examSec = document.getElementById("examScreen");
  const examVisible = examSec && !examSec.classList.contains("hidden");
  if ((typeof isExamActive !== "undefined" && isExamActive) || examVisible || document.body.classList.contains("exam-mode-active")) {
    closeChatPanel();
    return;
  }
  const panel = document.getElementById("chatPanel");
  if (!panel) return;
  panel.classList.remove("hidden");
  loadDeskAdminSession_();
  pingOnlinePresence_();
  loadChatMessages(true, true);
  startChatPolling_();
  panel.scrollIntoView({ behavior: "smooth" });
}

function closeChatPanel() {
  stopChatPolling_();
  const panel = document.getElementById("chatPanel");
  if (panel) panel.classList.add("hidden");
}

function toggleChatPanel() {
  const panel = document.getElementById("chatPanel");
  if (!panel) return;
  if (panel.classList.contains("hidden")) {
    openChatPanel();
  } else {
    closeChatPanel();
  }
}

function clearChatImageSelection() {
  pendingChatImageData = "";
  const fileInput = document.getElementById("chatImageInput");
  const boxEl = document.getElementById("chatImagePreviewBox");
  const imgEl = document.getElementById("chatImagePreviewImg");
  const infoEl = document.getElementById("chatImagePreviewInfo");
  if (fileInput) fileInput.value = "";
  if (imgEl) imgEl.src = "";
  if (infoEl) infoEl.textContent = "";
  if (boxEl) boxEl.classList.add("hidden");
}

function compressChatImageFile_(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File tidak dapat diproses sebagai gambar."));
      img.onload = () => {
        const maxDim = 720;
        let w = img.width || 1;
        let h = img.height || 1;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.72;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 340000 && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > 420000) {
          reject(new Error("Ukuran gambar masih terlalu besar setelah dikompresi. Pilih gambar yang lebih ringan."));
          return;
        }
        resolve({ dataUrl, width: w, height: h });
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

async function handleChatImageChange(event) {
  const file = event?.target?.files?.[0];
  const fbEl = document.getElementById("chatFeedbackText");
  if (!file) return;

  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
    if (fbEl) {
      fbEl.textContent = "Gunakan format gambar JPG, PNG, atau WEBP.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    clearChatImageSelection();
    return;
  }

  try {
    const compressed = await compressChatImageFile_(file);
    pendingChatImageData = compressed.dataUrl;
    const boxEl = document.getElementById("chatImagePreviewBox");
    const imgEl = document.getElementById("chatImagePreviewImg");
    const infoEl = document.getElementById("chatImagePreviewInfo");

    if (imgEl) imgEl.src = compressed.dataUrl;
    if (infoEl) infoEl.textContent = `${file.name} (${compressed.width}×${compressed.height}px)`;
    if (boxEl) boxEl.classList.remove("hidden");
    if (fbEl) fbEl.classList.add("hidden");
  } catch (err) {
    clearChatImageSelection();
    if (fbEl) {
      fbEl.textContent = err.message || "Gagal memproses gambar.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
  }
}

function renderOnlineRecipientsBar_(peers) {
  const barEl = document.getElementById("onlineRecipientsBar");
  if (!barEl) return;
  barEl.replaceChildren();

  const onlinePeers = (Array.isArray(peers) ? peers : []).filter(p => Boolean(p.is_online));
  if (onlinePeers.length === 0) {
    const empty = document.createElement("span");
    empty.className = "text-[11px] text-slate-500";
    empty.textContent = "Belum ada peserta lain yang sedang online—Anda tetap bisa mengirim pesan dan akan dibalas saat aktif.";
    barEl.appendChild(empty);
    return;
  }

  onlinePeers.forEach(p => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold transition";
    chip.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>${safeText(p.nama)}`;
    chip.onclick = () => prepareReplyToSender(p.key);
    barEl.appendChild(chip);
  });
}

function populateChatRecipientDropdowns(accounts, myKey) {
  const recSelect = document.getElementById("chatRecipientSelect");
  if (!recSelect) return;

  const prevRec = recSelect.value;
  const peers = (Array.isArray(accounts) ? accounts : [])
    .filter(acc => acc && acc.key && acc.key !== myKey);

  renderOnlineRecipientsBar_(peers);

  recSelect.replaceChildren();
  const defaultRec = document.createElement("option");
  defaultRec.value = "";
  defaultRec.textContent = peers.length > 0 ? "-- Pilih Peserta Tujuan --" : "Belum ada peserta lain terdaftar";
  recSelect.appendChild(defaultRec);

  peers.forEach(p => {
    const statusLabel = p.is_online ? " • Online" : "";
    const label = `${p.nama}${p.username ? ` (@${p.username})` : ""}${statusLabel}`;
    const opt1 = document.createElement("option");
    opt1.value = p.key;
    opt1.dataset.nama = p.nama;
    opt1.textContent = label;
    recSelect.appendChild(opt1);
  });

  if (prevRec && peers.some(p => p.key === prevRec)) {
    recSelect.value = prevRec;
  }
}

async function loadChatRecipients(myKey) {
  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL") || !myKey) return;

  try {
    const res = await fetch(`${endpoint}?mode=accounts`);
    const json = await res.json();
    if (json && json.status === "sukses" && Array.isArray(json.accounts)) {
      populateChatRecipientDropdowns(json.accounts, myKey);
    }
  } catch (err) {
    console.warn("Gagal memuat daftar peserta chat:", err);
  }
}

async function markIncomingChatReadOnServer(myKey) {
  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL") || !myKey) return;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "mark_chat_read",
        user_key: myKey
      })
    });
  } catch (err) {}
}

function prepareReplyToSender(senderKey) {
  const recSelect = document.getElementById("chatRecipientSelect");
  const inputEl = document.getElementById("chatMessageInput");
  if (!recSelect || !senderKey) return;

  const hasOpt = Array.from(recSelect.options).some(o => o.value === senderKey);
  if (hasOpt) {
    recSelect.value = senderKey;
  }
  if (inputEl) {
    inputEl.focus();
  }
}

function renderFilteredChatMessages() {
  const listEl = document.getElementById("chatMessagesList");
  const badgeEl = document.getElementById("unreadChatBadge");
  const myKey = getCurrentChatUserKey();
  if (!listEl) return;

  const allMsgs = Array.isArray(cachedChatMessages) ? cachedChatMessages : [];
  const unreadCount = allMsgs.filter(m => {
    const isUnread = normalizeChatUserKey(m.penerima_key || "") === myKey && String(m.status || "").toUpperCase() !== "DIBACA";
    if (!isUnread) return false;
    return activeDeskMode === "CONSULT" ? isConsultationMessage_(m) : !isConsultationMessage_(m);
  }).length;

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.textContent = `${unreadCount} Baru`;
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }
  }

  listEl.replaceChildren();

  if (allMsgs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-slate-500 text-center py-3";
    empty.textContent = "Belum ada pesan. Pilih peserta tujuan dan kirim teks atau gambar kapan saja.";
    listEl.appendChild(empty);
    return;
  }

  const clearedSet = getClearedChatMessageIdSet_();
  const visibleMsgs = allMsgs.filter(msg => {
    if (clearedSet.has(getChatMessageFingerprint_(msg))) {
      return false;
    }
    const recKey = normalizeChatUserKey(msg.penerima_key || "");
    const sndKey = normalizeChatUserKey(msg.pengirim_key || "");
    const isConsultMsg = isConsultationMessage_(msg);
    if (activeDeskMode === "CONSULT") {
      return isConsultMsg && (deskAdminLoggedIn || sndKey === myKey || recKey === myKey);
    }
    return !isConsultMsg;
  });

  if (visibleMsgs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-slate-500 text-center py-3";
    empty.textContent = activeDeskMode === "CONSULT"
      ? "Belum ada pesan konsultasi ke Admin D-BEST DESK."
      : "Belum ada pesan. Pilih peserta tujuan dan kirim teks atau gambar kapan saja.";
    listEl.appendChild(empty);
    return;
  }

  visibleMsgs.forEach(msg => {
    const isMine = msg.pengirim_key === myKey;
    const item = document.createElement("div");
    item.className = isMine
      ? "bg-teal-50 border border-teal-200 rounded-lg p-2.5 space-y-1.5 ml-6"
      : "bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 mr-6";

    const meta = document.createElement("div");
    meta.className = "flex flex-wrap items-center justify-between gap-2 text-[11px]";

    const direction = document.createElement("span");
    direction.className = isMine ? "font-extrabold text-teal-900" : "font-extrabold text-slate-800";
    direction.textContent = isMine
      ? `Anda → ${msg.nama_penerima || "Peserta"}`
      : `${msg.nama_pengirim || "Peserta"} → Anda`;

    const rightBox = document.createElement("div");
    rightBox.className = "flex items-center gap-2";

    const statusTag = document.createElement("span");
    const stUpper = String(msg.status || "TERKIRIM").toUpperCase();
    statusTag.className = stUpper === "DIBACA"
      ? "text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800"
      : "text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800";
    statusTag.textContent = stUpper;

    const time = document.createElement("span");
    time.className = "text-[10px] text-slate-400";
    time.textContent = formatShortDate(msg.waktu);

    rightBox.append(statusTag, time);

    if (!isMine && msg.pengirim_key) {
      const replyBtn = document.createElement("button");
      replyBtn.type = "button";
      replyBtn.className = "text-[10px] font-extrabold text-teal-700 hover:underline";
      replyBtn.textContent = "Balas";
      replyBtn.onclick = () => prepareReplyToSender(msg.pengirim_key);
      rightBox.appendChild(replyBtn);
    }

    meta.append(direction, rightBox);
    item.appendChild(meta);

    const safeImg = String(msg.gambar_data || "").trim();
    if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(safeImg)) {
      const imgEl = document.createElement("img");
      imgEl.src = safeImg;
      imgEl.alt = "Gambar lampiran pesan";
      imgEl.className = "max-h-52 rounded-lg border border-slate-200 bg-white object-contain";
      item.appendChild(imgEl);
    }

    if (msg.pesan) {
      const body = document.createElement("p");
      body.className = "text-xs text-slate-700 break-words";
      body.textContent = msg.pesan;
      item.appendChild(body);
    }

    listEl.appendChild(item);
  });

  listEl.scrollTop = listEl.scrollHeight;
}

async function loadChatMessages(refreshRecipients = false, markRead = false) {
  const listEl = document.getElementById("chatMessagesList");
  const fbEl = document.getElementById("chatFeedbackText");
  const endpoint = getScriptEndpoint();
  if (!listEl) return;

  const myKey = getCurrentChatUserKey();
  if (!myKey) {
    cachedChatMessages = [];
    listEl.innerHTML = `<div class="text-amber-800 text-center py-3 font-semibold">Silakan Login terlebih dahulu untuk melihat dan mengirim pesan.</div>`;
    return;
  }

  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    listEl.innerHTML = `<div class="text-slate-500 text-center py-3">Hubungkan GOOGLE_SCRIPT_URL untuk memuat pesan dari tab PesanChat.</div>`;
    return;
  }

  if (refreshRecipients) {
    await loadChatRecipients(myKey);
  }

  try {
    const url = `${endpoint}?mode=chat&user=${encodeURIComponent(myKey)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json && json.status === "sukses" && Array.isArray(json.chat)) {
      const prevLen = cachedChatMessages.length;
      cachedChatMessages = mergeServerAndLocalChatMessages_(json.chat);
      renderFilteredChatMessages();
      if (deskAdminLoggedIn) {
        renderDeskAdminConsultationQueue_();
      }
      if (fbEl) fbEl.classList.add("hidden");

      if (markRead && json.chat.length >= prevLen) {
        await markIncomingChatReadOnServer(myKey);
      }
    } else {
      listEl.innerHTML = `<div class="text-rose-600 text-center py-3">Gagal memuat pesan.</div>`;
    }
  } catch (err) {
    listEl.innerHTML = `<div class="text-slate-500 text-center py-3">Tidak dapat memuat pesan saat ini. Periksa koneksi internet.</div>`;
  }
}

async function sendChatMessage(event) {
  if (event) event.preventDefault();
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Fitur pesan tidak dapat digunakan saat ujian berlangsung.");
    return;
  }

  const recSelect = document.getElementById("chatRecipientSelect");
  const inputEl = document.getElementById("chatMessageInput");
  const fbEl = document.getElementById("chatFeedbackText");
  const sendBtn = document.getElementById("sendChatBtn");

  const isConsultMode = activeDeskMode === "CONSULT";
  const myKey = isConsultMode && deskAdminLoggedIn
    ? DESK_ADMIN_CREDENTIALS.adminKey
    : getCurrentChatUserKey();

  let recipientKey = (recSelect?.value || "").trim();
  let recipientName = recSelect?.selectedOptions?.[0]?.dataset?.nama || recSelect?.selectedOptions?.[0]?.textContent || "";

  if (isConsultMode) {
    // Konsultasi hanya ditujukan ke Admin D-BEST DESK (atau balasan Admin ke peserta terpilih)
    if (deskAdminLoggedIn && deskAdminReplyTargetKey) {
      recipientKey = normalizeChatUserKey(deskAdminReplyTargetKey);
      recipientName = deskAdminReplyTargetName || recipientKey;
    } else {
      recipientKey = DESK_ADMIN_CREDENTIALS.adminKey;
      recipientName = DESK_ADMIN_CREDENTIALS.adminLabel;
    }
  }

  const rawText = (inputEl?.value || "").trim();

  if (!myKey) {
    if (fbEl) {
      fbEl.textContent = "Silakan Login terlebih dahulu sebelum mengirim pesan.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (!isConsultMode && !recipientKey) {
    if (fbEl) {
      fbEl.textContent = "Pilih peserta tujuan terlebih dahulu.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (!rawText && !pendingChatImageData) {
    if (fbEl) {
      fbEl.textContent = "Tuliskan pesan atau pilih gambar terlebih dahulu.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (rawText && typeof findProfanityInName === "function" && findProfanityInName(rawText).length > 0) {
    if (fbEl) {
      fbEl.textContent = "Pesan mengandung kata yang tidak diperbolehkan.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }

  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (fbEl) {
      fbEl.textContent = "Hubungkan GOOGLE_SCRIPT_URL agar pesan tersimpan ke Google Sheets.";
      fbEl.className = "text-xs font-semibold text-amber-700";
      fbEl.classList.remove("hidden");
    }
    return;
  }

  const senderName = isConsultMode && deskAdminLoggedIn
    ? DESK_ADMIN_CREDENTIALS.adminLabel
    : getCurrentChatSenderName();
  const imagePayload = pendingChatImageData;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Mengirim...";
  }

  try {
    await pingOnlinePresence_();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "send_chat",
        kategori_desk: activeDeskMode === "CONSULT"
          ? `${document.getElementById("consultTopicSelect")?.value || "Konsultasi"} - ${document.getElementById("consultSubIssueSelect")?.value || "umum"}`
          : "Chat Peserta",
        nama_pengirim: senderName,
        pengirim_key: myKey,
        nama_penerima: recipientName,
        penerima_key: recipientKey,
        pesan: (
          activeDeskMode === "CONSULT" && rawText && !/^\[konsultasi/i.test(rawText)
            ? `[D-BEST DESK - ${document.getElementById("consultTopicSelect")?.value || "Konsultasi"}] ${rawText}`
            : (rawText || (imagePayload ? "[Mengirim gambar]" : ""))
        ),
        gambar_data: imagePayload
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      const sentMsgText = (
        activeDeskMode === "CONSULT" && rawText && !/^\[konsultasi/i.test(rawText)
          ? `[D-BEST DESK - ${document.getElementById("consultTopicSelect")?.value || "Konsultasi"}] ${rawText}`
          : (rawText || (imagePayload ? "[Mengirim gambar]" : ""))
      );
      if (activeDeskMode === "CONSULT") {
        saveLocalConsultationCache_({
          id: `cns_${Date.now()}`,
          waktu: new Date().toISOString(),
          kategori_desk: `${document.getElementById("consultTopicSelect")?.value || "Konsultasi"} - ${document.getElementById("consultSubIssueSelect")?.value || "umum"}`,
          nama_pengirim: senderName,
          pengirim_key: myKey,
          nama_penerima: recipientName,
          penerima_key: recipientKey,
          pesan: sentMsgText,
          gambar_data: imagePayload,
          status: "TERKIRIM"
        });
      }
      if (inputEl) inputEl.value = "";
      clearChatImageSelection();
      if (fbEl) {
        fbEl.textContent = (json && json.pesan) || "Pesan terkirim ke antrean penerima.";
        fbEl.className = "text-xs font-semibold text-emerald-700";
        fbEl.classList.remove("hidden");
      }
      await loadChatMessages(false, false);
    } else {
      if (fbEl) {
        fbEl.textContent = (json && json.pesan) || "Gagal mengirim pesan.";
        fbEl.className = "text-xs font-semibold text-rose-600";
        fbEl.classList.remove("hidden");
      }
    }
  } catch (err) {
    if (fbEl) {
      fbEl.textContent = "Gagal mengirim pesan. Periksa koneksi internet.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Kirim Pesan";
    }
  }
}

function getLocalSurveyHistory() {
  try {
    const raw = localStorage.getItem(SURVEY_HISTORY_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function saveSurveyToLocalHistory(entry) {
  const list = getLocalSurveyHistory();
  list.unshift(entry);
  localStorage.setItem(SURVEY_HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}

function getSurveyQualityCategory_(ikmVal) {
  const ikm = Number(ikmVal || 0);
  if (ikm >= 88.31) {
    return {
      label: "Sangat Baik",
      grade: "A",
      badgeCls: "bg-emerald-100 text-emerald-800 border border-emerald-200"
    };
  }
  if (ikm >= 76.61) {
    return {
      label: "Baik",
      grade: "B",
      badgeCls: "bg-blue-100 text-blue-800 border border-blue-200"
    };
  }
  if (ikm >= 65.0) {
    return {
      label: "Kurang Baik",
      grade: "C",
      badgeCls: "bg-amber-100 text-amber-900 border border-amber-200"
    };
  }
  return {
    label: "Tidak Baik",
    grade: "D",
    badgeCls: "bg-rose-100 text-rose-800 border border-rose-200"
  };
}

function isCurrentUserAdmin_() {
  const uname = String(
    (typeof loggedUser !== "undefined" && loggedUser && loggedUser.username) || ""
  ).trim().toLowerCase();
  const activeName = safeAccountKey(getActiveUserFilterName());
  return uname === "best_d" || uname === "admin" || activeName === "best d pamungkas" || activeName === "admin";
}

function updateAdminSurveyResetVisibility_() {
  const box = document.getElementById("adminSurveyResetBox");
  if (!box) return;
  box.classList.toggle("hidden", !isCurrentUserAdmin_());
}

async function fetchSharedSurveyListFromServer_() {
  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    return null;
  }
  try {
    const res = await fetch(`${endpoint}?mode=survei`);
    const json = await res.json();
    if (json && json.status === "sukses" && Array.isArray(json.survei)) {
      return json.survei;
    }
  } catch (err) {
    console.warn("Gagal memuat daftar survei bersama dari sheet:", err);
  }
  return null;
}

async function resetSurveyDataAsAdmin() {
  const keyInput = document.getElementById("adminSurveyResetKeyInput");
  const statusEl = document.getElementById("adminSurveyResetStatus");
  const btn = document.getElementById("adminResetSurveyBtn");

  if (!isCurrentUserAdmin_()) {
    alert("Hanya admin yang memiliki akses untuk mereset data survei.");
    return;
  }

  const adminKey = (keyInput?.value || "").trim();
  if (!adminKey) {
    if (statusEl) {
      statusEl.textContent = "Masukkan kunci reset admin terlebih dahulu.";
      statusEl.className = "text-xs font-semibold text-rose-600";
      statusEl.classList.remove("hidden");
    }
    return;
  }

  if (!confirm("Yakin ingin mereset seluruh isi survei SKM di spreadsheet dan browser?")) {
    return;
  }

  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    localStorage.removeItem(SURVEY_HISTORY_STORAGE_KEY);
    localStorage.removeItem(SURVEY_COMPLETED_ACCOUNTS_KEY);
    if (keyInput) keyInput.value = "";
    if (statusEl) {
      statusEl.textContent = "Data survei lokal berhasil direset.";
      statusEl.className = "text-xs font-semibold text-emerald-700";
      statusEl.classList.remove("hidden");
    }
    await renderDashboardSurveySummary();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Mereset...";
  }

  try {
    const actorUsername = String(
      (typeof loggedUser !== "undefined" && loggedUser && loggedUser.username) || "best_d"
    ).trim();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "reset_survey_skm",
        username: actorUsername,
        admin_key: adminKey
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      localStorage.removeItem(SURVEY_HISTORY_STORAGE_KEY);
      localStorage.removeItem(SURVEY_COMPLETED_ACCOUNTS_KEY);
      if (keyInput) keyInput.value = "";
      if (statusEl) {
        statusEl.textContent = json.pesan || "Seluruh data survei SKM berhasil direset oleh admin.";
        statusEl.className = "text-xs font-semibold text-emerald-700";
        statusEl.classList.remove("hidden");
      }
      await renderDashboardSurveySummary();
    } else {
      if (statusEl) {
        statusEl.textContent = (json && json.pesan) || "Reset survei ditolak.";
        statusEl.className = "text-xs font-semibold text-rose-600";
        statusEl.classList.remove("hidden");
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "Gagal menghubungi server saat mereset survei.";
      statusEl.className = "text-xs font-semibold text-rose-600";
      statusEl.classList.remove("hidden");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Reset Survei (Admin)";
    }
  }
}

function sanitizePublicSurveyItem_(item, index = 0) {
  const rawUnsur = Array.isArray(item?.unsur) ? item.unsur : [];
  const unsurArr = rawUnsur.length === 9
    ? rawUnsur.map(v => {
        const num = Number(v);
        return Number.isFinite(num) && num >= 1 && num <= 4 ? num : 3;
      })
    : [];

  let nrrVal = Number(item?.nrr);
  let ikmVal = Number(item?.ikm);

  if ((!Number.isFinite(nrrVal) || nrrVal <= 0) && unsurArr.length === 9) {
    nrrVal = Number((unsurArr.reduce((a, b) => a + b, 0) / 9).toFixed(2));
  } else if (!Number.isFinite(nrrVal)) {
    nrrVal = 0;
  }

  if ((!Number.isFinite(ikmVal) || ikmVal <= 0) && nrrVal > 0) {
    ikmVal = Number((nrrVal * 25).toFixed(2));
  } else if (!Number.isFinite(ikmVal)) {
    ikmVal = 0;
  }

  const catatanStr = String(item?.catatan || "").trim();
  const hasMeaningfulData = unsurArr.length === 9 || nrrVal > 0 || ikmVal > 0 || catatanStr.length > 0;
  if (!hasMeaningfulData) return null;

  return {
    id: `anon_srv_${index}`,
    waktu: item?.waktu || "",
    unsur: unsurArr,
    nrr: nrrVal,
    ikm: ikmVal,
    kategori: String(item?.kategori || "").trim(),
    catatan: catatanStr || "-"
  };
}

async function renderDashboardSurveySummary() {
  const nrrCardEl = document.getElementById("dashSurveyAvgNrr")?.closest("div");
  const nrrEl = document.getElementById("dashSurveyAvgNrr");
  const ikmEl = document.getElementById("dashSurveyAvgIkm");
  const catEl = document.getElementById("dashSurveyAvgCategory");
  const countEl = document.getElementById("dashSurveyCountBadge");
  const listEl = document.getElementById("dashSurveyRecentList");
  updateAdminSurveyResetVisibility_();
  if (!nrrEl && !ikmEl && !catEl && !countEl && !listEl) return;

  if (nrrCardEl) {
    nrrCardEl.classList.remove("hidden");
  }

  if (listEl) {
    listEl.replaceChildren();
    listEl.classList.add("hidden");
  }

  const remoteList = await fetchSharedSurveyListFromServer_();
  if (!Array.isArray(remoteList)) {
    if (nrrEl) nrrEl.textContent = "-";
    if (ikmEl) ikmEl.textContent = "-";
    if (catEl) {
      catEl.textContent = "-";
      catEl.className = "text-xl font-extrabold text-slate-900 mt-0.5";
    }
    if (countEl) countEl.textContent = "0 Responden";
    return;
  }

  const list = remoteList
    .map((item, idx) => sanitizePublicSurveyItem_(item, idx))
    .filter(Boolean);

  const totalCount = list.length;
  const avgNrr = totalCount > 0
    ? Number((list.reduce((sum, item) => sum + Number(item.nrr || 0), 0) / totalCount).toFixed(2))
    : 0;
  const avgIkm = totalCount > 0
    ? Number((list.reduce((sum, item) => sum + Number(item.ikm || 0), 0) / totalCount).toFixed(2))
    : 0;

  if (countEl) countEl.textContent = `${totalCount} Responden`;
  if (nrrEl) nrrEl.textContent = totalCount > 0 ? `${avgNrr} / 4,000` : "-";
  if (ikmEl) ikmEl.textContent = totalCount > 0 ? `${avgIkm}` : "-";
  if (catEl) {
    if (totalCount > 0) {
      const qCat = getSurveyQualityCategory_(avgIkm);
      catEl.textContent = `${qCat.label} (${qCat.grade})`;
      catEl.className = `text-base font-extrabold mt-1 inline-block px-2.5 py-0.5 rounded-lg ${qCat.badgeCls}`;
    } else {
      catEl.textContent = "-";
      catEl.className = "text-xl font-extrabold text-slate-900 mt-0.5";
    }
  }
}

function openDashboardSurveyModal() {
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Selesaikan atau keluar dari sesi ujian aktif terlebih dahulu sebelum mengisi survei.");
    return;
  }
  if (hasAccountCompletedSurvey_()) {
    alert("Akun ini sudah mengisi Survei SKM (1 akun hanya boleh mengisi 1 kali).");
    return;
  }

  const modal = document.getElementById("dashboardSurveyModal");
  const nameEl = document.getElementById("dashSurveyNameInput");
  const contactEl = document.getElementById("dashSurveyContactInput");
  const statusEl = document.getElementById("dashSurveyStatusText");

  if (statusEl) {
    statusEl.textContent = "";
    statusEl.classList.add("hidden");
  }

  const activeName = getActiveUserFilterName();
  if (nameEl && !nameEl.value && activeName) {
    nameEl.value = activeName;
  }
  if (contactEl && !contactEl.value && typeof loggedUser !== "undefined" && loggedUser?.email) {
    contactEl.value = loggedUser.email;
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeDashboardSurveyModal() {
  const modal = document.getElementById("dashboardSurveyModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

async function submitDashboardSurvey(event) {
  if (event) event.preventDefault();

  const statusElEarly = document.getElementById("dashSurveyStatusText");
  if (hasAccountCompletedSurvey_()) {
    if (statusElEarly) {
      statusElEarly.textContent = "Akun ini sudah mengisi Survei SKM (1 akun = 1 survei).";
      statusElEarly.className = "text-xs font-semibold rounded-xl p-3 bg-amber-50 text-amber-900 border border-amber-200";
      statusElEarly.classList.remove("hidden");
    }
    return;
  }

  const uVals = [
    Number(document.getElementById("skmU1")?.value || 3),
    Number(document.getElementById("skmU2")?.value || 3),
    Number(document.getElementById("skmU3")?.value || 3),
    Number(document.getElementById("skmU4")?.value || 3),
    Number(document.getElementById("skmU5")?.value || 3),
    Number(document.getElementById("skmU6")?.value || 3),
    Number(document.getElementById("skmU7")?.value || 3),
    Number(document.getElementById("skmU8")?.value || 3),
    Number(document.getElementById("skmU9")?.value || 3)
  ];

  const avgUnsur = Number((uVals.reduce((a, b) => a + b, 0) / 9).toFixed(2));
  const ikmKonversi = Number((avgUnsur * 25).toFixed(2));
  const qCat = getSurveyQualityCategory_(ikmKonversi);

  const nameInput = (document.getElementById("dashSurveyNameInput")?.value || "").trim();
  const contactInput = (document.getElementById("dashSurveyContactInput")?.value || "").trim();
  const feedbackEl = document.getElementById("dashSurveyFeedbackInput");
  const feedbackText = (feedbackEl?.value || "").trim();
  const statusEl = document.getElementById("dashSurveyStatusText");
  const submitBtn = document.getElementById("dashSubmitSurveyBtn");

  if (feedbackText.length < 4) {
    if (statusEl) {
      statusEl.textContent = "Tuliskan saran atau masukan minimal 4 karakter.";
      statusEl.className = "text-xs font-semibold rounded-xl p-3 bg-rose-50 text-rose-700 border border-rose-200";
      statusEl.classList.remove("hidden");
    }
    return;
  }

  const reporterName = nameInput || getActiveUserFilterName() || "Peserta Dashboard";
  const accKey = safeAccountKey(loggedUser?.username || loggedUser?.email || reporterName);
  const summaryMeta =
    `U1:${uVals[0]} | U2:${uVals[1]} | U3:${uVals[2]} | U4:${uVals[3]} | U5:${uVals[4]} | ` +
    `U6:${uVals[5]} | U7:${uVals[6]} | U8:${uVals[7]} | U9:${uVals[8]} ` +
    `(NRR:${avgUnsur}/4, IKM:${ikmKonversi}, Mutu:${qCat.label}) • Kontak:${contactInput || "-"}`;

  saveSurveyToLocalHistory({
    id: `skm_${Date.now()}`,
    waktu: new Date().toISOString(),
    accountKey: accKey,
    nama: reporterName,
    kontak: contactInput || "-",
    unsur: uVals,
    nrr: avgUnsur,
    ikm: ikmKonversi,
    kategori: qCat.label,
    catatan: feedbackText
  });
  markAccountSurveyCompleted_(accKey);
  await renderDashboardSurveySummary();

  const endpoint = getScriptEndpoint();
  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (feedbackEl) feedbackEl.value = "";
    if (statusEl) {
      statusEl.textContent = `Terima kasih ${reporterName} (NRR ${avgUnsur}/4 • IKM ${ikmKonversi} • ${qCat.label}). Survei 9 unsur tercatat untuk akun ini.`;
      statusEl.className = "text-xs font-semibold rounded-xl p-3 bg-emerald-50 text-emerald-800 border border-emerald-200";
      statusEl.classList.remove("hidden");
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "submit_survey_skm",
        nomor_soal: 0,
        subtest: "SURVEI_SKM_9",
        category: "Survei SKM 9 Unsur (Dashboard)",
        question: summaryMeta.slice(0, 450),
        catatan: `${feedbackText} [NRR: ${avgUnsur}/4 | IKM: ${ikmKonversi} | Mutu: ${qCat.label}]`,
        pelapor: reporterName,
        username: loggedUser?.username || accKey,
        u1: uVals[0], u2: uVals[1], u3: uVals[2],
        u4: uVals[3], u5: uVals[4], u6: uVals[5],
        u7: uVals[6], u8: uVals[7], u9: uVals[8],
        nrr: avgUnsur,
        ikm: ikmKonversi,
        kategori_mutu: qCat.label
      })
    });
    const json = await res.json();
    if (statusEl) {
      if (json && json.status === "sukses") {
        if (feedbackEl) feedbackEl.value = "";
        await renderDashboardSurveySummary();
        statusEl.textContent = `Terima kasih! Survei 9 unsur SKM Anda (NRR ${avgUnsur}/4 • IKM ${ikmKonversi} • ${qCat.label}) berhasil dikirim ke Google Sheets.`;
        statusEl.className = "text-xs font-semibold rounded-xl p-3 bg-emerald-50 text-emerald-800 border border-emerald-200";
      } else {
        statusEl.textContent = "Survei belum terkirim: " + ((json && json.pesan) || "coba lagi.");
        statusEl.className = "text-xs font-semibold rounded-xl p-3 bg-rose-50 text-rose-700 border border-rose-200";
      }
      statusEl.classList.remove("hidden");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "Gagal mengirim survei. Periksa koneksi internet Anda.";
      statusEl.className = "text-xs font-semibold rounded-xl p-3 bg-rose-50 text-rose-700 border border-rose-200";
      statusEl.classList.remove("hidden");
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Survei SKM";
    }
  }
}

let postExamSurveyCompletedForSession = false;

function markPostExamSurveyCompleted_() {
  postExamSurveyCompletedForSession = true;
  const openBtn = document.getElementById("openPostExamSurveyBtn");
  if (openBtn) {
    openBtn.textContent = "Survei SKM Sudah Terisi ✓";
    openBtn.className = "px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold transition";
  }
}

function resetPostExamSurveySessionState_() {
  const alreadyDoneForAccount = typeof hasAccountCompletedSurvey_ === "function"
    ? hasAccountCompletedSurvey_()
    : false;
  postExamSurveyCompletedForSession = alreadyDoneForAccount;
  const openBtn = document.getElementById("openPostExamSurveyBtn");
  const submitBtn = document.getElementById("submitSurveyBtn");
  if (openBtn) {
    if (alreadyDoneForAccount) {
      openBtn.textContent = "Survei SKM Sudah Terisi ✓";
      openBtn.disabled = true;
      openBtn.className = "px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold opacity-90 cursor-not-allowed transition";
    } else {
      openBtn.textContent = "Isi Survei SKM Dulu";
      openBtn.disabled = false;
      openBtn.className = "px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition";
    }
  }
  if (submitBtn && alreadyDoneForAccount) {
    submitBtn.disabled = true;
  } else if (submitBtn) {
    submitBtn.disabled = false;
  }
}

function isMandatorySurveyCompleted() {
  if (postExamSurveyCompletedForSession) return true;
  if (typeof hasAccountCompletedSurvey_ === "function" && hasAccountCompletedSurvey_()) {
    postExamSurveyCompletedForSession = true;
    return true;
  }
  return false;
}

function requireSurveyBeforeAction(actionLabel = "melanjutkan") {
  if (isMandatorySurveyCompleted()) return true;

  reopenPostExamPrompt(true);
  const formEl = document.getElementById("postExamSurveyForm");
  const fbInput = document.getElementById("surveyFeedbackInput");
  const statusEl = document.getElementById("postExamSurveyStatus");

  if (formEl) {
    formEl.classList.remove("hidden");
    formEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (statusEl) {
    statusEl.textContent = `Silakan isi & kirim Survei SKM 9 Unsur (sekali per akun) sebelum ${actionLabel}.`;
    statusEl.className = "text-xs font-semibold text-amber-800";
    statusEl.classList.remove("hidden");
  }
  if (fbInput) {
    setTimeout(() => fbInput.focus(), 120);
  }
  return false;
}


const VISITOR_ID_STORAGE_KEY = "cat_skd_visitor_uid_v1";
const VISITOR_STATS_CACHE_KEY = "cat_skd_visitor_stats_cache_v1";
let visitorHeartbeatTimer = null;

function getOrCreateBrowserVisitorId_() {
  try {
    let vid = localStorage.getItem(VISITOR_ID_STORAGE_KEY);
    if (!vid) {
      vid = `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(VISITOR_ID_STORAGE_KEY, vid);
    }
    return vid;
  } catch (err) {
    return `vis_session_${Math.random().toString(36).slice(2, 8)}`;
  }
}

function renderVisitorStatsUI_(stats) {
  if (!stats || typeof stats !== "object") return;
  const curVal = Number(stats.pengunjung_saat_ini ?? 0);
  const totVal = Number(stats.total_pengunjung ?? 0);
  const avgVal = Number(stats.rata_rata_pengunjung ?? 0);
  const daysVal = Math.max(1, Number(stats.hari_aktif ?? 1));

  const formatNum = (n) => Number.isFinite(n) ? n.toLocaleString("id-ID") : "-";
  const formatAvg = (n) => Number.isFinite(n) ? n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 1 }) : "-";

  const heroCur = document.getElementById("heroVisitorCurrent");
  const heroTot = document.getElementById("heroVisitorTotal");
  const heroAvg = document.getElementById("heroVisitorAverage");
  if (heroCur) heroCur.textContent = `${formatNum(curVal)} orang`;
  if (heroTot) heroTot.textContent = `${formatNum(totVal)} orang`;
  if (heroAvg) heroAvg.textContent = `${formatAvg(avgVal)} / hari`;

  const dashCur = document.getElementById("dashVisitorCurrent");
  const dashTot = document.getElementById("dashVisitorTotal");
  const dashAvg = document.getElementById("dashVisitorAverage");
  const dashDays = document.getElementById("dashVisitorActiveDaysBadge");
  if (dashCur) dashCur.textContent = `${formatNum(curVal)} orang`;
  if (dashTot) dashTot.textContent = `${formatNum(totVal)} orang`;
  if (dashAvg) dashAvg.textContent = `${formatAvg(avgVal)} orang/hari`;
  if (dashDays) dashDays.textContent = `Rentang ${formatNum(daysVal)} Hari`;
}

function loadCachedVisitorStats_() {
  try {
    const raw = localStorage.getItem(VISITOR_STATS_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed) renderVisitorStatsUI_(parsed);
  } catch (err) {}
}

async function pingAndRefreshVisitorStats_() {
  loadCachedVisitorStats_();
  const endpoint = getScriptEndpoint();
  const vid = getOrCreateBrowserVisitorId_();
  const activeName = getActiveUserFilterName() || "Tamu";

  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    const fallbackStats = {
      pengunjung_saat_ini: 1,
      total_pengunjung: 1,
      rata_rata_pengunjung: 1,
      hari_aktif: 1
    };
    renderVisitorStatsUI_(fallbackStats);
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "ping_visitor",
        visitor_id: vid,
        nama: activeName
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      localStorage.setItem(VISITOR_STATS_CACHE_KEY, JSON.stringify(json));
      renderVisitorStatsUI_(json);
    }
  } catch (err) {
    try {
      const resGet = await fetch(`${endpoint}?mode=pengunjung`);
      const jsonGet = await resGet.json();
      if (jsonGet && jsonGet.status === "sukses") {
        localStorage.setItem(VISITOR_STATS_CACHE_KEY, JSON.stringify(jsonGet));
        renderVisitorStatsUI_(jsonGet);
      }
    } catch (e2) {}
  }
}

function startVisitorTrackingLoop_() {
  pingAndRefreshVisitorStats_();
  if (visitorHeartbeatTimer) {
    clearInterval(visitorHeartbeatTimer);
  }
  visitorHeartbeatTimer = setInterval(() => {
    pingAndRefreshVisitorStats_();
  }, 60000);
}


let activeDeskMode = "PEER";

const CONSULTATION_GUIDES = {
  kualifikasi_formasi: {
    title: "Panduan Pemberkasan Administrasi — Kesesuaian Kualifikasi Pendidikan & Formasi",
    steps: [
      "Pastikan program studi, jenjang pendidikan, dan kompetensi pada ijazah/transkrip sesuai dengan persyaratan jabatan atau formasi yang dilamar.",
      "Siapkan dokumen penyetaraan atau keterangan resmi apabila terdapat penyesuaian nomenklatur/bidang keilmuan sesuai ketentuan instansi.",
      "Lampirkan foto bagian dokumen atau detail formasi melalui tombol 📷 Gambar bila ingin diperiksa lebih lanjut."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Kualifikasi & Formasi] Mohon arahan terkait kesesuaian kualifikasi pendidikan dan dokumen formasi saya: "
  },
  identitas_kependudukan: {
    title: "Panduan Pemberkasan Administrasi — Dokumen Identitas & Kependudukan (KTP, KK, Akta)",
    steps: [
      "Periksa kesesuaian NIK, nomor KK, nama lengkap, serta tempat dan tanggal lahir antar dokumen kependudukan dan berkas pendaftaran.",
      "Jika sedang mengurus pembaruan data kependudukan, simpan bukti pengajuan/proses resmi sembari memantau tenggat pemberkasan.",
      "Sampaikan kendala spesifik atau unggah tangkapan layar/foto dokumen melalui tombol 📷 Gambar."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Identitas KTP/KK/Akta] Saya ingin berkonsultasi mengenai data KTP/KK/Akta pada pemberkasan: "
  },
  perbedaan_nama_data: {
    title: "Panduan Pemberkasan Administrasi — Perbedaan Nama / Tanggal Lahir / Gelar",
    steps: [
      "Periksa kesesuaian nama lengkap, gelar, dan tanggal lahir pada dokumen utama (KTP, KK, ijazah/transkrip, dan akta).",
      "Siapkan surat keterangan/dokumen pendukung resmi apabila terdapat perbedaan penulisan huruf atau gelar sesuai aturan instansi.",
      "Lampirkan foto bagian dokumen yang ingin dikonsultasikan melalui tombol 📷 Gambar bila diperlukan."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Perbedaan Data/Gelar] Mohon arahan terkait perbedaan penulisan data pada berkas pemberkasan saya: "
  },
  legalisir_ijazah_transkrip: {
    title: "Panduan Pemberkasan Administrasi — Legalisir Ijazah & Transkrip",
    steps: [
      "Pastikan keabsahan ijazah, transkrip nilai, dan dokumen penyetaraan (jika berlaku) sesuai jenjang pendidikan yang dilamar.",
      "Cek ketentuan legalisir (basah maupun digital/tte) sesuai pengumuman resmi instansi.",
      "Tuliskan detail kendala dokumen atau unggah gambar/tangkapan layar persyaratan."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Ijazah & Transkrip] Saya ingin berkonsultasi mengenai kelengkapan/legalisir ijazah dan transkrip: "
  },
  dokumen_kesehatan_skck: {
    title: "Panduan Pemberkasan Administrasi — Surat Sehat, Bebas NAPZA & SKCK",
    steps: [
      "Siapkan dokumen pendukung yang dipersyaratkan instansi (surat keterangan sehat jasmani/rohani, bebas NAPZA, dan SKCK) dengan masa berlaku yang masih aktif.",
      "Perhatikan format tanggal penerbitan serta kesesuaian identitas pada tiap surat keterangan.",
      "Sampaikan kendala jadwal penerbitan atau format berkas pada kolom pesan di bawah."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Dokumen Sehat & SKCK] Mohon solusi terkait pengurusan berkas kesehatan/SKCK: "
  },
  format_ejaan_dokumen: {
    title: "Panduan Pemberkasan Administrasi — Penulisan, Tanda Apostrof (') & Format Dokumen Resmi",
    steps: [
      "Pastikan ejaan nama, tanda apostrof ('), serta format surat pernyataan/komitmen mengikuti pedoman resmi instansi dan ejaan bahasa Indonesia yang berlaku.",
      "Periksa kembali tanda tangan, tanggal, dan kelengkapan lampiran sebelum berkas diserahkan atau diunggah.",
      "Gunakan tombol 📷 Gambar bila ingin menanyakan kesesuaian format berkas atau surat pernyataan."
    ],
    template: "[Konsultasi Pemberkasan Administrasi - Penulisan & Format Dokumen] Mohon pengecekan terkait penulisan nama/format surat pernyataan: "
  },
  checklist_pra_daftar_ulang: {
    title: "Panduan Daftar Ulang — Checklist Pra-Daftar Ulang (H-3 s.d. Hari-H)",
    steps: [
      "H-3 s.d. H-1: Susun checklist berkas asli, salinan/fotokopi, dan berkas digital sesuai ketentuan instansi agar tidak ada yang tertinggal.",
      "Hari-H: Siapkan perlengkapan/atribut sesuai ketentuan, datang lebih awal dari jadwal sesi, dan pastikan identitas siap ditunjukkan.",
      "Simpan bukti registrasi/tanda terima daftar ulang setelah proses selesai."
    ],
    template: "[Konsultasi Daftar Ulang - Checklist H-3 s.d. Hari-H] Mohon panduan checklist persiapan berkas dan perlengkapan daftar ulang: "
  },
  alur_daftar_ulang: {
    title: "Panduan Daftar Ulang — Alur, Konfirmasi Kehadiran & Jadwal Daftar Ulang",
    steps: [
      "Catat jadwal, sesi/kelompok, mekanisme (daring atau luring), serta batas waktu daftar ulang agar tidak terlewat.",
      "Pastikan konfirmasi kehadiran atau pengisian data pada sistem/loket sudah berstatus tercatat/terverifikasi.",
      "Tuliskan pertanyaan spesifik terkait alur atau kendala daftar ulang Anda."
    ],
    template: "[Konsultasi Daftar Ulang - Alur & Jadwal] Mohon informasi/solusi terkait alur, jadwal, dan konfirmasi daftar ulang: "
  },
  kendala_teknis_deadline: {
    title: "Panduan Daftar Ulang — Antisipasi Kendala Teknis & Batas Waktu Daftar Ulang",
    steps: [
      "Lakukan pengisian dan unggah berkas lebih awal dari batas waktu (deadline) untuk menghindari antrean akses sistem di jam terakhir.",
      "Jika terjadi gangguan sistem atau gagal unggah, catat waktu kejadian serta ambil tangkapan layar sebagai bukti pendukung.",
      "Segera sampaikan detail kendala teknis yang dialami melalui kolom pesan di bawah."
    ],
    template: "[Konsultasi Daftar Ulang - Kendala Teknis & Deadline] Mohon bantuan solusi terkait kendala teknis/batas waktu daftar ulang: "
  }
};

function switchDeskMode(mode) {
  activeDeskMode = mode === "CONSULT" ? "CONSULT" : "PEER";
  const peerBtn = document.getElementById("deskTabPeerBtn");
  const consultBtn = document.getElementById("deskTabConsultBtn");
  const consultBox = document.getElementById("deskConsultationBox");
  const peerSelectorBlock = document.getElementById("deskPeerSelectorBlock");
  const adminPortalBox = document.getElementById("deskAdminPortalBox");
  const captionEl = document.getElementById("deskModeCaption");
  const inputEl = document.getElementById("chatMessageInput");

  const activeCls = "w-full sm:w-auto text-center px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-teal-700 text-white border border-teal-800 shadow-sm text-xs font-extrabold transition leading-snug";
  const idleCls = "w-full sm:w-auto text-center px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-white text-slate-900 border border-slate-300 hover:bg-amber-50 text-xs font-extrabold transition leading-snug";

  if (peerBtn) peerBtn.className = activeDeskMode === "PEER" ? activeCls : idleCls;
  if (consultBtn) consultBtn.className = activeDeskMode === "CONSULT" ? activeCls : idleCls;

  if (consultBox) {
    consultBox.classList.toggle("hidden", activeDeskMode !== "CONSULT");
  }
  if (peerSelectorBlock) {
    peerSelectorBlock.classList.toggle("hidden", activeDeskMode !== "PEER");
  }
  if (captionEl) {
    captionEl.textContent = activeDeskMode === "CONSULT"
      ? "Konsultasi peserta ditujukan khusus ke Admin D-BEST DESK"
      : "Mode: Kirim pesan langsung ke peserta lain";
  }
  if (activeDeskMode === "CONSULT") {
    deskAdminReplyTargetKey = "";
    deskAdminReplyTargetName = "";
    if (adminPortalBox) {
      const wantsAdminBox = deskAdminLoggedIn || adminPortalBox.dataset.userToggled === "1";
      adminPortalBox.classList.toggle("hidden", !wantsAdminBox);
    }
    updateDeskAdminPortalUI_();
    if (inputEl && !deskAdminLoggedIn && !inputEl.value.trim()) {
      handleConsultationTopicChange();
    }
  } else {
    deskAdminReplyTargetKey = "";
    deskAdminReplyTargetName = "";
    if (adminPortalBox) {
      adminPortalBox.classList.add("hidden");
    }
  }
  renderFilteredChatMessages();
}

function handleConsultationTopicChange() {
  const topicSel = document.getElementById("consultTopicSelect");
  const subSel = document.getElementById("consultSubIssueSelect");
  const titleEl = document.getElementById("consultGuidanceTitle");
  const stepsEl = document.getElementById("consultGuidanceSteps");

  const rawTopic = String(topicSel?.value || "Pemberkasan Administrasi").trim();
  const isDaftarUlang = /daftar\s*ulang/i.test(rawTopic);
  const topicLabel = isDaftarUlang ? "Daftar Ulang" : "Pemberkasan Administrasi";

  const optionsByTopic = isDaftarUlang
    ? [
        { value: "checklist_pra_daftar_ulang", label: "Checklist Pra-Daftar Ulang (H-3 s.d. Hari-H)" },
        { value: "alur_daftar_ulang", label: "Alur, Konfirmasi Kehadiran & Jadwal Daftar Ulang" },
        { value: "kendala_teknis_deadline", label: "Antisipasi Kendala Teknis & Batas Waktu Daftar Ulang" }
      ]
    : [
        { value: "perbedaan_nama_data", label: "Perbedaan Nama / Tanggal Lahir / Gelar pada Dokumen" },
        { value: "kualifikasi_formasi", label: "Kesesuaian Kualifikasi Pendidikan & Jabatan/Formasi" },
        { value: "identitas_kependudukan", label: "Dokumen Identitas & Kependudukan (KTP, KK, Akta)" },
        { value: "legalisir_ijazah_transkrip", label: "Legalisir Ijazah, Transkrip, atau Penyetaraan Dokumen" },
        { value: "dokumen_kesehatan_skck", label: "Surat Keterangan Sehat, Bebas NAPZA & SKCK" },
        { value: "format_ejaan_dokumen", label: "Penulisan, Tanda Apostrof (') & Format Dokumen Resmi" }
      ];

  if (subSel) {
    const prevVal = subSel.value;
    const validVals = optionsByTopic.map(o => o.value);
    subSel.replaceChildren();
    optionsByTopic.forEach(optData => {
      const opt = document.createElement("option");
      opt.value = optData.value;
      opt.textContent = optData.label;
      subSel.appendChild(opt);
    });
    subSel.value = validVals.includes(prevVal) ? prevVal : optionsByTopic[0].value;
  }

  const subKey = subSel?.value || optionsByTopic[0].value;
  const guide = CONSULTATION_GUIDES[subKey] || CONSULTATION_GUIDES[optionsByTopic[0].value];

  if (titleEl) {
    titleEl.textContent = `${guide.title} (${topicLabel})`;
  }
  if (stepsEl) {
    stepsEl.replaceChildren();
    guide.steps.forEach(st => {
      const li = document.createElement("li");
      li.textContent = st;
      stepsEl.appendChild(li);
    });
  }
}
function applyConsultPromptTemplate() {
  const subSel = document.getElementById("consultSubIssueSelect");
  const inputEl = document.getElementById("chatMessageInput");
  const subKey = subSel?.value || "perbedaan_nama_data";
  const guide = CONSULTATION_GUIDES[subKey] || CONSULTATION_GUIDES.perbedaan_nama_data;

  if (inputEl) {
    inputEl.value = guide.template;
    inputEl.focus();
  }
}


const DESK_ADMIN_CREDENTIALS = {
  username: "admin_dbest",
  passwordDisplay: "Db3st@Desk2026!",
  passwordSha256: "20b88130a4585847e952c1a9f70f02f587966e22e564a01ba52d14e369bf9d42",
  adminKey: "admin_dbest",
  adminLabel: "Admin D-BEST DESK"
};
const DESK_ADMIN_SESSION_KEY = "dbest_desk_admin_session_v1";
let deskAdminLoggedIn = false;
let deskAdminReplyTargetKey = "";
let deskAdminReplyTargetName = "";

function loadDeskAdminSession_() {
  try {
    const raw = sessionStorage.getItem(DESK_ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.loggedIn === true && parsed.username === DESK_ADMIN_CREDENTIALS.username) {
        deskAdminLoggedIn = true;
      }
    }
  } catch (err) {}
  updateDeskAdminPortalUI_();
}

async function computeSha256Hex_(plainText) {
  const clean = String(plainText || "");
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    const buf = new TextEncoder().encode(clean);
    const digest = await window.crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "";
}

function showDeskAdminFeedback_(msg, isError = false) {
  const el = document.getElementById("deskAdminFeedbackText");
  if (!el) return;
  el.textContent = msg;
  el.className = `text-xs font-semibold ${isError ? "text-rose-600" : "text-emerald-700"}`;
  el.classList.remove("hidden");
}

function updateDeskAdminPortalUI_() {
  const loginForm = document.getElementById("deskAdminLoginForm");
  const activeBar = document.getElementById("deskAdminActiveBar");
  const activeLabel = document.getElementById("deskAdminActiveLabel");
  const badge = document.getElementById("deskAdminSessionBadge");
  const queueWrap = document.getElementById("deskAdminQueueWrapper");

  if (deskAdminLoggedIn) {
    if (loginForm) loginForm.classList.add("hidden");
    if (activeBar) activeBar.classList.remove("hidden");
    if (activeLabel) activeLabel.textContent = `Login Aktif: ${DESK_ADMIN_CREDENTIALS.adminLabel} (@${DESK_ADMIN_CREDENTIALS.username})`;
    if (badge) {
      badge.textContent = "Admin Terverifikasi";
      badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800";
    }
    if (queueWrap) queueWrap.classList.remove("hidden");
    renderDeskAdminConsultationQueue_();
  } else {
    if (loginForm) loginForm.classList.remove("hidden");
    if (activeBar) activeBar.classList.add("hidden");
    if (badge) {
      badge.textContent = "Belum Login Admin";
      badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900";
    }
    if (queueWrap) queueWrap.classList.add("hidden");
    deskAdminReplyTargetKey = "";
    deskAdminReplyTargetName = "";
  }
}

async function handleDeskAdminLogin() {
  const uInput = document.getElementById("deskAdminUserInput");
  const pInput = document.getElementById("deskAdminPassInput");
  const uVal = String(uInput?.value || "").trim().toLowerCase();
  const pVal = String(pInput?.value || "");

  if (!uVal || !pVal) {
    showDeskAdminFeedback_("Masukkan username dan password Admin D-BEST DESK.", true);
    return;
  }

  const hashHex = await computeSha256Hex_(pVal);
  const isUserMatch = uVal === DESK_ADMIN_CREDENTIALS.username;
  const isPassMatch = (hashHex && hashHex === DESK_ADMIN_CREDENTIALS.passwordSha256) || pVal === DESK_ADMIN_CREDENTIALS.passwordDisplay;

  if (!isUserMatch || !isPassMatch) {
    showDeskAdminFeedback_("Username atau password Admin D-BEST DESK tidak sesuai.", true);
    return;
  }

  deskAdminLoggedIn = true;
  try {
    sessionStorage.setItem(DESK_ADMIN_SESSION_KEY, JSON.stringify({
      loggedIn: true,
      username: DESK_ADMIN_CREDENTIALS.username,
      loginAt: Date.now()
    }));
  } catch (err) {}

  if (pInput) pInput.value = "";
  updateDeskAdminPortalUI_();
  showDeskAdminFeedback_("Berhasil login sebagai Admin D-BEST DESK.");
  await loadChatMessages(true, false);
}

function handleDeskAdminLogout() {
  deskAdminLoggedIn = false;
  deskAdminReplyTargetKey = "";
  deskAdminReplyTargetName = "";
  try {
    sessionStorage.removeItem(DESK_ADMIN_SESSION_KEY);
  } catch (err) {}
  updateDeskAdminPortalUI_();
  showDeskAdminFeedback_("Sesi Admin D-BEST DESK telah ditutup.");
  renderFilteredChatMessages();
}

function selectParticipantForAdminReply_(participantKey, participantName) {
  deskAdminReplyTargetKey = normalizeChatUserKey(participantKey);
  deskAdminReplyTargetName = String(participantName || participantKey || "Peserta").trim();
  const captionEl = document.getElementById("deskModeCaption");
  const inputEl = document.getElementById("chatMessageInput");
  if (captionEl) {
    captionEl.textContent = `Admin membalas konsultasi ke: ${deskAdminReplyTargetName}`;
  }
  if (inputEl) {
    if (!inputEl.value.trim()) {
      inputEl.value = `[Balasan Admin D-BEST DESK] `;
    }
    inputEl.focus();
  }
}

function renderDeskAdminConsultationQueue_() {
  const queueEl = document.getElementById("deskAdminConsultationQueue");
  if (!queueEl) return;

  if (!deskAdminLoggedIn) {
    queueEl.replaceChildren();
    return;
  }

  const allMsgs = Array.isArray(cachedChatMessages) ? cachedChatMessages : [];
  const consultMsgs = allMsgs.filter(m => {
    const recKey = normalizeChatUserKey(m.penerima_key || "");
    const sndKey = normalizeChatUserKey(m.pengirim_key || "");
    const txt = String(m.pesan || "");
    return recKey === DESK_ADMIN_CREDENTIALS.adminKey ||
      sndKey === DESK_ADMIN_CREDENTIALS.adminKey ||
      /^\[d-best desk|^\[konsultasi/i.test(txt);
  });

  queueEl.replaceChildren();
  if (consultMsgs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "bg-white border border-slate-200 rounded-lg p-3 text-slate-600 text-center";
    empty.textContent = "Belum ada pesan konsultasi ke Admin D-BEST DESK. Kirim tes konsultasi atau klik Segarkan Antrean.";
    queueEl.appendChild(empty);
    return;
  }

  consultMsgs.forEach(m => {
    const senderKey = normalizeChatUserKey(m.pengirim_key || "");
    const senderName = String(m.nama_pengirim || senderKey || "Peserta").trim();
    const isFromAdmin = senderKey === DESK_ADMIN_CREDENTIALS.adminKey;
    const isSelectedTarget = Boolean(deskAdminReplyTargetKey && senderKey === deskAdminReplyTargetKey);

    const card = document.createElement("div");
    card.className = isSelectedTarget
      ? "bg-teal-50 border-2 border-teal-600 rounded-lg p-3 space-y-1.5 select-text"
      : (isFromAdmin
        ? "bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 space-y-1.5 select-text"
        : "bg-white border border-slate-300 rounded-lg p-3 space-y-1.5 select-text");

    const topRow = document.createElement("div");
    topRow.className = "flex flex-wrap items-center justify-between gap-2 text-[11px]";

    const who = document.createElement("span");
    who.className = "font-extrabold text-slate-900";
    who.textContent = isFromAdmin
      ? `Admin → ${m.nama_penerima || m.penerima_key || "Peserta"}`
      : `${senderName} → Admin`;

    const right = document.createElement("div");
    right.className = "flex items-center gap-2";

    const tm = document.createElement("span");
    tm.className = "text-[10px] font-medium text-slate-500";
    tm.textContent = formatShortDate(m.waktu);
    right.appendChild(tm);

    if (!isFromAdmin && senderKey) {
      const replyBtn = document.createElement("button");
      replyBtn.type = "button";
      replyBtn.className = isSelectedTarget
        ? "px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-extrabold cursor-pointer"
        : "px-2.5 py-1 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-extrabold cursor-pointer transition";
      replyBtn.textContent = isSelectedTarget ? "Terpilih untuk Balas ✓" : "Balas Peserta";
      replyBtn.onclick = () => {
        selectParticipantForAdminReply_(senderKey, senderName);
        renderDeskAdminConsultationQueue_();
      };
      right.appendChild(replyBtn);
    }

    topRow.append(who, right);
    card.appendChild(topRow);

    const safeImg = String(m.gambar_data || "").trim();
    if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(safeImg)) {
      const imgEl = document.createElement("img");
      imgEl.src = safeImg;
      imgEl.alt = "Lampiran konsultasi peserta";
      imgEl.className = "max-h-44 rounded-lg border border-slate-200 bg-white object-contain";
      card.appendChild(imgEl);
    }

    if (m.pesan) {
      const p = document.createElement("p");
      p.className = "text-xs text-slate-800 leading-relaxed break-words whitespace-pre-line";
      p.textContent = m.pesan;
      card.appendChild(p);
    }

    queueEl.appendChild(card);
  });
}

function toggleDeskAdminPortalBox() {
  const adminPortalBox = document.getElementById("deskAdminPortalBox");
  if (!adminPortalBox) return;
  const isNowHidden = adminPortalBox.classList.contains("hidden");
  adminPortalBox.dataset.userToggled = isNowHidden ? "1" : "0";
  adminPortalBox.classList.toggle("hidden", !isNowHidden);
  if (isNowHidden) {
    updateDeskAdminPortalUI_();
  }
}


function isConsultationMessage_(msg) {
  const recKey = normalizeChatUserKey(msg?.penerima_key || "");
  const sndKey = normalizeChatUserKey(msg?.pengirim_key || "");
  const catDesk = String(msg?.kategori_desk || "").toLowerCase();
  const txt = String(msg?.pesan || "").trim();
  const adminKey = typeof DESK_ADMIN_CREDENTIALS !== "undefined"
    ? normalizeChatUserKey(DESK_ADMIN_CREDENTIALS.adminKey)
    : "admin_dbest";

  return (
    recKey === adminKey ||
    sndKey === adminKey ||
    catDesk.includes("konsultasi") ||
    /^\[d-best desk|^\[konsultasi|^\[balasan admin d-best desk/i.test(txt)
  );
}


const DESK_CONSULT_LOCAL_KEY = "dbest_desk_consult_local_v1";

function getLocalConsultationCache_() {
  try {
    const raw = localStorage.getItem(DESK_CONSULT_LOCAL_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function saveLocalConsultationCache_(entry) {
  try {
    const list = getLocalConsultationCache_();
    list.push(entry);
    localStorage.setItem(DESK_CONSULT_LOCAL_KEY, JSON.stringify(list.slice(-100)));
  } catch (err) {}
}

function mergeServerAndLocalChatMessages_(serverList) {
  const srv = Array.isArray(serverList) ? serverList : [];
  const loc = getLocalConsultationCache_();
  if (!loc.length) return srv;

  const existingKeys = new Set(
    srv.map(m => `${normalizeChatUserKey(m.pengirim_key)}|${normalizeChatUserKey(m.penerima_key)}|${String(m.pesan || "").trim()}`)
  );

  const merged = [...srv];
  loc.forEach(item => {
    const k = `${normalizeChatUserKey(item.pengirim_key)}|${normalizeChatUserKey(item.penerima_key)}|${String(item.pesan || "").trim()}`;
    if (!existingKeys.has(k)) {
      existingKeys.add(k);
      merged.push(item);
    }
  });
  return merged;
}


const CLEARED_CHAT_IDS_KEY = "dbest_desk_cleared_chat_ids_v1";

function getClearedChatMessageIdSet_() {
  try {
    const raw = localStorage.getItem(CLEARED_CHAT_IDS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch (err) {
    return new Set();
  }
}

function getChatMessageFingerprint_(msg) {
  return String(
    msg?.id ||
    `${normalizeChatUserKey(msg?.pengirim_key)}|${normalizeChatUserKey(msg?.penerima_key)}|${String(msg?.waktu || "")}|${String(msg?.pesan || "").trim()}`
  );
}

function clearVisibleChatMessages() {
  const modeLabel = activeDeskMode === "CONSULT"
    ? "riwayat konsultasi yang tampil di layar ini"
    : "riwayat chat yang tampil di layar ini";

  if (!confirm(`Bersihkan ${modeLabel}?`)) {
    return;
  }

  const clearedSet = getClearedChatMessageIdSet_();
  const allMsgs = Array.isArray(cachedChatMessages) ? cachedChatMessages : [];
  const myKey = getCurrentChatUserKey();

  const visibleToClear = allMsgs.filter(msg => {
    const recKey = normalizeChatUserKey(msg.penerima_key || "");
    const sndKey = normalizeChatUserKey(msg.pengirim_key || "");
    const isConsultMsg = typeof isConsultationMessage_ === "function"
      ? isConsultationMessage_(msg)
      : (recKey === "admin_dbest" || sndKey === "admin_dbest");

    if (activeDeskMode === "CONSULT") {
      return isConsultMsg && (deskAdminLoggedIn || sndKey === myKey || recKey === myKey);
    }
    return !isConsultMsg;
  });

  visibleToClear.forEach(msg => {
    clearedSet.add(getChatMessageFingerprint_(msg));
  });

  try {
    localStorage.setItem(CLEARED_CHAT_IDS_KEY, JSON.stringify(Array.from(clearedSet).slice(-500)));
    if (activeDeskMode === "CONSULT" && typeof DESK_CONSULT_LOCAL_KEY !== "undefined") {
      localStorage.removeItem(DESK_CONSULT_LOCAL_KEY);
    }
  } catch (err) {}

  renderFilteredChatMessages();
  if (typeof deskAdminLoggedIn !== "undefined" && deskAdminLoggedIn && typeof renderDeskAdminConsultationQueue_ === "function") {
    renderDeskAdminConsultationQueue_();
  }

  const fbEl = document.getElementById("chatFeedbackText");
  if (fbEl) {
    fbEl.textContent = "Tampilan chat berhasil dibersihkan.";
    fbEl.className = "text-xs font-semibold text-emerald-700";
    fbEl.classList.remove("hidden");
  }
}
