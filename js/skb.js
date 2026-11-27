const SKB_SHEET_NAME = "BankSoalSKB";
const SKB_SPREADSHEET_ID = "1rQlxl3rJ56xv_Z3282ic8KoNYFMN-PAtkRT-FKAvE4s";
const SKB_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMbR9Hn8OthYXCeJceRIh2pTFpvjQT_QJB7r12cbDrNZWpCRHT0OJ_Ikxq7eIVch1GJw/exec";
const SKB_AUTO_REFRESH_MS = 30000;

const SKB_TRACK_LABELS = {
  PRANATA_KOMPUTER: "Pranata Komputer / TI & Data",
  PENATA_LAYANAN_TI: "Penata Layanan Operasional / Layanan TI",
  ADMINISTRASI_KEBIJAKAN: "Administrasi Pemerintahan & Kebijakan Publik"
};

const SKB_QUESTION_BANK = {
  PRANATA_KOMPUTER: [
    {
      id: "pk_1",
      question: "Dalam siklus pengembangan sistem informasi berbasis SDLC, tahap mana yang berfokus pada perancangan arsitektur sistem, struktur basis data, dan antarmuka sebelum penulisan kode program dilakukan?",
      options: {
        A: "Analisis kebutuhan dan perancangan sistem (system design)",
        B: "Pemeliharaan rutin setelah sistem dirilis penuh",
        C: "Penghapusan log server produksi",
        D: "Pengadaan perangkat keras kantor"
      },
      answer: "A",
      explanation: "Tahap perancangan (design) menerjemahkan kebutuhan pengguna menjadi arsitektur sistem, skema data, dan desain teknis sebelum implementasi."
    },
    {
      id: "pk_2",
      question: "Untuk menjaga integritas basis data relasional saat terjadi kegagalan proses transaksi di tengah jalan, sifat transaksi ACID yang memastikan seluruh perubahan dibatalkan (roll back) atau diterapkan utuh adalah...",
      options: {
        A: "Atomicity",
        B: "Scalability",
        C: "Portability",
        D: "Redundancy"
      },
      answer: "A",
      explanation: "Atomicity menjamin transaksi bersifat all-or-nothing: jika gagal di tengah proses, seluruh perubahan dikembalikan ke kondisi semula."
    },
    {
      id: "pk_3",
      question: "Dalam manajemen keamanan jaringan komputer, fungsi utama VLAN (Virtual Local Area Network) pada switch terkelola adalah...",
      options: {
        A: "Memisahkan segmen broadcast dan lalu lintas jaringan secara logis antarunit atau fungsi",
        B: "Mengganti kebutuhan kabel serat optik secara keseluruhan",
        C: "Menghapus alamat MAC pada seluruh perangkat jaringan",
        D: "Menonaktifkan firewall pada gerbang jaringan"
      },
      answer: "A",
      explanation: "VLAN membagi jaringan fisik menjadi beberapa domain broadcast terpisah secara logis sehingga keamanan dan pengelolaan lalu lintas lebih rapi."
    },
    {
      id: "pk_4",
      question: "Ketika mengaudit kualitas data sebelum proses ETL atau analitik, kondisi data yang memiliki nilai kosong tak terduga, format tanggal tidak seragam, atau duplikasi entitas disebut...",
      options: {
        A: "Data anomaly / data hygiene issue",
        B: "Hardware bottleneck",
        C: "Firmware overclocking",
        D: "Physical cabling fault"
      },
      answer: "A",
      explanation: "Ketidakkonsistenan format, nilai hilang, dan duplikasi pada dataset merupakan isu kebersihan/kualitas data yang harus dibersihkan sebelum analisis."
    },
    {
      id: "pk_5",
      question: "Dalam manajemen insiden TI berdasarkan kerangka tata kelola layanan (ITSM), langkah yang tepat setelah insiden gangguan aplikasi dipulihkan sementara agar masalah tidak berulang adalah...",
      options: {
        A: "Melakukan analisis akar masalah (root cause analysis) dan mengusulkan perbaikan permanen (problem management)",
        B: "Menutup tiket tanpa mencatat penyebab gangguan",
        C: "Menghapus riwayat error log agar kapasitas disk bertambah",
        D: "Menghindari dokumentasi perubahan konfigurasi"
      },
      answer: "A",
      explanation: "Pemulihan cepat menangani insiden, sedangkan analisis akar masalah dan solusi permanen berada pada pengelolaan masalah (problem management)."
    }
  ],
  PENATA_LAYANAN_TI: [
    {
      id: "plt_1",
      question: "Saat pengguna melaporkan kendala login atau akses layanan aplikasi harian di unit kerja, tindakan pelayanan operasional pertama yang paling tepat adalah...",
      options: {
        A: "Mencatat keluhan, memverifikasi gejala dasar akun/jaringan, dan memberikan panduan atau eskalasi sesuai SOP layanan",
        B: "Meminta pengguna menunggu tanpa informasi status penanganan",
        C: "Mengubah data pengguna lain secara acak untuk menguji sistem",
        D: "Menutup laporan sebelum kendala dipastikan teratasi"
      },
      answer: "A",
      explanation: "Pelayanan operasional mengutamakan pencatatan tertib, pengecekan awal, komunikasi yang jelas, dan eskalasi sesuai prosedur layanan."
    },
    {
      id: "plt_2",
      question: "Dalam pengelolaan layanan dukungan pengguna (helpdesk/service desk), fungsi Service Level Agreement (SLA) adalah...",
      options: {
        A: "Menetapkan target waktu respons dan penyelesaian layanan yang terukur antara penyedia layanan dan pengguna",
        B: "Menghapus kewajiban dokumentasi tiket layanan",
        C: "Menentukan merek komputer yang wajib dibeli pegawai",
        D: "Menggantikan seluruh prosedur keamanan informasi"
      },
      answer: "A",
      explanation: "SLA mengatur standar kinerja layanan seperti waktu respons awal dan target penyelesaian agar mutu pelayanan terukur."
    },
    {
      id: "plt_3",
      question: "Ketika perangkat komputer atau printer operasional di ruang pelayanan mengalami gangguan ringan saat jam kerja padat, langkah operasional yang paling efektif adalah...",
      options: {
        A: "Melakukan pemeriksaan dasar (koneksi, daya, antrean cetak) dan mengalihkan ke perangkat cadangan bila tersedia agar layanan tidak terhenti",
        B: "Menghentikan seluruh layanan loket sampai teknisi datang minggu depan",
        C: "Membongkar komponen internal tanpa prosedur keselamatan",
        D: "Membiarkan antrean menumpuk tanpa pemberitahuan"
      },
      answer: "A",
      explanation: "Pemeriksaan dasar dan pemanfaatan perangkat cadangan menjaga kesinambungan layanan operasional bagi pengguna."
    },
    {
      id: "plt_4",
      question: "Dalam administrasi akun dan layanan data pegawai/pengguna, prinsip yang wajib dijaga saat memproses permohonan reset akses atau pembaruan data adalah...",
      options: {
        A: "Verifikasi identitas pemohon sesuai prosedur dan menjaga kerahasiaan data pribadi",
        B: "Memberikan akses penuh ke seluruh folder unit lain tanpa verifikasi",
        C: "Mencatat kredensial pengguna di papan tulis bersama",
        D: "Memproses permintaan lisan tanpa jejak pencatatan"
      },
      answer: "A",
      explanation: "Verifikasi identitas dan perlindungan data pribadi mencegah penyalahgunaan akses pada layanan operasional."
    },
    {
      id: "plt_5",
      question: "Manfaat utama menyusun rekap harian tiket layanan dan kendala berulang pada unit layanan operasional adalah...",
      options: {
        A: "Mengetahui pola kendala yang paling sering muncul sebagai dasar perbaikan layanan dan bahan koordinasi",
        B: "Menambah jumlah formulir yang harus diisi pemohon",
        C: "Mengurangi transparansi waktu pelayanan",
        D: "Menghindari evaluasi kinerja tim layanan"
      },
      answer: "A",
      explanation: "Rekap layanan membantu mengidentifikasi kendala berulang sehingga perbaikan SOP dan layanan dapat dilakukan tepat sasaran."
    }
  ],
  ADMINISTRASI_KEBIJAKAN: [
    {
      id: "adm_1",
      question: "Tahap awal yang paling krusial dalam perumusan kebijakan publik berbasis bukti (evidence-based policy) adalah...",
      options: {
        A: "Identifikasi masalah secara akurat beserta data empiris dan pemetaan pemangku kepentingan",
        B: "Menetapkan kesimpulan sebelum data lapangan dikumpulkan",
        C: "Menyalin aturan lama tanpa mengevaluasi dampaknya",
        D: "Mengabaikan masukan pelaksana di lapangan"
      },
      answer: "A",
      explanation: "Kebijakan yang tepat bermula dari perumusan masalah yang jelas, didukung data faktual, serta pemahaman konteks pihak terdampak."
    },
    {
      id: "adm_2",
      question: "Dalam evaluasi program atau kebijakan instansi, indikator output berbeda dari indikator outcome karena indikator outcome menilai...",
      options: {
        A: "Perubahan kondisi, manfaat, atau dampak yang dirasakan sasaran setelah output dihasilkan",
        B: "Jumlah lembar kertas yang dicetak panitia",
        C: "Jumlah rapat persiapan yang dilaksanakan",
        D: "Kecepatan pengetikan naskah dinas"
      },
      answer: "A",
      explanation: "Output menggambarkan hasil langsung kegiatan (misalnya dokumen/pelatihan), sedangkan outcome menilai manfaat atau perubahan dampak bagi sasaran."
    },
    {
      id: "adm_3",
      question: "Dalam koordinasi lintas unit organisasi pemerintahan, hambatan egosektoral dapat ditekan melalui...",
      options: {
        A: "Penyelarasan tujuan bersama, pembagian peran yang jelas, dan komunikasi berkala berbasis target kinerja",
        B: "Menutup informasi antarbagian agar masing-masing berjalan sendiri",
        C: "Menunggu konflik muncul sebelum menyusun jadwal koordinasi",
        D: "Menyerahkan seluruh tanggung jawab lintas unit pada satu orang saja"
      },
      answer: "A",
      explanation: "Penyelarasan tujuan bersama, pembagian peran yang jelas, dan komunikasi berkala memperkuat sinergi antarunit dalam tata kelola pemerintahan."
    },
    {
      id: "adm_4",
      question: "Prinsip transparansi dan akuntabilitas dalam administrasi pemerintahan menuntut agar...",
      options: {
        A: "Setiap proses dan keputusan dapat dipertanggungjawabkan sesuai aturan serta informasi yang terbuka dapat diakses secara wajar",
        B: "Dokumen pertanggungjawaban dibuat setelah pemeriksaan berlangsung tanpa bukti dukung",
        C: "Prosedur pelayanan diubah sewaktu-waktu tanpa pemberitahuan",
        D: "Catatan realisasi disimpan terpisah tanpa keterlacakan"
      },
      answer: "A",
      explanation: "Akuntabilitas dan transparansi memastikan setiap tindakan administratif dapat diuji kebenarannya dan memenuhi kaidah tata kelola yang baik."
    },
    {
      id: "adm_5",
      question: "Ketika suatu kebijakan mengalami kendala implementasi di lapangan, langkah tindak lanjut yang paling konstruktif adalah...",
      options: {
        A: "Mengevaluasi titik hambatan (regulasi, sumber daya, atau mekanisme) dan menyusun rekomendasi penyesuaian yang terukur",
        B: "Menghentikan pelaporan kendala agar tampak tidak ada masalah",
        C: "Menyalahkan pelaksana lapangan tanpa meninjau desain aturan",
        D: "Mengulang kebijakan yang sama persis tanpa perbaikan"
      },
      answer: "A",
      explanation: "Evaluasi hambatan implementasi menjadi dasar penyempurnaan kebijakan atau petunjuk teknis agar lebih aplikatif."
    }
  ]
};

