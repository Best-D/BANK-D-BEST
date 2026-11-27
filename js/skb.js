// Modul Terpisah SKB — Bank D-BEST (js/skb.js)
// Berdiri mandiri agar tidak mengganggu alur SKD pada auth.js, dashboard.js, dan exam.js.

const SKB_QUESTION_BANK = {
  PRANATA_KOMPUTER: [
    {
      id: "skb_ti_1",
      question: "Dalam pengelolaan aset teknologi informasi dan Barang Milik Negara (BMN) berbasis aplikasi terpusat, langkah utama untuk mencegah selisih pencatatan antara buku/database aset dan kondisi fisik perangkat adalah...",
      options: {
        A: "Melakukan rekonsiliasi data aset secara berkala dan verifikasi kode/label inventaris fisik",
        B: "Menghapus data aset lama setiap akhir bulan tanpa berita acara",
        C: "Menyimpan perangkat baru tanpa pencatatan kode register hingga akhir tahun anggaran",
        D: "Memindahkan unit kerja pengguna tanpa memperbarui penanggung jawab aset"
      },
      answer: "A",
      explanation: "Rekonsiliasi rutin dan pencocokan label fisik dengan catatan sistem menjaga akuntabilitas serta keandalan data aset."
    },
    {
      id: "skb_ti_2",
      question: "Praktik keamanan informasi paling tepat saat mengoperasikan layanan atau formulir digital instansi adalah...",
      options: {
        A: "Membagikan kredensial admin melalui pesan instan agar mudah diakses tim",
        B: "Menerapkan prinsip hak akses terkecil (least privilege), validasi input, dan pencadangan data berkala",
        C: "Menonaktifkan pencatatan log aktivitas agar performa server tidak turun",
        D: "Menggunakan satu akun bersama tanpa batas waktu sesi"
      },
      answer: "B",
      explanation: "Prinsip least privilege, validasi input, dan backup rutin melindungi integritas serta keberlangsungan layanan digital."
    },
    {
      id: "skb_ti_3",
      question: "Saat menyajikan laporan kinerja atau rekap data kepada pimpinan, prinsip visualisasi data yang paling efektif adalah...",
      options: {
        A: "Menumpuk semua metrik dalam satu grafik rumit tanpa label satuan",
        B: "Menyajikan ringkasan utama, label yang jelas, skala proporsional, dan konteks perbandingan yang relevan",
        C: "Menghilangkan angka aktual dan hanya menampilkan warna dekoratif",
        D: "Mengubah skala sumbu secara acak agar selisih terlihat besar"
      },
      answer: "B",
      explanation: "Visualisasi yang jelas, proporsional, dan berlabel memudahkan pimpinan membaca tren serta mengambil keputusan."
    }
  ],
  ADMINISTRASI_KEBIJAKAN: [
    {
      id: "skb_adm_1",
      question: "Dalam tata naskah dinas dan administrasi pemerintahan, hal utama yang harus dipastikan sebelum dokumen resmi diterbitkan atau diarsipkan adalah...",
      options: {
        A: "Kelengkapan format, ketepatan ejaan/redaksi, keabsahan penetapan/tanda tangan, dan keterlacakan arsip",
        B: "Menggunakan singkatan tidak baku di seluruh bagian surat resmi",
        C: "Menunda penomoran naskah hingga beberapa minggu setelah tanggal surat",
        D: "Menyimpan dokumen tanpa klasifikasi atau indeks arsip"
      },
      answer: "A",
      explanation: "Naskah dinas yang tertib memerlukan format baku, bahasa yang tepat, keabsahan, dan pengelolaan arsip yang tertelusur."
    },
    {
      id: "skb_adm_2",
      question: "Prinsip pelayanan publik yang berorientasi pada kepuasan masyarakat (SKM) tercermin melalui...",
      options: {
        A: "Prosedur yang berbelit dan informasi persyaratan yang tidak terbuka",
        B: "Kejelasan prosedur, ketepatan waktu, ketanggapan terhadap masukan, dan kemudahan akses informasi",
        C: "Mengabaikan umpan balik pengguna layanan setelah proses selesai",
        D: "Memberlakukan syarat tambahan di luar ketentuan tanpa pemberitahuan"
      },
      answer: "B",
      explanation: "Pelayanan prima menuntut kejelasan alur, ketepatan waktu, sarana yang memadai, serta tindak lanjut atas saran/pengaduan."
    },
    {
      id: "skb_adm_3",
      question: "Dalam penyusunan rencana kerja dan pelaporan kegiatan unit kerja, keterkaitan antara sasaran, indikator, dan realisasi anggaran berfungsi untuk...",
      options: {
        A: "Memastikan pelaksanaan kegiatan terukur, selaras target, dan dapat dipertanggungjawabkan",
        B: "Menggantikan kebutuhan dokumen pendukung kegiatan",
        C: "Menyamakan seluruh anggaran kegiatan tanpa memperhatikan kebutuhan riil",
        D: "Menunda evaluasi capaian hingga akhir periode tanpa pemantauan berkala"
      },
      answer: "A",
      explanation: "Keterkaitan sasaran, indikator, dan anggaran memastikan efektivitas pelaksanaan serta akuntabilitas kinerja."
    }
  ]
};

