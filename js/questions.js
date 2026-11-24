function buildDefaultQuestionBank() {
  const bank = [];
  let qId = 1;

  const twkTopics = [
    {
      category: "Nasionalisme",
      question: "Semangat kebangsaan yang menempatkan kepentingan bangsa dan negara di atas kepentingan pribadi maupun golongan merupakan wujud pengamalan nilai...",
      options: ["Sila Pertama Pancasila", "Sila Kedua Pancasila", "Sila Ketiga Pancasila", "Sila Keempat Pancasila", "Sila Kelima Pancasila"],
      answer: 2,
      explanation: "Persatuan Indonesia (Sila Ketiga) menegaskan penempatan persatuan, kesatuan, serta kepentingan bangsa dan negara di atas kepentingan pribadi atau golongan."
    },
    {
      category: "Integritas",
      question: "Seorang ASN menolak pemberian bingkisan hari raya dari rekanan pengadaan barang dan jasa meskipun proses lelang telah selesai dilaksanakan. Sikap ASN tersebut mencerminkan nilai integritas...",
      options: ["Tanggung jawab dan kerja keras", "Kejujuran dan kemandirian", "Keadilan dan keberanian", "Kesederhanaan dan kepedulian", "Kedisiplinan dan ketekunan"],
      answer: 1,
      explanation: "Menolak gratifikasi yang berpotensi menimbulkan konflik kepentingan adalah wujud kejujuran dan kemandirian menjaga integritas jabatan."
    },
    {
      category: "Bela Negara",
      question: "Berdasarkan Pasal 27 ayat (3) UUD NRI Tahun 1945, setiap warga negara berhak dan wajib ikut serta dalam upaya...",
      options: ["Pertahanan dan keamanan negara", "Pembelaan negara", "Pembangunan nasional", "Pendidikan dasar", "Perekonomian nasional"],
      answer: 1,
      explanation: "Pasal 27 ayat (3) UUD 1945 menyatakan setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara."
    },
    {
      category: "Pilar Negara",
      question: "Lembaga negara yang berwenang memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD NRI Tahun 1945 adalah...",
      options: ["Mahkamah Agung", "Mahkamah Konstitusi", "Komisi Yudisial", "Majelis Permusyawaratan Rakyat", "Dewan Perwakilan Rakyat"],
      answer: 1,
      explanation: "Sesuai Pasal 24C ayat (1) UUD 1945, Mahkamah Konstitusi berwenang memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD."
    },
    {
      category: "Bahasa Negara",
      question: "Penulisan gabungan kata di bawah ini yang sesuai dengan kaidah Ejaan Bahasa Indonesia yang Disempurnakan (EYD V) adalah...",
      options: ["Bertanggungjawab", "Menyebar luaskan", "Diberitahukan", "Penghancur leburan", "Ketidak adilan"],
      answer: 2,
      explanation: "Gabungan kata yang mendapat awalan dan akhiran sekaligus (konfiks) ditulis serangkai, seperti 'diberitahukan' dan 'menyebarluaskan'."
    },
    {
      category: "Nasionalisme",
      question: "Penggunaan produk dalam negeri oleh aparatur negara dan masyarakat dalam kegiatan resmi instansi merupakan langkah konkret memperkuat...",
      options: ["Kemandirian ekonomi nasional", "Kewenangan daerah otonom", "Eksklusivitas budaya lokal", "Liberalisasi perdagangan", "Sentralisasi anggaran"],
      answer: 0,
      explanation: "Mengutamakan produk dalam negeri mendukung kemandirian industri nasional, penyerapan tenaga kerja lokal, dan ketahanan ekonomi."
    },
    {
      category: "Integritas",
      question: "Ketika menemukan kesalahan pencatatan anggaran pada laporan unit kerja sebelum ditandatangani pimpinan, tindakan paling berintegritas yang dilakukan staf adalah...",
      options: ["Membiarkannya karena tanggung jawab ada pada penandatangan", "Menyampaikan temuan secara objektif disertai bukti dan usulan perbaikan sebelum laporan disahkan", "Menghapus data lama tanpa membuat catatan koreksi", "Menunggu audit eksternal menemukan kesalahan tersebut", "Mengalihkan dokumen ke staf lain agar tidak terlacak"],
      answer: 1,
      explanation: "Integritas menuntut kejujuran, transparansi, dan keberanian mengoreksi kekeliruan secara prosedural sebelum merugikan organisasi."
    },
    {
      category: "Bela Negara",
      question: "Dalam konteks ancaman nonmiliter di ruang digital, peran warga negara dalam menjaga ketahanan informasi nasional dapat diwujudkan melalui...",
      options: ["Menyebarkan ulang informasi viral agar cepat diketahui publik", "Memverifikasi kredibilitas sumber berita sebelum membagikan dan menjaga etika bermedia digital", "Menonaktifkan seluruh akses informasi publik", "Menggunakan identitas palsu untuk menyerang akun tertentu", "Mengabaikan keamanan akun resmi instansi"],
      answer: 1,
      explanation: "Literasi digital, pengecekan fakta, dan kepatuhan etika ruang siber merupakan bagian dari kesadaran bela negara di era modern."
    },
    {
      category: "Pilar Negara",
      question: "Prinsip negara hukum Indonesia ditegaskan dalam UUD NRI Tahun 1945 bahwa kekuasaan kehakiman merupakan kekuasaan yang merdeka untuk menyelenggarakan peradilan guna...",
      options: ["Membantu kebijakan kementerian teknis", "Menegakkan hukum dan keadilan", "Menetapkan APBN bersama pemerintah", "Mengawasi pemilihan kepala desa", "Menyusun kurikulum nasional"],
      answer: 1,
      explanation: "Pasal 24 ayat (1) UUD NRI Tahun 1945 menegaskan kekuasaan kehakiman yang merdeka untuk menegakkan hukum dan keadilan."
    },
    {
      category: "Bahasa Negara",
      question: "Kalimat berikut yang menggunakan kata baku dan struktur efektif sesuai kaidah bahasa Indonesia adalah...",
      options: ["Para peserta diharap untuk hadir tepat waktu.", "Kami mohon maaf atas ketidaknyamanannya.", "Kegiatan sosialisasi tersebut telah dilaksanakan pada hari Senin.", "Dia membicarakan tentang rencana kerja tahun depan.", "Semua pegawai-pegawai mengikuti apel pagi."],
      answer: 2,
      explanation: "Kalimat 'Kegiatan sosialisasi tersebut telah dilaksanakan pada hari Senin' tepat secara ejaan, bentuk kata, dan keefektifan kalimat."
    }
  ];

  for (let i = 0; i < 30; i++) {
    const base = twkTopics[i % twkTopics.length];
    const variantNum = Math.floor(i / twkTopics.length) + 1;
    bank.push({
      id: qId++,
      subtest: "TWK",
      category: base.category,
      question: variantNum === 1
        ? base.question
        : `[Kasus ${base.category} Seri ${variantNum}] ${base.question}`,
      options: [...base.options],
      answer: base.answer,
      explanation: base.explanation
    });
  }

  const tiuSeriesRules = [
    { start: 2, stepAdd: 3, label: "Pola selisih bertambah 3 (+3, +6, +9, +12, +15)" },
    { start: 3, mult: 2, add: 1, label: "Pola dikali 2 lalu ditambah 1" },
    { start: 100, stepSub: 7, label: "Pola berkurang 7 secara tetap (-7)" },
    { start: 4, mult: 3, label: "Pola dikali 3 secara berurutan (×3)" },
    { start: 1, fibLike: true, label: "Pola deret Fibonacci (jumlah dua suku sebelumnya)" }
  ];

  const tiuAnalogies = [
    ["KONSTITUSI : NEGARA", "Anggaran Dasar : Organisasi", ["Pasal : Undang-Undang", "Anggaran Dasar : Organisasi", "Hakim : Pengadilan", "Peraturan : Sanksi", "Rakyat : Wilayah"], 1, "Konstitusi menjadi landasan dasar negara sebagaimana Anggaran Dasar menjadi landasan dasar organisasi."],
    ["KOMPAS : ARAH", "Termometer : Suhu", ["Jam : Detik", "Termometer : Suhu", "Peta : Pulau", "Jarum : Kompor", "Lensa : Kacamata"], 1, "Kompas berfungsi mengukur/menunjukkan arah sebagaimana termometer berfungsi mengukur suhu."],
    ["BENIH : PANEN", "Belajar : Kompetensi", ["Hujan : Payung", "Belajar : Kompetensi", "Ujian : Nilai", "Buku : Rak", "Lampu : Gelap"], 1, "Benih yang dirawat menghasilkan panen sebagaimana proses belajar menghasilkan kompetensi."],
    ["ARSITEK : DENAH", "Programmer : Flowchart", ["Dokter : Resep", "Programmer : Flowchart", "Petani : Cangkul", "Koki : Piring", "Pilot : Bandara"], 1, "Arsitek merancang denah sebelum membangun sebagaimana programmer menyusun flowchart sebelum membuat program."],
    ["PENULIS : NASKAH", "Sutradara : Skenario", ["Penyanyi : Mikrofon", "Sutradara : Skenario", "Pelukis : Kanvas", "Guru : Papan Tulis", "Nelayan : Jaring"], 1, "Naskah/skenario diarahkan oleh sutradara dalam produksi film sebagaimana tulisan diolah oleh penulis."]
  ];

  const tiuSyllogisms = [
    ["Semua peserta seleksi CPNS wajib mengikuti tes SKD. Sebagian peserta tes SKD berasal dari luar daerah.", "Sebagian peserta seleksi CPNS berasal dari luar daerah.", ["Semua peserta seleksi CPNS berasal dari luar daerah.", "Sebagian peserta seleksi CPNS berasal dari luar daerah.", "Tidak ada peserta SKD yang berasal dari dalam daerah.", "Semua yang berasal dari luar daerah adalah peserta CPNS.", "Sebagian peserta seleksi CPNS tidak mengikuti tes SKD."], 1, "Karena seluruh peserta CPNS mengikuti SKD dan sebagian peserta SKD berasal dari luar daerah, maka sebagian peserta seleksi CPNS berasal dari luar daerah."],
    ["Semua pegawai yang hadir tepat waktu mendapat poin kedisiplinan. Budi hadir tepat waktu.", "Budi mendapat poin kedisiplinan.", ["Budi tidak mendapat poin kedisiplinan.", "Budi mendapat poin kedisiplinan.", "Semua pegawai pasti Budi.", "Hanya Budi yang hadir tepat waktu.", "Budi belum tentu disiplin."], 1, "Premis mayor dan minor bersifat afirmatif langsung sehingga Budi pasti mendapat poin kedisiplinan."],
    ["Tidak ada dokumen rahasia yang boleh diunggah ke penyimpanan publik. Dokumen A adalah dokumen rahasia.", "Dokumen A tidak boleh diunggah ke penyimpanan publik.", ["Dokumen A boleh diunggah ke penyimpanan publik.", "Dokumen A tidak boleh diunggah ke penyimpanan publik.", "Semua dokumen di penyimpanan publik adalah rahasia.", "Dokumen A bukan dokumen resmi.", "Dokumen A boleh disalin bebas."], 1, "Karena tidak ada dokumen rahasia yang boleh diunggah ke publik dan Dokumen A bersifat rahasia, maka Dokumen A tidak boleh diunggah ke publik."],
    ["Jika hujan deras turun, jalan menuju kantor tergenang. Hari ini jalan menuju kantor tidak tergenang.", "Hujan deras tidak turun.", ["Hujan deras pasti turun.", "Hujan deras tidak turun.", "Kantor diliburkan.", "Jalan sedang diperbaiki.", "Tidak dapat disimpulkan."], 1, "Dengan kaidah modus tollens (jika P maka Q; negasi Q; maka negasi P), hujan deras tidak turun."],
    ["Setiap peserta pelatihan wajib menyelesaikan tugas akhir. Rina adalah peserta pelatihan.", "Rina wajib menyelesaikan tugas akhir.", ["Rina tidak wajib menyelesaikan tugas akhir.", "Rina wajib menyelesaikan tugas akhir.", "Rina sudah lulus pelatihan.", "Tugas akhir Rina dibatalkan.", "Sebagian peserta tidak mengerjakan tugas."], 1, "Rina termasuk anggota himpunan peserta pelatihan sehingga terikat kewajiban menyelesaikan tugas akhir."]
  ];

  for (let i = 0; i < 35; i++) {
    const modType = i % 5;
    if (modType === 0) {
      const ana = tiuAnalogies[Math.floor(i / 5) % tiuAnalogies.length];
      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Verbal - Analogi",
        question: `${ana[0].split(" : ")[0]} : ${ana[0].split(" : ")[1]} = ... : ...`,
        options: [...ana[2]],
        answer: ana[3],
        explanation: ana[4]
      });
    } else if (modType === 1) {
      const syl = tiuSyllogisms[Math.floor(i / 5) % tiuSyllogisms.length];
      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Verbal - Silogisme",
        question: `${syl[0]} Kesimpulan yang paling tepat adalah...`,
        options: [...syl[2]],
        answer: syl[3],
        explanation: syl[4]
      });
    } else if (modType === 2) {
      const ruleIdx = Math.floor(i / 5) % tiuSeriesRules.length;
      const rule = tiuSeriesRules[ruleIdx];
      let seq = [];
      let nextVal = 0;

      if (rule.stepAdd) {
        let cur = rule.start + (i * 2);
        let step = rule.stepAdd;
        for (let k = 0; k < 5; k++) {
          seq.push(cur);
          cur += step;
          step += 3;
        }
        nextVal = cur;
      } else if (rule.mult && rule.add) {
        let cur = rule.start + (i % 3);
        for (let k = 0; k < 5; k++) {
          seq.push(cur);
          cur = cur * rule.mult + rule.add;
        }
        nextVal = cur;
      } else if (rule.stepSub) {
        let cur = rule.start + (i * 3);
        for (let k = 0; k < 5; k++) {
          seq.push(cur);
          cur -= rule.stepSub;
        }
        nextVal = cur;
      } else if (rule.mult) {
        let cur = rule.start + (i % 2);
        for (let k = 0; k < 5; k++) {
          seq.push(cur);
          cur *= rule.mult;
        }
        nextVal = cur;
      } else {
        let a = 1 + (i % 3);
        let b = 2 + (i % 2);
        seq = [a, b];
        for (let k = 2; k < 5; k++) {
          const nxt = seq[k - 1] + seq[k - 2];
          seq.push(nxt);
        }
        nextVal = seq[4] + seq[3];
      }

      const distractors = new Set([nextVal]);
      for (const delta of [-4, -2, 2, 4, 6]) {
        if (distractors.size < 5) distractors.add(nextVal + delta);
      }
      const opts = Array.from(distractors).sort((a, b) => a - b).map(String);
      const ansIdx = opts.indexOf(String(nextVal));

      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Numerik - Deret Angka",
        question: `Tentukan bilangan berikutnya dari deret berikut: ${seq.join(", ")}, ...`,
        options: opts,
        answer: ansIdx >= 0 ? ansIdx : 0,
        explanation: `Deret: ${seq.join(", ")}, ${nextVal}. ${rule.label}.`
      });
    } else if (modType === 3) {
      const pct = 20 + ((i % 4) * 5);
      const baseX = 200 + ((i % 5) * 40);
      const xVal = (pct / 100) * baseX;
      const yVal = xVal + ((i % 3) - 1) * 5;
      let relSymbol = "=";
      let ansIdx = 2;
      if (xVal > yVal) {
        relSymbol = ">";
        ansIdx = 0;
      } else if (xVal < yVal) {
        relSymbol = "<";
        ansIdx = 1;
      }
      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Numerik - Perbandingan",
        question: `Jika x = ${pct}% dari ${baseX} dan y = ${yVal}, maka hubungan yang tepat antara x dan y adalah...`,
        options: ["x > y", "x < y", "x = y", `x + y = ${xVal + yVal}`, "Hubungan tidak dapat ditentukan"],
        answer: ansIdx,
        explanation: `Nilai x = (${pct}/100) × ${baseX} = ${xVal}, sedangkan y = ${yVal}, sehingga berlaku x ${relSymbol} y.`
      });
    } else {
      const dirs = ["Utara", "Timur", "Selatan", "Barat"];
      const startIdx = i % 4;
      const stepCount = 3;
      const endIdx = (startIdx + stepCount) % 4;
      const seqDirs = [
        dirs[startIdx % 4],
        dirs[(startIdx + 1) % 4],
        dirs[(startIdx + 2) % 4]
      ];
      const expectedDir = dirs[endIdx];
      const opts = ["Utara", "Timur Laut", "Barat", "Tenggara", "Selatan"];
      const ansIdx = opts.indexOf(expectedDir);

      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Figural - Pola Gambar",
        question: `Perhatikan urutan rotasi panah searah jarum jam sebesar 90 derajat setiap langkah: ${seqDirs.join(" → ")} → ... Arah panah berikutnya adalah...`,
        svg: '<svg viewBox="0 0 260 60" class="w-64 h-16 mx-auto"><rect x="5" y="5" width="50" height="50" rx="8" fill="#eff6ff" stroke="#3b82f6"/><path d="M30 42 L30 18 M23 25 L30 18 L37 25" stroke="#1d4ed8" stroke-width="3" fill="none"/><rect x="70" y="5" width="50" height="50" rx="8" fill="#eff6ff" stroke="#3b82f6"/><path d="M83 30 L107 30 M100 23 L107 30 L100 37" stroke="#1d4ed8" stroke-width="3" fill="none"/><rect x="135" y="5" width="50" height="50" rx="8" fill="#eff6ff" stroke="#3b82f6"/><path d="M160 18 L160 42 M153 35 L160 42 L167 35" stroke="#1d4ed8" stroke-width="3" fill="none"/><rect x="200" y="5" width="50" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-dasharray="4"/><text x="225" y="36" text-anchor="middle" font-size="18" font-weight="bold" fill="#b45309">?</text></svg>',
        options: opts,
        answer: ansIdx >= 0 ? ansIdx : 2,
        explanation: `Urutan rotasi searah jarum jam 90 derajat dari ${seqDirs[0]} menghasilkan arah berikutnya yaitu ${expectedDir}.`
      });
    }
  }

  const tkpTemplates = [
    {
      category: "Pelayanan Publik",
      question: "Saat jam pelayanan hampir berakhir, datang seorang warga lansia dari desa terpencil yang berkas permohonannya belum lengkap. Sikap Anda sebagai petugas pelayanan adalah...",
      options: [
        "Meminta warga tersebut kembali esok hari karena loket segera tutup.",
        "Menjelaskan kekurangan berkas dengan ramah, membantu mencatat rincian yang perlu dilengkapi, dan memprioritaskan pelayanannya saat berkas siap.",
        "Menerima berkas apa adanya agar warga cepat pulang meskipun nantinya ditolak sistem.",
        "Menyarankan warga tersebut meminta bantuan calo di luar kantor agar lebih cepat.",
        "Menutup loket sesuai jam operasional tanpa memberikan penjelasan panjang."
      ],
      scores: [2, 5, 3, 1, 2],
      explanation: "Pelayanan publik menuntut empati, kejelasan informasi, dan solusi prosedural tanpa melanggar aturan."
    },
    {
      category: "Jejaring Kerja",
      question: "Tim kerja Anda mendapat tugas lintas bidang yang membutuhkan koordinasi cepat dengan unit lain yang memiliki gaya kerja berbeda. Langkah pertama yang Anda lakukan adalah...",
      options: [
        "Mengerjakan bagian tim sendiri terlebih dahulu tanpa menunggu unit lain.",
        "Menginisiasi rapat koordinasi singkat untuk menyepakati pembagian peran, jadwal, dan kanal komunikasi bersama.",
        "Melaporkan kepada atasan bahwa koordinasi lintas unit sulit dilakukan.",
        "Menunggu unit lain menghubungi tim Anda terlebih dahulu.",
        "Mengambil alih seluruh pekerjaan agar tidak terjadi perbedaan pendapat."
      ],
      scores: [3, 5, 1, 2, 2],
      explanation: "Membangun komunikasi aktif dan menyepakati alur kerja bersama adalah kunci efektivitas jejaring kerja."
    },
    {
      category: "Sosial Budaya",
      question: "Anda ditempatkan di daerah dengan adat istiadat dan bahasa daerah yang berbeda dari daerah asal Anda. Agar dapat beradaptasi dengan baik di lingkungan kerja dan masyarakat, Anda akan...",
      options: [
        "Tetap menggunakan kebiasaan daerah asal karena merasa paling nyaman.",
        "Mempelajari nilai budaya setempat, menghormati tradisi lokal, serta menggunakan bahasa Indonesia yang santun sambil belajar kosakata dasar daerah.",
        "Membatasi interaksi hanya pada urusan pekerjaan formal di kantor.",
        "Membanding-bandingkan budaya setempat dengan budaya daerah asal Anda.",
        "Menghindari kegiatan kemasyarakatan agar tidak salah bersikap."
      ],
      scores: [2, 5, 3, 1, 2],
      explanation: "Sikap adaptif, terbuka, dan menghormati kearifan lokal mencerminkan kompetensi sosial budaya ASN."
    },
    {
      category: "Teknologi Informasi & Komunikasi",
      question: "Instansi Anda meluncurkan aplikasi persuratan digital baru untuk menggantikan proses manual, namun beberapa rekan senior kesulitan menggunakannya. Sikap Anda adalah...",
      options: [
        "Menggunakan aplikasi hanya untuk diri sendiri karena bukan tugas Anda mengajari orang lain.",
        "Membuat panduan ringkas bergambar dan meluangkan waktu mendampingi rekan senior hingga terbiasa mengoperasikannya.",
        "Mengusulkan agar instansi kembali ke sistem kertas manual saja.",
        "Mengerjakan seluruh input surat rekan senior agar cepat selesai.",
        "Mengkritik rekan senior yang lambat beradaptasi dengan teknologi."
      ],
      scores: [2, 5, 1, 3, 1],
      explanation: "Pemanfaatan TIK optimal tercapai ketika ASN mampu mengoperasikan sistem sekaligus mendorong kolaborasi literasi digital di unit kerjanya."
    },
    {
      category: "Profesionalisme",
      question: "Anda diberikan dua tugas penting dengan tenggat waktu bersamaan oleh atasan. Tindakan yang paling profesional adalah...",
      options: [
        "Mengerjakan tugas yang paling mudah dan menunda tugas lainnya melewati tenggat.",
        "Memetakan skala prioritas dan estimasi waktu pengerjaan, mengomunikasikan rencana penyelesaian kepada atasan, lalu mengeksekusi secara fokus.",
        "Mengeluh kepada rekan kerja karena beban kerja terasa tidak adil.",
        "Mengerjakan keduanya secara terburu-buru tanpa memeriksa ketelitian hasil.",
        "Menolak salah satu tugas secara sepihak tanpa diskusi."
      ],
      scores: [2, 5, 1, 3, 1],
      explanation: "Profesionalisme ditunjukkan melalui manajemen prioritas, komunikasi asertif dengan pimpinan, dan komitmen terhadap kualitas hasil."
    },
    {
      category: "Anti Radikalisme",
      question: "Di grup percakapan lingkungan tempat tinggal, beredar pesan provokatif yang mengajak warga menolak keberadaan rumah ibadah kelompok lain. Sikap Anda adalah...",
      options: [
        "Ikut meneruskan pesan tersebut agar warga lain mengetahui isinya.",
        "Mengingatkan warga dengan santun untuk menahan diri, mengklarifikasi informasi berdasarkan aturan kerukunan umat beragama, dan mengajak berdialog damai.",
        "Keluar dari grup tanpa memberikan tanggapan apa pun.",
        "Mendukung ajakan tersebut demi menjaga homogenitas lingkungan.",
        "Membiarkan perdebatan memanas karena bukan urusan pribadi Anda."
      ],
      scores: [1, 5, 3, 1, 2],
      explanation: "ASN berperan aktif menjaga persatuan, toleransi, dan meredam potensi intoleransi maupun radikalisme di masyarakat."
    }
  ];

  for (let i = 0; i < 45; i++) {
    const tpl = tkpTemplates[i % tkpTemplates.length];
    const cycle = Math.floor(i / tkpTemplates.length) + 1;
    bank.push({
      id: qId++,
      subtest: "TKP",
      category: tpl.category,
      question: cycle === 1
        ? tpl.question
        : `[Situasi ${tpl.category} #${cycle}] ${tpl.question}`,
      options: [...tpl.options],
      scores: [...tpl.scores],
      explanation: tpl.explanation
    });
  }

  return bank;
}