let skbSelectedAnswers = {};
let skbAutoRefreshTimer = null;
let skbSheetConnected = false;

function getTotalSkbQuestionsCount_() {
  return Object.values(SKB_QUESTION_BANK).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );
}

function getActiveTrackQuestionsCount_() {
  const track = document.getElementById("skbTrackSelect")?.value || "PRANATA_KOMPUTER";
  const list = SKB_QUESTION_BANK[track] || [];
  return { track, count: list.length };
}

function updateSkbConnectionIndicator_() {
  ensureSkbUiMount_();
  const badgeEl = document.getElementById("skbSheetConnectionBadge");
  const countEl = document.getElementById("skbQuestionCountIndicator");
  const { count: activeCount } = getActiveTrackQuestionsCount_();
  const totalCount = getTotalSkbQuestionsCount_();

  if (badgeEl) {
    badgeEl.textContent = skbSheetConnected
      ? `Terhubung Spreadsheet (${SKB_SHEET_NAME})`
      : "Mode Cadangan Lokal";
    badgeEl.className = skbSheetConnected
      ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200"
      : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200";
  }

  if (countEl) {
    countEl.textContent = `Soal Bidang Ini: ${activeCount} • Total Bank SKB: ${totalCount} Soal`;
  }
}

function ensureSkbUiMount_() {
  const host = document.getElementById("skbWorkspaceBody") || document.getElementById("skbDashboardScreen");
  if (!host) return null;

  let mount = document.getElementById("skbDynamicEnhancementBox");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "skbDynamicEnhancementBox";
    mount.className = "mt-4 border border-slate-200 bg-slate-50/80 rounded-xl p-4 space-y-3 text-xs";
    mount.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span id="skbSheetConnectionBadge" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Memeriksa Koneksi...
            </span>
            <span id="skbQuestionCountIndicator" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-900">
              0 Soal
            </span>
          </div>
          <p id="skbSyncStatusText" class="text-[11px] text-slate-500">Menghubungkan ke tab BankSoalSKB...</p>
        </div>
        <button type="button" id="skbReloadSheetBtn" onclick="syncSkbTracksAndQuestions(true)"
          class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition">
          Muat Ulang dari Spreadsheet
        </button>
      </div>
      <div id="skbExplanationPanel" class="space-y-2"></div>
    `;
    host.appendChild(mount);
  }
  return mount;
}

function syncSkbTrackDropdownOptions_() {
  const trackSel = document.getElementById("skbTrackSelect");
  if (!trackSel) return;

  const currentVal = trackSel.value || "PRANATA_KOMPUTER";
  const allKeys = Array.from(new Set([
    ...Object.keys(SKB_TRACK_LABELS),
    ...Object.keys(SKB_QUESTION_BANK)
  ]));

  trackSel.replaceChildren();
  allKeys.forEach(key => {
    const qLen = Array.isArray(SKB_QUESTION_BANK[key]) ? SKB_QUESTION_BANK[key].length : 0;
    const labelBase = SKB_TRACK_LABELS[key] || key.replace(/_/g, " ");
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${labelBase} (${qLen} soal)`;
    trackSel.appendChild(opt);
  });

  trackSel.value = allKeys.includes(currentVal) ? currentVal : (allKeys[0] || "PRANATA_KOMPUTER");
}