let skbSelectedAnswers = {};

function toggleSkbWorkspace() {
  const bodyEl = document.getElementById("skbWorkspaceBody");
  const btnEl = document.getElementById("toggleSkbWorkspaceBtn");
  if (!bodyEl) return;

  const isNowOpen = bodyEl.classList.contains("hidden");
  bodyEl.classList.toggle("hidden", !isNowOpen);
  if (btnEl) {
    btnEl.textContent = isNowOpen ? "Sembunyikan Modul SKB" : "Buka Latihan & Kalkulator SKB";
  }
  if (isNowOpen) {
    calculateSkbCompositeScore();
    renderSkbPracticeQuestions();
  }
}

function calculateSkbCompositeScore() {
  const skdRaw = Number(document.getElementById("skbCalcSkdInput")?.value || 0);
  const skbRaw = Number(document.getElementById("skbCalcSkbInput")?.value || 0);
  const wSkd = Number(document.getElementById("skbWeightSkdSelect")?.value || 40);
  const wSkb = Number(document.getElementById("skbWeightSkbSelect")?.value || 60);
  const outEl = document.getElementById("skbCompositeResultBox");
  if (!outEl) return;

  const clampedSkd = Math.max(0, Math.min(550, skdRaw));
  const clampedSkb = Math.max(0, Math.min(100, skbRaw));
  const skdNormalized100 = (clampedSkd / 550) * 100;

  const totalWeight = wSkd + wSkb;
  const finalScore = totalWeight > 0
    ? ((skdNormalized100 * wSkd) + (clampedSkb * wSkb)) / totalWeight
    : 0;

  outEl.innerHTML =
    `Skor SKD Ternormalisasi: <strong>${skdNormalized100.toFixed(2)}</strong> / 100 • ` +
    `Nilai SKB: <strong>${clampedSkb.toFixed(2)}</strong> / 100 • ` +
    `Estimasi Nilai Akhir (${wSkd}% SKD + ${wSkb}% SKB): <span class="text-indigo-700 font-extrabold text-sm">${finalScore.toFixed(2)}</span>`;
}

function renderSkbPracticeQuestions() {
  const track = document.getElementById("skbTrackSelect")?.value || "PRANATA_KOMPUTER";
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
      };
      optsWrap.appendChild(btn);
    });

    card.appendChild(optsWrap);
    container.appendChild(card);
  });
}

function submitSkbPractice() {
  const track = document.getElementById("skbTrackSelect")?.value || "PRANATA_KOMPUTER";
  const list = SKB_QUESTION_BANK[track] || SKB_QUESTION_BANK.PRANATA_KOMPUTER;
  const scoreEl = document.getElementById("skbPracticeScoreText");
  if (!scoreEl) return;

  let correctCount = 0;
  list.forEach(q => {
    if (skbSelectedAnswers[q.id] === q.answer) {
      correctCount += 1;
    }
  });

  const score100 = list.length > 0 ? Math.round((correctCount / list.length) * 100) : 0;
  scoreEl.textContent = `Skor Latihan SKB: ${score100} (${correctCount}/${list.length} benar)`;

  const skbCalcInput = document.getElementById("skbCalcSkbInput");
  if (skbCalcInput) {
    skbCalcInput.value = String(score100);
    calculateSkbCompositeScore();
  }
}
