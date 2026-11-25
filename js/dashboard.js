let fullTrendSeriesMode = "ALL";
let focusTrendSeriesMode = "ALL";
let cachedChatMessages = [];
let pendingChatImageData = "";
let chatPollTimer = null;

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

  const width = 420;
  const height = 135;
  const padX = 28;
  const padTop = 16;
  const padBottom = 20;
  const plotHeight = height - padTop - padBottom;
  const totalPgThreshold = 311;
  const pgY = padTop + plotHeight - (totalPgThreshold / 550) * plotHeight;

  const seriesMeta = [
    { key: "total", max: 550, color: "#2563eb", show: seriesMode === "ALL" || seriesMode === "TOTAL" },
    { key: "twk", max: 150, color: "#7c3aed", show: seriesMode === "ALL" || seriesMode === "TWK" },
    { key: "tiu", max: 175, color: "#0d9488", show: seriesMode === "ALL" || seriesMode === "TIU" },
    { key: "tkp", max: 225, color: "#ea580c", show: seriesMode === "ALL" || seriesMode === "TKP" }
  ];

  const getX = (idx) => padX + (idx / (sessionsChronological.length - 1)) * (width - padX * 2);
  const getY = (val, max) => {
    const clamped = Math.max(0, Math.min(max, Number(val || 0)));
    return padTop + plotHeight - (clamped / max) * plotHeight;
  };

  const xLabelsHtml = sessionsChronological.map((_, idx) => {
    const x = getX(idx);
    return `<text x="${x.toFixed(1)}" y="${height - 4}" text-anchor="middle" font-size="8.5" fill="#64748b">#${idx + 1}</text>`;
  }).join("");

  const seriesSvgHtml = seriesMeta
    .filter(sr => sr.show)
    .map(sr => {
      const pts = sessionsChronological.map((s, idx) => {
        const rawVal = Number(s[sr.key] || 0);
        return {
          x: getX(idx),
          y: getY(rawVal, sr.max),
          val: rawVal
        };
      });

      const polylineStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      const showPointLabels = seriesMode !== "ALL" || sr.key === "total";

      const pointsHtml = pts.map(p => {
        const labelHtml = showPointLabels
          ? `<text x="${p.x.toFixed(1)}" y="${Math.max(10, p.y - 5).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${sr.color}">${p.val}</text>`
          : "";
        return `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="${sr.color}" stroke="#ffffff" stroke-width="1.2" />
          ${labelHtml}
        `;
      }).join("");

      return `
        <polyline fill="none" stroke="${sr.color}" stroke-width="${sr.key === "total" ? "2.2" : "1.7"}" points="${polylineStr}" />
        ${pointsHtml}
      `;
    }).join("");

  const pgLineHtml = showPgLine && (seriesMode === "ALL" || seriesMode === "TOTAL")
    ? `
      <line x1="${padX}" y1="${pgY.toFixed(1)}" x2="${width - padX}" y2="${pgY.toFixed(1)}" stroke="#10b981" stroke-dasharray="4" stroke-width="1" />
      <text x="${width - padX}" y="${(pgY - 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-weight="bold" fill="#059669">PG >= 311</text>
    `
    : "";

  const latest = sessionsChronological[sessionsChronological.length - 1];
  const btnCls = (m) => seriesMode === m
    ? "px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white"
    : "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200";

  containerEl.innerHTML = `
    <div class="w-full space-y-1">
      <div class="flex flex-wrap items-center justify-between gap-1">
        <div class="flex flex-wrap items-center gap-1">
          <button type="button" onclick="${onSelectFnName}('ALL')" class="${btnCls("ALL")}">Semua</button>
          <button type="button" onclick="${onSelectFnName}('TOTAL')" class="${btnCls("TOTAL")}">Total</button>
          <button type="button" onclick="${onSelectFnName}('TWK')" class="${btnCls("TWK")}">TWK</button>
          <button type="button" onclick="${onSelectFnName}('TIU')" class="${btnCls("TIU")}">TIU</button>
          <button type="button" onclick="${onSelectFnName}('TKP')" class="${btnCls("TKP")}">TKP</button>
        </div>
        <div class="text-[10px] font-semibold text-slate-600">
          Terakhir: <span class="text-blue-700 font-bold">Tot ${latest.total}</span> •
          <span class="text-violet-700 font-bold">TWK ${latest.twk}</span> •
          <span class="text-teal-700 font-bold">TIU ${latest.tiu}</span> •
          <span class="text-orange-700 font-bold">TKP ${latest.tkp}</span>
        </div>
      </div>

      <svg viewBox="0 0 ${width} ${height}" class="w-full h-32">
        <line x1="${padX}" y1="${padTop + plotHeight}" x2="${width - padX}" y2="${padTop + plotHeight}" stroke="#cbd5e1" stroke-width="1" />
        ${pgLineHtml}
        ${seriesSvgHtml}
        ${xLabelsHtml}
      </svg>

      <div class="flex flex-wrap items-center justify-center gap-2.5 text-[10px] font-semibold text-slate-600">
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Total</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 bg-violet-600 inline-block"></span> TWK</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 bg-teal-600 inline-block"></span> TIU</span>
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-0.5 bg-orange-600 inline-block"></span> TKP</span>
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
  return String(rec?.pendidikan_terakhir || rec?.pendidikan || "").trim();
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

function setDashboardTop10Mode() {
  if (typeof dashboardTop10Only !== "undefined") dashboardTop10Only = !dashboardTop10Only;
  const btn = document.getElementById("scopeTop10Btn");
  if (btn && typeof dashboardTop10Only !== "undefined") {
    btn.className = dashboardTop10Only
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white"
      : "px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200";
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

  const sortedRows = filtered
    .slice()
    .sort((a, b) => Number(b.total || 0) - Number(a.total || 0));

  renderFormationCompetitionSummary(sortedRows, eduFilter, formationFilter);

  const rowsToDisplay = top10Only ? sortedRows.slice(0, 10) : sortedRows;

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

let cachedChatMessages = [];
let pendingChatImageData = "";
let chatPollTimer = null;

function normalizeChatUserKey(raw) {
  if (typeof normalizeUsernameKey === "function") {
    return normalizeUsernameKey(raw || "");
  }
  return String(raw || "").trim().replace(/\s+/g, "").toLowerCase();
}

function getCurrentChatUserKey() {
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

function startChatPolling_() {
  stopChatPolling_();
  chatPollTimer = setInterval(() => {
    const panel = document.getElementById("chatPanel");
    const isHidden = !panel || panel.classList.contains("hidden");
    if (isHidden || (typeof isExamActive !== "undefined" && isExamActive)) {
      return;
    }
    loadChatMessages(false, true);
  }, 15000);
}

function stopChatPolling_() {
  if (chatPollTimer) {
    clearInterval(chatPollTimer);
    chatPollTimer = null;
  }
}

function openChatPanel() {
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Selesaikan ujian terlebih dahulu sebelum membuka kotak pesan.");
    return;
  }
  const panel = document.getElementById("chatPanel");
  if (!panel) return;
  panel.classList.remove("hidden");
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

function populateChatRecipientDropdowns(accounts, myKey) {
  const recSelect = document.getElementById("chatRecipientSelect");
  const filterSelect = document.getElementById("chatPartnerFilter");
  if (!recSelect || !filterSelect) return;

  const prevRec = recSelect.value;
  const prevFilter = filterSelect.value || "ALL";

  const peers = (Array.isArray(accounts) ? accounts : [])
    .filter(acc => acc && acc.key && acc.key !== myKey);

  recSelect.replaceChildren();
  const defaultRec = document.createElement("option");
  defaultRec.value = "";
  defaultRec.textContent = peers.length > 0 ? "-- Pilih Peserta Tujuan --" : "Belum ada peserta lain terdaftar";
  recSelect.appendChild(defaultRec);

  filterSelect.replaceChildren();
  const allFilterOpt = document.createElement("option");
  allFilterOpt.value = "ALL";
  allFilterOpt.textContent = "Semua Lawan Bicara";
  filterSelect.appendChild(allFilterOpt);

  peers.forEach(p => {
    const label = `${p.nama}${p.username ? ` (@${p.username})` : ""}`;

    const opt1 = document.createElement("option");
    opt1.value = p.key;
    opt1.dataset.nama = p.nama;
    opt1.textContent = label;
    recSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = p.key;
    opt2.textContent = label;
    filterSelect.appendChild(opt2);
  });

  if (prevRec && peers.some(p => p.key === prevRec)) {
    recSelect.value = prevRec;
  }
  filterSelect.value = peers.some(p => p.key === prevFilter) ? prevFilter : "ALL";
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
  const filterVal = document.getElementById("chatPartnerFilter")?.value || "ALL";
  const badgeEl = document.getElementById("unreadChatBadge");
  const myKey = getCurrentChatUserKey();
  if (!listEl) return;

  const allMsgs = Array.isArray(cachedChatMessages) ? cachedChatMessages : [];
  const unreadCount = allMsgs.filter(
    m => m.penerima_key === myKey && String(m.status || "").toUpperCase() !== "DIBACA"
  ).length;

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.textContent = `${unreadCount} Baru`;
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }
  }

  const visible = allMsgs.filter(msg => {
    if (filterVal === "ALL") return true;
    const otherKey = msg.pengirim_key === myKey ? msg.penerima_key : msg.pengirim_key;
    return otherKey === filterVal;
  });

  listEl.replaceChildren();

  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-slate-500 text-center py-3";
    empty.textContent = "Belum ada pesan pada percakapan ini. Kirim teks atau gambar kapan saja—penerima membaca & membalas saat aktif.";
    listEl.appendChild(empty);
    return;
  }

  visible.forEach(msg => {
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
      cachedChatMessages = json.chat;
      renderFilteredChatMessages();
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

  const myKey = getCurrentChatUserKey();
  const recipientKey = (recSelect?.value || "").trim();
  const recipientName = recSelect?.selectedOptions?.[0]?.dataset?.nama || recSelect?.selectedOptions?.[0]?.textContent || "";
  const rawText = (inputEl?.value || "").trim();

  if (!myKey) {
    if (fbEl) {
      fbEl.textContent = "Silakan Login terlebih dahulu sebelum mengirim pesan.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (!recipientKey) {
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

  const senderName = getCurrentChatSenderName();
  const imagePayload = pendingChatImageData;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Mengirim...";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "send_chat",
        nama_pengirim: senderName,
        pengirim_key: myKey,
        nama_penerima: recipientName,
        penerima_key: recipientKey,
        pesan: rawText || (imagePayload ? "[Mengirim gambar]" : ""),
        gambar_data: imagePayload
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
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

  const myKey = getCurrentChatUserKey();
  const recipientKey = (recSelect?.value || "").trim();
  const recipientName = recSelect?.selectedOptions?.[0]?.dataset?.nama || recSelect?.selectedOptions?.[0]?.textContent || "";
  const rawText = (inputEl?.value || "").trim();

  if (!myKey) {
    if (fbEl) {
      fbEl.textContent = "Silakan Login terlebih dahulu sebelum mengirim pesan.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (!recipientKey) {
    if (fbEl) {
      fbEl.textContent = "Pilih peserta tujuan terlebih dahulu.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (!rawText) {
    if (fbEl) {
      fbEl.textContent = "Tuliskan pesan terlebih dahulu.";
      fbEl.className = "text-xs font-semibold text-rose-600";
      fbEl.classList.remove("hidden");
    }
    return;
  }
  if (typeof findProfanityInName === "function" && findProfanityInName(rawText).length > 0) {
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

  const senderName = getCurrentChatSenderName();

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Mengirim...";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "send_chat",
        nama_pengirim: senderName,
        pengirim_key: myKey,
        nama_penerima: recipientName,
        penerima_key: recipientKey,
        pesan: rawText
      })
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      if (inputEl) inputEl.value = "";
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