function renderSkbExplanationsForActiveTrack_() {
  ensureSkbUiMount_();
  const expBox = document.getElementById("skbExplanationPanel");
  if (!expBox) return;

  const track = document.getElementById("skbTrackSelect")?.value || "PRANATA_KOMPUTER";
  const list = SKB_QUESTION_BANK[track] || [];
  expBox.replaceChildren();

  list.forEach((q, idx) => {
    if (!skbSelectedAnswers[q.id]) return;
    const item = document.createElement("div");
    const isCorrect = skbSelectedAnswers[q.id] === q.answer;
    item.className = isCorrect
      ? "bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-slate-800"
      : "bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-slate-800";
    item.innerHTML = `
      <div class="font-extrabold">${idx + 1}. Jawaban Anda: ${skbSelectedAnswers[q.id]} • Kunci: ${q.answer}</div>
      <div class="text-slate-700 mt-0.5">${q.explanation || ""}</div>
    `;
    expBox.appendChild(item);
  });
}

function normalizeSkbCellKey_(rawKey) {
  return String(rawKey || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function applySkbRowsToBank_(rowsArray) {
  if (!Array.isArray(rowsArray) || rowsArray.length === 0) return false;
  const grouped = {};

  rowsArray.forEach(rawItem => {
    if (!rawItem || typeof rawItem !== "object") return;
    const item = {};
    Object.entries(rawItem).forEach(([k, v]) => {
      item[normalizeSkbCellKey_(k)] = v;
    });

    const qText = String(item.question || item.pertanyaan || item.soal || "").trim();
    if (!qText || /^question$/i.test(qText)) return;

    const trackKey = String(item.bidang || item.kode_bidang || "PRANATA_KOMPUTER").trim().toUpperCase();
    const jabatanLabel = String(item.jabatan || item.nama_jabatan || "").trim();
    if (jabatanLabel && !SKB_TRACK_LABELS[trackKey]) {
      SKB_TRACK_LABELS[trackKey] = jabatanLabel;
    }

    if (!grouped[trackKey]) grouped[trackKey] = [];
    grouped[trackKey].push({
      id: String(item.id || `${trackKey.toLowerCase()}_${grouped[trackKey].length + 1}`).trim(),
      question: qText,
      options: {
        A: String(item.opsi_a || item.option_a || item.a || "").trim(),
        B: String(item.opsi_b || item.option_b || item.b || "").trim(),
        C: String(item.opsi_c || item.option_c || item.c || "").trim(),
        D: String(item.opsi_d || item.option_d || item.d || "").trim()
      },
      answer: String(item.jawaban || item.kunci || item.answer || "A").trim().toUpperCase(),
      explanation: String(item.pembahasan || item.explanation || "").trim()
    });
  });

  let applied = false;
  Object.entries(grouped).forEach(([key, items]) => {
    if (items.length > 0) {
      SKB_QUESTION_BANK[key] = items;
      applied = true;
    }
  });
  return applied;
}

async function fetchSkbFromGvizSheet_(spreadsheetId, sheetName) {
  if (!spreadsheetId || !sheetName) return null;
  try {
    const cacheBust = Date.now();
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&_=${cacheBust}`;
    const res = await fetch(gvizUrl, { cache: "no-store" });
    const raw = await res.text();
    const match = raw.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!match || !match[1]) return null;
    const parsed = JSON.parse(match[1]);
    const cols = (parsed?.table?.cols || []).map(c => normalizeSkbCellKey_(c?.label || c?.id || ""));
    const rows = parsed?.table?.rows || [];
    if (!cols.length || !rows.length) return null;

    return rows.map(r => {
      const cells = r?.c || [];
      const obj = {};
      cols.forEach((colName, idx) => {
        if (colName) {
          obj[colName] = cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined ? cells[idx].v : "";
        }
      });
      return obj;
    });
  } catch (err) {
    return null;
  }
}

async function loadSkbFromSheetIfAvailable(endpointUrl, sheetName = SKB_SHEET_NAME) {
  const targetSheet = String(sheetName || SKB_SHEET_NAME).trim();
  const cleanUrl = String(endpointUrl || "").trim();

  if (cleanUrl && !cleanUrl.includes("TEMPEL_URL")) {
    try {
      const sep = cleanUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${cleanUrl}${sep}mode=skb&sheet=${encodeURIComponent(targetSheet)}&_=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      const rowsFromGs = Array.isArray(json?.soal_skb)
        ? json.soal_skb
        : (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.rows) ? json.rows : []));

      if (json && json.status === "sukses" && rowsFromGs.length > 0) {
        if (applySkbRowsToBank_(rowsFromGs)) {
          skbSheetConnected = true;
          syncSkbTrackDropdownOptions_();
          renderSkbPracticeQuestions();
          updateSkbConnectionIndicator_();
          return true;
        }
      }
    } catch (err) {}
  }

  const gvizRows = await fetchSkbFromGvizSheet_(SKB_SPREADSHEET_ID, targetSheet);
  if (gvizRows && applySkbRowsToBank_(gvizRows)) {
    skbSheetConnected = true;
    syncSkbTrackDropdownOptions_();
    renderSkbPracticeQuestions();
    updateSkbConnectionIndicator_();
    return true;
  }

  skbSheetConnected = false;
  updateSkbConnectionIndicator_();
  return false;
}

function startSkbAutoRefresh_() {
  if (skbAutoRefreshTimer) {
    clearInterval(skbAutoRefreshTimer);
  }
  skbAutoRefreshTimer = setInterval(() => {
    const skbSec = document.getElementById("skbDashboardScreen");
    if (skbSec && !skbSec.classList.contains("hidden")) {
      syncSkbTracksAndQuestions(true);
    }
  }, SKB_AUTO_REFRESH_MS);
}

async function syncSkbTracksAndQuestions(forceReload = false) {
  ensureSkbUiMount_();
  syncSkbTrackDropdownOptions_();
  updateSkbConnectionIndicator_();

  const statusEl = document.getElementById("skbSyncStatusText");
  const directGs = typeof SKB_APPS_SCRIPT_URL !== "undefined" ? String(SKB_APPS_SCRIPT_URL || "").trim() : "";
  const cfgGs = typeof GOOGLE_SCRIPT_URL !== "undefined" ? String(GOOGLE_SCRIPT_URL || "").trim() : "";
  const endpoint = directGs || cfgGs;

  if (!window.__skbSheetLoaded || forceReload) {
    window.__skbSheetLoaded = true;
    if (statusEl) statusEl.textContent = `Menarik soal terbaru dari spreadsheet (${SKB_SHEET_NAME})...`;
    const loaded = await loadSkbFromSheetIfAvailable(endpoint, SKB_SHEET_NAME);
    syncSkbTrackDropdownOptions_();
    updateSkbConnectionIndicator_();
    const totalSoal = getTotalSkbQuestionsCount_();
    if (statusEl) {
      const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      statusEl.textContent = loaded
        ? `Terhubung ke ${SKB_SHEET_NAME} • ${totalSoal} soal termuat • Diperbarui ${jam}`
        : `Cadangan lokal aktif • ${totalSoal} soal siap dipakai (cek koneksi/sheet ${SKB_SHEET_NAME}).`;
    }
  } else {
    updateSkbConnectionIndicator_();
    if (statusEl) {
      statusEl.textContent = `Sumber aktif: ${SKB_SHEET_NAME} • ${getTotalSkbQuestionsCount_()} soal tersedia.`;
    }
  }

  renderSkbPracticeQuestions();
  renderSkbExplanationsForActiveTrack_();
}

function openSkbFromHeader() {
  if (typeof isExamActive !== "undefined" && isExamActive) {
    alert("Selesaikan atau keluar dari sesi ujian aktif terlebih dahulu sebelum membuka Dashboard SKB.");
    return;
  }

  ["setupScreen", "examScreen", "resultScreen", "dashboardScreen", "profileScreen", "reviewSection"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  const skbSec = document.getElementById("skbDashboardScreen");
  if (skbSec) {
    skbSec.classList.remove("hidden");
    skbSec.scrollIntoView({ behavior: "smooth" });
  }

  calculateSkbCompositeScore();
  syncSkbTracksAndQuestions(true);
  startSkbAutoRefresh_();
}

function calculateSkbCompositeScore() {
  const skdRaw = Number(document.getElementById("skbCalcSkdInput")?.value || 0);
  const skbRaw = Number(document.getElementById("skbCalcSkbInput")?.value || 0);
  const wSkd = Number(document.getElementById("skbWeightSkdSelect")?.value || 40);
  const wSkb = Number(document.getElementById("skbWeightSkbSelect")?.value || 60);
  const outEl = document.getElementById("skbCompositeResultBox");
  const highlightEl = document.getElementById("skbFinalScoreHighlight");

  const clampedSkd = Math.max(0, Math.min(550, skdRaw));
  const clampedSkb = Math.max(0, Math.min(100, skbRaw));
  const skdNormalized100 = (clampedSkd / 550) * 100;

  const totalWeight = wSkd + wSkb;
  const finalScore = totalWeight > 0
    ? ((skdNormalized100 * wSkd) + (clampedSkb * wSkb)) / totalWeight
    : 0;

  if (highlightEl) {
    highlightEl.textContent = finalScore.toFixed(2);
  }

  if (outEl) {
    outEl.innerHTML =
      `Skor SKD Ternormalisasi: <strong>${skdNormalized100.toFixed(2)}</strong> / 100 • ` +
      `Nilai SKB: <strong>${clampedSkb.toFixed(2)}</strong> / 100 • ` +
      `Estimasi Nilai Akhir (${wSkd}% SKD + ${wSkb}% SKB): <span class="text-indigo-700 font-extrabold text-sm">${finalScore.toFixed(2)}</span>`;
  }
}

function renderSkbPracticeQuestions() {
  ensureSkbUiMount_();
  syncSkbTrackDropdownOptions_();
  updateSkbConnectionIndicator_();

  const trackSel = document.getElementById("skbTrackSelect");
  const track = trackSel?.value || "PRANATA_KOMPUTER";
  const trackLabelEl = document.getElementById("skbActiveTrackLabel");
  if (trackLabelEl) {
    const rawLabel = SKB_TRACK_LABELS[track] || (trackSel?.selectedOptions?.[0]?.textContent || track);
    trackLabelEl.textContent = rawLabel.replace(/\s*\(\d+\s*soal\)$/i, "");
  }

  const container = document.getElementById("skbQuestionsContainer");
  if (!container) return;

  const list = SKB_QUESTION_BANK[track] || SKB_QUESTION_BANK.PRANATA_KOMPUTER;
  container.replaceChildren();

  list.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50/60";

    const title = document.createElement("div");
    title.className = "font-bold text-slate-800 leading-relaxed";
    title.textContent = `${idx + 1}. ${q.question}`;
    card.appendChild(title);

    const optsWrap = document.createElement("div");
    optsWrap.className = "space-y-1.5";

    Object.entries(q.options).forEach(([key, text]) => {
      const picked = skbSelectedAnswers[q.id] === key;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = picked
        ? "w-full text-left px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold transition"
        : "w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 text-xs transition";
      btn.textContent = `${key}. ${text}`;
      btn.onclick = () => {
        skbSelectedAnswers[q.id] = key;
        renderSkbPracticeQuestions();
        renderSkbExplanationsForActiveTrack_();
      };
      optsWrap.appendChild(btn);
    });

    card.appendChild(optsWrap);
    container.appendChild(card);
  });

  renderSkbExplanationsForActiveTrack_();
}

function submitSkbPractice() {
  const track = document.getElementById("skbTrackSelect")?.value || "PRANATA_KOMPUTER";
  const list = SKB_QUESTION_BANK[track] || SKB_QUESTION_BANK.PRANATA_KOMPUTER;
  const scoreEl = document.getElementById("skbPracticeScoreText");
  const latestBadge = document.getElementById("skbLatestScoreBadge");
  if (!scoreEl) return;

  let correctCount = 0;
  list.forEach(q => {
    if (skbSelectedAnswers[q.id] === q.answer) {
      correctCount += 1;
    }
  });

  const score100 = list.length > 0 ? Math.round((correctCount / list.length) * 100) : 0;
  scoreEl.textContent = `Skor Latihan SKB: ${score100} (${correctCount}/${list.length} benar)`;
  if (latestBadge) {
    latestBadge.textContent = `${score100} (${correctCount}/${list.length})`;
  }

  const skbCalcInput = document.getElementById("skbCalcSkbInput");
  if (skbCalcInput) {
    skbCalcInput.value = String(score100);
    calculateSkbCompositeScore();
  }

  renderSkbExplanationsForActiveTrack_();
}