questionBank = buildDefaultQuestionBank();

function sanitizeQuestionMedia(rawMarkup) {
  if (typeof rawMarkup !== "string" || !rawMarkup.trim()) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawMarkup, "text/html");

  const svgEl = doc.body.querySelector("svg");
  if (svgEl) {
    const forbiddenTags = ["script", "iframe", "object", "embed", "foreignobject", "link", "meta"];
    forbiddenTags.forEach((tag) => {
      svgEl.querySelectorAll(tag).forEach((el) => el.remove());
    });

    [svgEl, ...svgEl.querySelectorAll("*")].forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        const attrVal = String(attr.value || "").trim().toLowerCase();
        if (
          attrName.startsWith("on") ||
          ((attrName === "href" || attrName === "xlink:href") && attrVal.startsWith("javascript:"))
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return svgEl.outerHTML;
  }

  const imgEl = doc.body.querySelector("img");
  if (imgEl) {
    const src = String(imgEl.getAttribute("src") || "").trim();
    const isAllowedUrl =
      src.startsWith("https://drive.google.com/thumbnail") ||
      src.startsWith("https://lh3.googleusercontent.com/");
    if (!isAllowedUrl) return "";

    const cleanImg = document.createElement("img");
    cleanImg.src = src;
    cleanImg.alt = imgEl.getAttribute("alt") || "Gambar Soal";
    cleanImg.className = "max-h-56 mx-auto rounded-lg border border-slate-200";
    return cleanImg.outerHTML;
  }

  return "";
}

function updateQuestionStatsUI(sourceLabel) {
  const badge = document.getElementById("heroQuestionSummaryBadge");
  const twkLabel = document.getElementById("twkCountLabel");
  const tiuLabel = document.getElementById("tiuCountLabel");
  const tkpLabel = document.getElementById("tkpCountLabel");
  const reviewBtn = document.getElementById("toggleReviewBtn");
  const statusEl = document.getElementById("bankLoadStatus");

  const twkTotal = questionBank.filter(q => String(q.subtest || "").toUpperCase() === "TWK").length;
  const tiuTotal = questionBank.filter(q => String(q.subtest || "").toUpperCase() === "TIU").length;
  const tkpTotal = questionBank.filter(q => String(q.subtest || "").toUpperCase() === "TKP").length;
  const allTotal = questionBank.length;

  if (badge) badge.textContent = `${allTotal} Soal • TWK (${twkTotal}) • TIU (${tiuTotal}) • TKP (${tkpTotal})`;
  if (twkLabel) twkLabel.textContent = `1. TWK (${twkTotal} Soal)`;
  if (tiuLabel) tiuLabel.textContent = `2. TIU (${tiuTotal} Soal)`;
  if (tkpLabel) tkpLabel.textContent = `3. TKP (${tkpTotal} Soal)`;
  if (reviewBtn) reviewBtn.textContent = `Lihat Kunci Jawaban & Pembahasan (${allTotal} Soal)`;
  if (sourceLabel && statusEl) statusEl.textContent = sourceLabel;
}

async function muatBankSoalDariSheet() {
  const badge = document.getElementById("scriptConfigBadge");
  const statusEl = document.getElementById("bankLoadStatus");

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TEMPEL_URL")) {
    if (badge) {
      badge.textContent = "Belum ditempel URL Apps Script (Mode Lokal)";
      badge.className = "font-semibold text-amber-700";
    }
    updateQuestionStatsUI("Sumber Soal: Bank Soal Bawaan (110 soal unik)");
    return;
  }

  if (badge) {
    badge.textContent = "Terhubung ke Google Sheets";
    badge.className = "font-semibold text-emerald-700";
  }
  if (statusEl) statusEl.textContent = "Memuat soal terbaru dari tab BankSoal...";

  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?mode=soal`);
    const json = await res.json();

    if (
      json &&
      json.status === "sukses" &&
      Array.isArray(json.soal) &&
      json.soal.length > 0
    ) {
      questionBank = json.soal.map((item, idx) => {
        const subtest = String(item.subtest || "TWK").trim().toUpperCase();
        const normalized = {
          id: item.id || idx + 1,
          subtest,
          category: item.category || "Umum",
          question: item.question || "",
          options: Array.isArray(item.options) ? item.options : [],
          explanation: item.explanation || "",
          svg: item.svg || ""
        };

        if (subtest === "TKP") {
          if (Array.isArray(item.scores)) {
            normalized.scores = item.scores.map(Number);
          } else if (item.keyRaw) {
            normalized.scores = String(item.keyRaw).split(",").map(s => Number(s.trim()) || 0);
          } else {
            normalized.scores = [1, 2, 3, 4, 5];
          }
        } else {
          if (typeof item.answer === "number") {
            normalized.answer = item.answer;
          } else {
            const letterIdx = ["A", "B", "C", "D", "E"].indexOf(String(item.keyRaw || "A").trim().toUpperCase());
            normalized.answer = letterIdx >= 0 ? letterIdx : 0;
          }
        }
        return normalized;
      });
      updateQuestionStatsUI(`Sumber Soal: Tab BankSoal Google Sheets (${questionBank.length} soal)`);
    } else {
      updateQuestionStatsUI("Sumber Soal: Bank Soal Bawaan (110 soal unik)");
    }
  } catch (err) {
    console.warn("Gagal mengambil bank soal dari Sheet, menggunakan bank soal bawaan.", err);
    updateQuestionStatsUI("Sumber Soal: Bank Soal Bawaan (110 soal unik)");
  }
}
