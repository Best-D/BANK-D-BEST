function buildDefaultQuestionBank() {
  const bank = [];
  let qId = 1;

  const twkTopics = [
    {
      category: "Nasionalisme",
      question:
        "Semangat kebangsaan yang menempatkan kepentingan bangsa dan negara di atas kepentingan pribadi maupun golongan merupakan wujud pengamalan nilai...",
      options: [
        "Sila Pertama Pancasila",
        "Sila Kedua Pancasila",
        "Sila Ketiga Pancasila",
        "Sila Keempat Pancasila",
        "Sila Kelima Pancasila"
      ],
      answer: 2,
      explanation:
        "Sila Ketiga Pancasila (Persatuan Indonesia) menekankan persatuan, kesatuan, serta kepentingan bangsa dan negara di atas kepentingan pribadi atau golongan."
    },
    {
      category: "Integritas",
      question:
        "Seorang ASN menolak pemberian bingkisan hari raya dari rekanan pengadaan barang dan jasa meskipun proses lelang telah selesai dilaksanakan. Sikap ASN tersebut mencerminkan nilai integritas...",
      options: [
        "Tanggung jawab dan kerja keras",
        "Kejujuran dan kemandirian",
        "Keadilan dan keberanian",
        "Kesederhanaan dan kepedulian",
        "Kedisiplinan dan ketekunan"
      ],
      answer: 1,
      explanation:
        "Menolak gratifikasi yang berpotensi menimbulkan konflik kepentingan merupakan wujud kejujuran dan kemandirian dalam menjaga integritas jabatan."
    },
    {
      category: "Bela Negara",
      question:
        "Berdasarkan Pasal 27 ayat (3) UUD NRI Tahun 1945, setiap warga negara berhak dan wajib ikut serta dalam upaya...",
      options: [
        "Pertahanan dan keamanan negara",
        "Pembelaan negara",
        "Pembangunan nasional",
        "Pendidikan dasar",
        "Perekonomian nasional"
      ],
      answer: 1,
      explanation:
        "Pasal 27 ayat (3) UUD NRI Tahun 1945 mengatur hak dan kewajiban setiap warga negara untuk ikut serta dalam upaya pembelaan negara."
    },
    {
      category: "Pilar Negara",
      question:
        "Lembaga negara yang berwenang memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD NRI Tahun 1945 adalah...",
      options: [
        "Mahkamah Agung",
        "Mahkamah Konstitusi",
        "Komisi Yudisial",
        "Majelis Permusyawaratan Rakyat",
        "Dewan Perwakilan Rakyat"
      ],
      answer: 1,
      explanation:
        "Berdasarkan Pasal 24C ayat (1) UUD NRI Tahun 1945, Mahkamah Konstitusi berwenang memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD."
    },
    {
      category: "Bahasa Negara",
      question:
        "Penulisan gabungan kata di bawah ini yang sesuai dengan kaidah ejaan bahasa Indonesia yang berlaku adalah...",
      options: [
        "Bertanggungjawab",
        "Menyebar luaskan",
        "Diberitahukan",
        "Penghancur leburan",
        "Ketidak adilan"
      ],
      answer: 2,
      explanation:
        "Gabungan kata yang mendapat awalan dan akhiran sekaligus (konfiks) ditulis serangkai, seperti 'diberitahukan' dan 'menyebarluaskan'."
    },
    {
      category: "Nasionalisme",
      question:
        "Penggunaan produk dalam negeri oleh aparatur negara dan masyarakat dalam kegiatan resmi instansi merupakan langkah konkret memperkuat...",
      options: [
        "Kemandirian ekonomi nasional",
        "Kewenangan daerah otonom",
        "Eksklusivitas budaya lokal",
        "Liberalisasi perdagangan",
        "Sentralisasi anggaran"
      ],
      answer: 0,
      explanation:
        "Mengutamakan produk dalam negeri mendukung kemandirian industri nasional, penyerapan tenaga kerja lokal, dan ketahanan ekonomi."
    },
    {
      category: "Integritas",
      question:
        "Ketika menemukan kesalahan pencatatan anggaran pada laporan unit kerja sebelum ditandatangani pimpinan, tindakan paling berintegritas yang dilakukan staf adalah...",
      options: [
        "Membiarkannya karena tanggung jawab ada pada penandatangan",
        "Menyampaikan temuan secara objektif disertai bukti dan usulan perbaikan sebelum laporan disahkan",
        "Menghapus data lama tanpa membuat catatan koreksi",
        "Menunggu audit eksternal menemukan kesalahan tersebut",
        "Mengalihkan dokumen ke staf lain agar tidak terlacak"
      ],
      answer: 1,
      explanation:
        "Integritas menuntut kejujuran, transparansi, dan keberanian mengoreksi kekeliruan secara prosedural sebelum merugikan organisasi."
    },
    {
      category: "Bela Negara",
      question:
        "Dalam konteks ancaman nonmiliter di ruang digital, peran warga negara dalam menjaga ketahanan informasi nasional dapat diwujudkan melalui...",
      options: [
        "Menyebarkan ulang informasi viral agar cepat diketahui publik",
        "Memverifikasi kredibilitas sumber berita sebelum membagikan dan menjaga etika bermedia digital",
        "Menonaktifkan seluruh akses informasi publik",
        "Menggunakan identitas palsu untuk menyerang akun tertentu",
        "Mengabaikan keamanan akun resmi instansi"
      ],
      answer: 1,
      explanation:
        "Literasi digital, pengecekan fakta, dan kepatuhan etika ruang siber merupakan bagian dari kesadaran bela negara di era modern."
    },
    {
      category: "Pilar Negara",
      question:
        "Prinsip negara hukum Indonesia ditegaskan dalam UUD NRI Tahun 1945 bahwa kekuasaan kehakiman merupakan kekuasaan yang merdeka untuk menyelenggarakan peradilan guna...",
      options: [
        "Membantu kebijakan kementerian teknis",
        "Menegakkan hukum dan keadilan",
        "Menetapkan APBN bersama pemerintah",
        "Mengawasi pemilihan kepala desa",
        "Menyusun kurikulum nasional"
      ],
      answer: 1,
      explanation:
        "Pasal 24 ayat (1) UUD NRI Tahun 1945 menegaskan kekuasaan kehakiman yang merdeka untuk menyelenggarakan peradilan guna menegakkan hukum dan keadilan."
    },
    {
      category: "Bahasa Negara",
      question:
        "Kalimat berikut yang menggunakan kata baku dan struktur efektif sesuai kaidah bahasa Indonesia adalah...",
      options: [
        "Para peserta diharap untuk hadir tepat waktu.",
        "Kami mohon maaf atas ketidaknyamanannya.",
        "Kegiatan sosialisasi tersebut telah dilaksanakan pada hari Senin.",
        "Dia membicarakan tentang rencana kerja tahun depan.",
        "Semua pegawai-pegawai mengikuti apel pagi."
      ],
      answer: 2,
      explanation:
        "Kalimat 'Kegiatan sosialisasi tersebut telah dilaksanakan pada hari Senin' tepat secara ejaan, bentuk kata, dan keefektifan kalimat."
    }
  ];

  for (let i = 0; i < 30; i++) {
    const base = twkTopics[i % twkTopics.length];
    const variantNum = Math.floor(i / twkTopics.length) + 1;
    bank.push({
      id: qId++,
      subtest: "TWK",
      category: base.category,
      question:
        variantNum === 1
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
    [
      "KONSTITUSI : NEGARA",
      "Anggaran Dasar : Organisasi",
      [
        "Pasal : Undang-Undang",
        "Anggaran Dasar : Organisasi",
        "Hakim : Pengadilan",
        "Peraturan : Sanksi",
        "Rakyat : Wilayah"
      ],
      1,
      "Konstitusi menjadi landasan dasar negara sebagaimana Anggaran Dasar menjadi landasan dasar organisasi."
    ],
    [
      "KOMPAS : ARAH",
      "Termometer : Suhu",
      [
        "Jam : Detik",
        "Termometer : Suhu",
        "Peta : Pulau",
        "Jarum : Kompor",
        "Lensa : Kacamata"
      ],
      1,
      "Kompas berfungsi menunjukkan arah sebagaimana termometer berfungsi mengukur suhu."
    ],
    [
      "BENIH : PANEN",
      "Belajar : Kompetensi",
      [
        "Hujan : Payung",
        "Belajar : Kompetensi",
        "Ujian : Nilai",
        "Buku : Rak",
        "Lampu : Gelap"
      ],
      1,
      "Benih yang dirawat menghasilkan panen sebagaimana proses belajar menghasilkan kompetensi."
    ],
    [
      "ARSITEK : DENAH",
      "Programmer : Flowchart",
      [
        "Dokter : Resep",
        "Programmer : Flowchart",
        "Petani : Cangkul",
        "Koki : Piring",
        "Pilot : Bandara"
      ],
      1,
      "Arsitek merancang denah sebelum membangun sebagaimana programmer menyusun flowchart sebelum membuat program."
    ],
    [
      "PENULIS : NASKAH",
      "Sutradara : Skenario",
      [
        "Penyanyi : Mikrofon",
        "Sutradara : Skenario",
        "Pelukis : Kanvas",
        "Guru : Papan Tulis",
        "Nelayan : Jaring"
      ],
      1,
      "Skenario diarahkan oleh sutradara sebagaimana naskah disusun oleh penulis."
    ]
  ];

  const tiuSyllogisms = [
    [
      "Semua peserta seleksi CPNS wajib mengikuti tes SKD. Sebagian peserta tes SKD berasal dari luar daerah.",
      "Sebagian peserta seleksi CPNS berasal dari luar daerah.",
      [
        "Semua peserta seleksi CPNS berasal dari luar daerah.",
        "Sebagian peserta seleksi CPNS berasal dari luar daerah.",
        "Tidak ada peserta SKD yang berasal dari dalam daerah.",
        "Semua yang berasal dari luar daerah adalah peserta CPNS.",
        "Sebagian peserta seleksi CPNS tidak mengikuti tes SKD."
      ],
      1,
      "Karena seluruh peserta CPNS mengikuti SKD dan sebagian peserta SKD berasal dari luar daerah, maka sebagian peserta seleksi CPNS berasal dari luar daerah."
    ],
    [
      "Semua pegawai yang hadir tepat waktu mendapat poin kedisiplinan. Budi hadir tepat waktu.",
      "Budi mendapat poin kedisiplinan.",
      [
        "Budi tidak mendapat poin kedisiplinan.",
        "Budi mendapat poin kedisiplinan.",
        "Semua pegawai pasti Budi.",
        "Hanya Budi yang hadir tepat waktu.",
        "Budi belum tentu disiplin."
      ],
      1,
      "Premis mayor dan minor bersifat afirmatif langsung sehingga Budi pasti mendapat poin kedisiplinan."
    ],
    [
      "Tidak ada dokumen rahasia yang boleh diunggah ke penyimpanan publik. Dokumen A adalah dokumen rahasia.",
      "Dokumen A tidak boleh diunggah ke penyimpanan publik.",
      [
        "Dokumen A boleh diunggah ke penyimpanan publik.",
        "Dokumen A tidak boleh diunggah ke penyimpanan publik.",
        "Semua dokumen di penyimpanan publik adalah rahasia.",
        "Dokumen A bukan dokumen resmi.",
        "Dokumen A boleh disalin bebas."
      ],
      1,
      "Karena tidak ada dokumen rahasia yang boleh diunggah ke publik dan Dokumen A bersifat rahasia, maka Dokumen A tidak boleh diunggah ke publik."
    ],
    [
      "Jika hujan deras turun, jalan menuju kantor tergenang. Hari ini jalan menuju kantor tidak tergenang.",
      "Hujan deras tidak turun.",
      [
        "Hujan deras pasti turun.",
        "Hujan deras tidak turun.",
        "Kantor diliburkan.",
        "Jalan sedang diperbaiki.",
        "Tidak dapat disimpulkan."
      ],
      1,
      "Dengan kaidah modus tollens (jika P maka Q; negasi Q; maka negasi P), hujan deras tidak turun."
    ],
    [
      "Setiap peserta pelatihan wajib menyelesaikan tugas akhir. Rina adalah peserta pelatihan.",
      "Rina wajib menyelesaikan tugas akhir.",
      [
        "Rina tidak wajib menyelesaikan tugas akhir.",
        "Rina wajib menyelesaikan tugas akhir.",
        "Rina sudah lulus pelatihan.",
        "Tugas akhir Rina dibatalkan.",
        "Sebagian peserta tidak mengerjakan tugas."
      ],
      1,
      "Rina termasuk anggota himpunan peserta pelatihan sehingga terikat kewajiban menyelesaikan tugas akhir."
    ]
  ];

  for (let i = 0; i < 35; i++) {
    const modType = i % 5;
    if (modType === 0) {
      const ana = tiuAnalogies[Math.floor(i / 5) % tiuAnalogies.length];
      const pairParts = ana[0].split(" : ");
      bank.push({
        id: qId++,
        subtest: "TIU",
        category: "Verbal - Analogi",
        question: `${pairParts[0]} : ${pairParts[1]} = ... : ...`,
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
        let cur = rule.start + i * 2;
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
        let cur = rule.start + i * 3;
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
        const a = 1 + (i % 3);
        const b = 2 + (i % 2);
        seq = [a, b];
        for (let k = 2; k < 5; k++) {
          seq.push(seq[k - 1] + seq[k - 2]);
        }
        nextVal = seq[4] + seq[3];
      }

      const distractors = new Set([nextVal]);
      for (const delta of [-4, -2, 2, 4, 6]) {
        if (distractors.size < 5) distractors.add(nextVal + delta);
      }
      const opts = Array.from(distractors)
        .sort((a, b) => a - b)
        .map(String);
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
      const pct = 20 + (i % 4) * 5;
      const baseX = 200 + (i % 5) * 40;
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
        options: [
          "x > y",
          "x < y",
          "x = y",
          `x + y = ${xVal + yVal}`,
          "Hubungan tidak dapat ditentukan"
        ],
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
      question:
        "Saat jam pelayanan hampir berakhir, datang seorang warga lansia dari desa terpencil yang berkas permohonannya belum lengkap. Sikap Anda sebagai petugas pelayanan adalah...",
      options: [
        "Meminta warga tersebut kembali esok hari karena loket segera tutup.",
        "Menjelaskan kekurangan berkas dengan ramah, membantu mencatat rincian yang perlu dilengkapi, dan memprioritaskan pelayanannya saat berkas siap.",
        "Menerima berkas apa adanya agar warga cepat pulang meskipun nantinya ditolak sistem.",
        "Menyarankan warga tersebut meminta bantuan calo di luar kantor agar lebih cepat.",
        "Menutup loket sesuai jam operasional tanpa memberikan penjelasan panjang."
      ],
      scores: [2, 5, 3, 1, 2],
      explanation:
        "Pelayanan publik menuntut empati, kejelasan informasi, dan solusi prosedural tanpa melanggar aturan."
    },
    {
      category: "Jejaring Kerja",
      question:
        "Tim kerja Anda mendapat tugas lintas bidang yang membutuhkan koordinasi cepat dengan unit lain yang memiliki gaya kerja berbeda. Langkah pertama yang Anda lakukan adalah...",
      options: [
        "Mengerjakan bagian tim sendiri terlebih dahulu tanpa menunggu unit lain.",
        "Menginisiasi rapat koordinasi singkat untuk menyepakati pembagian peran, jadwal, dan kanal komunikasi bersama.",
        "Melaporkan kepada atasan bahwa koordinasi lintas unit sulit dilakukan.",
        "Menunggu unit lain menghubungi tim Anda terlebih dahulu.",
        "Mengambil alih seluruh pekerjaan agar tidak terjadi perbedaan pendapat."
      ],
      scores: [3, 5, 1, 2, 2],
      explanation:
        "Membangun komunikasi aktif dan menyepakati alur kerja bersama adalah kunci efektivitas jejaring kerja."
    },
    {
      category: "Sosial Budaya",
      question:
        "Anda ditempatkan di daerah dengan adat istiadat dan bahasa daerah yang berbeda dari daerah asal Anda. Agar dapat beradaptasi dengan baik di lingkungan kerja dan masyarakat, Anda akan...",
      options: [
        "Tetap menggunakan kebiasaan daerah asal karena merasa paling nyaman.",
        "Mempelajari nilai budaya setempat, menghormati tradisi lokal, serta menggunakan bahasa Indonesia yang santun sambil belajar kosakata dasar daerah.",
        "Membatasi interaksi hanya pada urusan pekerjaan formal di kantor.",
        "Membanding-bandingkan budaya setempat dengan budaya daerah asal Anda.",
        "Menghindari kegiatan kemasyarakatan agar tidak salah bersikap."
      ],
      scores: [2, 5, 3, 1, 2],
      explanation:
        "Sikap adaptif, terbuka, dan menghormati kearifan lokal mencerminkan kompetensi sosial budaya ASN."
    },
    {
      category: "Teknologi Informasi & Komunikasi",
      question:
        "Instansi Anda meluncurkan aplikasi persuratan digital baru untuk menggantikan proses manual, namun beberapa rekan senior kesulitan menggunakannya. Sikap Anda adalah...",
      options: [
        "Menggunakan aplikasi hanya untuk diri sendiri karena bukan tugas Anda mengajari orang lain.",
        "Membuat panduan ringkas bergambar dan meluangkan waktu mendampingi rekan senior hingga terbiasa mengoperasikannya.",
        "Mengusulkan agar instansi kembali ke sistem kertas manual saja.",
        "Mengerjakan seluruh input surat rekan senior agar cepat selesai.",
        "Mengkritik rekan senior yang lambat beradaptasi dengan teknologi."
      ],
      scores: [2, 5, 1, 3, 1],
      explanation:
        "Pemanfaatan TIK optimal tercapai ketika ASN mampu mengoperasikan sistem sekaligus mendorong kolaborasi literasi digital di unit kerjanya."
    },
    {
      category: "Profesionalisme",
      question:
        "Anda diberikan dua tugas penting dengan tenggat waktu bersamaan oleh atasan. Tindakan yang paling profesional adalah...",
      options: [
        "Mengerjakan tugas yang paling mudah dan menunda tugas lainnya melewati tenggat.",
        "Memetakan skala prioritas dan estimasi waktu pengerjaan, mengomunikasikan rencana penyelesaian kepada atasan, lalu mengeksekusi secara fokus.",
        "Mengeluh kepada rekan kerja karena beban kerja terasa tidak adil.",
        "Mengerjakan keduanya secara terburu-buru tanpa memeriksa ketelitian hasil.",
        "Menolak salah satu tugas secara sepihak tanpa diskusi."
      ],
      scores: [2, 5, 1, 3, 1],
      explanation:
        "Profesionalisme ditunjukkan melalui manajemen prioritas, komunikasi asertif dengan pimpinan, dan komitmen terhadap kualitas hasil."
    },
    {
      category: "Anti Radikalisme",
      question:
        "Di grup percakapan lingkungan tempat tinggal, beredar pesan provokatif yang mengajak warga menolak keberadaan rumah ibadah kelompok lain. Sikap Anda adalah...",
      options: [
        "Ikut meneruskan pesan tersebut agar warga lain mengetahui isinya.",
        "Mengingatkan warga dengan santun untuk menahan diri, mengklarifikasi informasi berdasarkan aturan kerukunan umat beragama, dan mengajak berdialog damai.",
        "Keluar dari grup tanpa memberikan tanggapan apa pun.",
        "Mendukung ajakan tersebut demi menjaga homogenitas lingkungan.",
        "Membiarkan perdebatan memanas karena bukan urusan pribadi Anda."
      ],
      scores: [1, 5, 3, 1, 2],
      explanation:
        "ASN berperan aktif menjaga persatuan, toleransi, dan meredam potensi intoleransi maupun radikalisme di masyarakat."
    }
  ];

  for (let i = 0; i < 45; i++) {
    const tpl = tkpTemplates[i % tkpTemplates.length];
    const cycle = Math.floor(i / tkpTemplates.length) + 1;
    bank.push({
      id: qId++,
      subtest: "TKP",
      category: tpl.category,
      question:
        cycle === 1
          ? tpl.question
          : `[Situasi ${tpl.category} #${cycle}] ${tpl.question}`,
      options: [...tpl.options],
      scores: [...tpl.scores],
      explanation: tpl.explanation
    });
  }

  return bank;
}

if (typeof questionBank === "undefined") {
  var questionBank = buildDefaultQuestionBank();
} else if (!Array.isArray(questionBank) || questionBank.length === 0) {
  questionBank = buildDefaultQuestionBank();
}

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

  if (typeof GOOGLE_SCRIPT_URL === "undefined" || !GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TEMPEL_URL")) {
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
          if (Array.isArray(item.scores) && item.scores.length >= 5) {
            normalized.scores = item.scores.map(Number);
          } else if (item.keyRaw) {
            const parsedScores = String(item.keyRaw)
              .split(",")
              .map(s => Number(s.trim()) || 0);
            normalized.scores = parsedScores.length >= 5 ? parsedScores : [1, 2, 3, 4, 5];
          } else {
            normalized.scores = [1, 2, 3, 4, 5];
          }
        } else {
          if (typeof item.answer === "number") {
            normalized.answer = item.answer;
          } else {
            const rawKey = String(item.keyRaw || "A").trim().toUpperCase();
            if (/^[0-4]$/.test(rawKey)) {
              normalized.answer = Number(rawKey);
            } else {
              const letterIdx = ["A", "B", "C", "D", "E"].indexOf(rawKey);
              normalized.answer = letterIdx >= 0 ? letterIdx : 0;
            }
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

let examQuestions = [];
let examActiveFilter = "ALL";
const examSessionStorageKey =
  typeof SESSION_STORAGE_KEY !== "undefined" ? SESSION_STORAGE_KEY : "cat_skd_active_session_v1";

function getQuestionScoreForAnswer(question, ansIndex) {
  if (!question || ansIndex === null || ansIndex === undefined || ansIndex < 0) return 0;
  const sub = String(question.subtest || "").toUpperCase();
  if (sub === "TKP") {
    const scores = Array.isArray(question.scores) ? question.scores : [1, 2, 3, 4, 5];
    return Number(scores[ansIndex] || 0);
  }
  return Number(ansIndex) === Number(question.answer) ? 5 : 0;
}

function formatSecondsToClock(sec) {
  const safe = Math.max(0, Math.floor(Number(sec || 0)));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function recordCurrentQuestionDuration() {
  if (!isExamActive || !currentQuestionEnteredAt) return;
  if (!Array.isArray(questionDurations) || typeof currentIndex !== "number") return;
  const elapsedSec = Math.max(0, (Date.now() - currentQuestionEnteredAt) / 1000);
  questionDurations[currentIndex] = Number(questionDurations[currentIndex] || 0) + elapsedSec;
  currentQuestionEnteredAt = Date.now();
}

function saveExamSessionState() {
  if (!isExamActive) return;
  recordCurrentQuestionDuration();
  try {
    const state = {
      examQuestions,
      userAnswers,
      doubtFlags,
      questionDurations,
      currentIndex,
      examActiveFilter,
      remainingSeconds,
      examEndTime,
      participantName,
      participantEducation,
      appliedFormation,
      appliedInstitution,
      examModeLabel,
      examStartedAt
    };
    localStorage.setItem(examSessionStorageKey, JSON.stringify(state));
  } catch (err) {
    console.warn("Gagal menyimpan sesi ujian lokal:", err);
  }
}

function clearExamSessionState() {
  try {
    localStorage.removeItem(examSessionStorageKey);
  } catch (err) {}
}

function buildExamQuestionSet(focusMode, orderMode) {
  const source = Array.isArray(questionBank) && questionBank.length > 0
    ? questionBank
    : buildDefaultQuestionBank();

  const focusUpper = String(focusMode || "ALL").toUpperCase();
  let selected = [];

  if (focusUpper === "TWK" || focusUpper === "TIU" || focusUpper === "TKP") {
    selected = source
      .filter(q => String(q.subtest || "").toUpperCase() === focusUpper)
      .map(q => ({ ...q, options: Array.isArray(q.options) ? [...q.options] : [] }));
    if (orderMode === "shuffled") {
      selected = shuffleArray(selected);
    }
  } else {
    ["TWK", "TIU", "TKP"].forEach(sub => {
      const part = source
        .filter(q => String(q.subtest || "").toUpperCase() === sub)
        .map(q => ({ ...q, options: Array.isArray(q.options) ? [...q.options] : [] }));
      selected.push(...(orderMode === "shuffled" ? shuffleArray(part) : part));
    });
  }

  return selected;
}

function startTimerLoop() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const updateClock = () => {
    const nowMs = Date.now();
    remainingSeconds = Math.max(0, Math.round((examEndTime - nowMs) / 1000));
    const clockEl = document.getElementById("timerDisplay");
    if (clockEl) {
      clockEl.textContent = formatSecondsToClock(remainingSeconds);
      clockEl.className = remainingSeconds <= 300
        ? "font-mono font-bold text-lg text-rose-400 animate-pulse"
        : "font-mono font-bold text-lg text-emerald-400";
    }

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      finishExam(true);
    }
  };

  updateClock();
  timerInterval = setInterval(() => {
    updateClock();
    if (isExamActive) {
      saveExamSessionState();
    }
  }, 1000);
}

function renderExamQuestion() {
  if (!Array.isArray(examQuestions) || examQuestions.length === 0) return;
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= examQuestions.length) currentIndex = examQuestions.length - 1;

  currentQuestionEnteredAt = Date.now();
  const q = examQuestions[currentIndex];

  const badgeEl = document.getElementById("questionSubtestBadge");
  const catEl = document.getElementById("questionCategoryLabel");
  const numEl = document.getElementById("questionNumberTitle");
  const textEl = document.getElementById("questionText");
  const mediaEl = document.getElementById("questionMedia");
  const optsEl = document.getElementById("optionsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const doubtBtn = document.getElementById("doubtBtn");

  if (badgeEl) badgeEl.textContent = q.subtest || "TWK";
  if (catEl) catEl.textContent = q.category || "Umum";
  if (numEl) numEl.textContent = `Soal No. ${currentIndex + 1} dari ${examQuestions.length}`;
  if (textEl) textEl.textContent = q.question || "";

  if (mediaEl) {
    const mediaHtml = sanitizeQuestionMedia(q.svg || "");
    if (mediaHtml) {
      mediaEl.innerHTML = mediaHtml;
      mediaEl.classList.remove("hidden");
    } else {
      mediaEl.innerHTML = "";
      mediaEl.classList.add("hidden");
    }
  }

  if (optsEl) {
    optsEl.replaceChildren();
    const letters = ["A", "B", "C", "D", "E"];
    const selectedIdx = userAnswers[currentIndex];
    const optionsArr = Array.isArray(q.options) ? q.options : [];

    optionsArr.forEach((optText, idx) => {
      const isChecked = Number(selectedIdx) === idx;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = isChecked
        ? "w-full text-left p-3.5 rounded-xl border-2 border-blue-600 bg-blue-50/80 text-slate-900 text-sm font-semibold flex items-start gap-3 transition"
        : "w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-800 text-sm flex items-start gap-3 transition";

      const badge = document.createElement("span");
      badge.className = isChecked
        ? "w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5"
        : "w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5";
      badge.textContent = letters[idx] || String(idx + 1);

      const label = document.createElement("span");
      label.className = "leading-relaxed";
      label.textContent = optText || "";

      btn.append(badge, label);
      btn.onclick = () => selectOption(idx);
      optsEl.appendChild(btn);
    });
  }

  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) {
    nextBtn.textContent = currentIndex === examQuestions.length - 1
      ? "Simpan & Tinjau Selesai ✓"
      : "Simpan & Lanjutkan →";
  }
  if (doubtBtn) {
    const isDoubt = Boolean(doubtFlags[currentIndex]);
    doubtBtn.className = isDoubt
      ? "px-4 py-2 rounded-xl bg-amber-400 border border-amber-500 text-slate-950 text-sm font-extrabold"
      : "px-4 py-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-sm font-semibold hover:bg-amber-200";
  }

  renderQuestionNavGrid();
  saveExamSessionState();
}

function renderQuestionNavGrid() {
  const gridEl = document.getElementById("questionGrid");
  const counterEl = document.getElementById("answeredCounter");
  if (!gridEl) return;

  const answeredTotal = userAnswers.filter(a => a !== null && a !== undefined && a >= 0).length;
  if (counterEl) {
    counterEl.textContent = `${answeredTotal} / ${examQuestions.length} Dijawab`;
  }

  gridEl.replaceChildren();
  examQuestions.forEach((q, idx) => {
    const sub = String(q.subtest || "TWK").toUpperCase();
    if (examActiveFilter !== "ALL" && sub !== examActiveFilter) return;

    const isCurrent = idx === currentIndex;
    const isDoubt = Boolean(doubtFlags[idx]);
    const isAnswered = userAnswers[idx] !== null && userAnswers[idx] !== undefined && userAnswers[idx] >= 0;

    let colorCls = "bg-rose-500 text-white hover:bg-rose-600";
    if (isDoubt) {
      colorCls = "bg-amber-400 text-slate-950 hover:bg-amber-500";
    } else if (isAnswered) {
      colorCls = "bg-emerald-500 text-white hover:bg-emerald-600";
    }

    const activeRing = isCurrent ? " ring-2 ring-blue-600 ring-offset-1" : "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `h-9 rounded-lg text-xs font-extrabold transition ${colorCls}${activeRing}`;
    btn.textContent = String(idx + 1);
    btn.onclick = () => jumpToQuestion(idx);
    gridEl.appendChild(btn);
  });
}

function filterNav(filterVal) {
  examActiveFilter = filterVal || "ALL";
  document.querySelectorAll(".nav-filter-btn").forEach(btn => {
    const active = btn.dataset.filter === examActiveFilter;
    btn.className = active
      ? "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white"
      : "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700";
  });
  renderQuestionNavGrid();
}

function selectOption(optionIdx) {
  if (!isExamActive) return;
  userAnswers[currentIndex] = Number(optionIdx);
  renderExamQuestion();
}

function toggleDoubt() {
  if (!isExamActive) return;
  doubtFlags[currentIndex] = !doubtFlags[currentIndex];
  renderExamQuestion();
}

function prevQuestion() {
  if (!isExamActive) return;
  recordCurrentQuestionDuration();
  if (currentIndex > 0) {
    currentIndex--;
    renderExamQuestion();
  }
}

function saveAndNext() {
  if (!isExamActive) return;
  recordCurrentQuestionDuration();
  if (currentIndex < examQuestions.length - 1) {
    currentIndex++;
    renderExamQuestion();
  } else {
    confirmFinishExam();
  }
}

function jumpToQuestion(targetIdx) {
  if (!isExamActive) return;
  if (targetIdx < 0 || targetIdx >= examQuestions.length) return;
  recordCurrentQuestionDuration();
  currentIndex = targetIdx;
  renderExamQuestion();
}

function confirmFinishExam() {
  if (!isExamActive) return;
  const answeredTotal = userAnswers.filter(a => a !== null && a !== undefined && a >= 0).length;
  const doubtTotal = doubtFlags.filter(Boolean).length;
  const unansweredTotal = examQuestions.length - answeredTotal;

  const msg =
    `Selesaikan ujian sekarang?\n` +
    `• Terjawab: ${answeredTotal} / ${examQuestions.length} soal\n` +
    `• Belum terjawab: ${unansweredTotal} soal\n` +
    `• Ditandai Ragu-Ragu: ${doubtTotal} soal`;

  if (confirm(msg)) {
    finishExam(false);
  }
}

function computeExamScores(questionsList, answersList) {
  let twk = 0;
  let tiu = 0;
  let tkp = 0;

  (questionsList || []).forEach((q, idx) => {
    const ans = Array.isArray(answersList) ? answersList[idx] : null;
    const pts = getQuestionScoreForAnswer(q, ans);
    const sub = String(q.subtest || "TWK").toUpperCase();
    if (sub === "TWK") twk += pts;
    else if (sub === "TIU") tiu += pts;
    else if (sub === "TKP") tkp += pts;
  });

  const total = twk + tiu + tkp;
  const hasTwk = (questionsList || []).some(q => String(q.subtest || "").toUpperCase() === "TWK");
  const hasTiu = (questionsList || []).some(q => String(q.subtest || "").toUpperCase() === "TIU");
  const hasTkp = (questionsList || []).some(q => String(q.subtest || "").toUpperCase() === "TKP");

  const passTwk = !hasTwk || twk >= 65;
  const passTiu = !hasTiu || tiu >= 80;
  const passTkp = !hasTkp || tkp >= 166;
  const statusPg = passTwk && passTiu && passTkp ? "LULUS PG" : "TIDAK LULUS PG";

  return { twk, tiu, tkp, total, passTwk, passTiu, passTkp, statusPg };
}

async function sendScoreToGoogleSheet(payload) {
  const statusTextEl = document.getElementById("sheetSyncText");
  const retryBtn = document.getElementById("retrySyncBtn");
  const endpoint = typeof GOOGLE_SCRIPT_URL !== "undefined" ? String(GOOGLE_SCRIPT_URL || "").trim() : "";

  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (statusTextEl) statusTextEl.textContent = "Mode Lokal: Hasil tersimpan di browser (GOOGLE_SCRIPT_URL belum diatur).";
    if (retryBtn) retryBtn.classList.add("hidden");
    return;
  }

  if (statusTextEl) statusTextEl.textContent = "Mengirim rekap skor ke Google Sheets...";
  if (retryBtn) retryBtn.classList.add("hidden");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json && json.status === "sukses") {
      if (statusTextEl) statusTextEl.textContent = "Tersimpan ke Google Sheets (RekapSkor).";
      if (retryBtn) retryBtn.classList.add("hidden");
    } else {
      if (statusTextEl) statusTextEl.textContent = "Gagal mengirim ke Sheet: " + ((json && json.pesan) || "respons tidak sesuai.");
      if (retryBtn) retryBtn.classList.remove("hidden");
    }
  } catch (err) {
    if (statusTextEl) statusTextEl.textContent = "Belum terkirim ke Google Sheets (cek koneksi atau deployment Web App).";
    if (retryBtn) retryBtn.classList.remove("hidden");
  }
}

async function retrySendToSheet() {
  if (!lastExamPayload) return;
  await sendScoreToGoogleSheet(lastExamPayload);
}

function finishExam(isAutoTimeout = false) {
  if (!isExamActive) return;
  recordCurrentQuestionDuration();
  isExamActive = false;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearExamSessionState();

  if (typeof resetPostExamSurveySessionState_ === "function") {
    resetPostExamSurveySessionState_();
  }

  const scoreRes = computeExamScores(examQuestions, userAnswers);
  const anomalies = typeof checkInputAnomalyPreview === "function"
    ? checkInputAnomalyPreview(participantName, appliedFormation, appliedInstitution)
    : [];
  const warningText = anomalies.length > 0 ? anomalies.join("; ") : (isAutoTimeout ? "Waktu Habis" : "Normal");

  const nowIso = new Date().toISOString();
  const attemptRecord = {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nama: participantName,
    username: loggedUser?.username || "",
    pendidikan: participantEducation || "-",
    formasi: appliedFormation || "-",
    instansi: appliedInstitution || "-",
    mode: examModeLabel,
    twk: scoreRes.twk,
    tiu: scoreRes.tiu,
    tkp: scoreRes.tkp,
    total: scoreRes.total,
    status_pg: scoreRes.statusPg,
    warning: warningText,
    waktu: nowIso,
    waktuLabel: typeof formatShortDate === "function" ? formatShortDate(nowIso) : nowIso,
    questions: examQuestions.map(q => ({ ...q })),
    answers: [...userAnswers],
    durations: [...questionDurations],
    doubts: [...doubtFlags]
  };

  if (typeof saveAttemptToHistory === "function") {
    saveAttemptToHistory(attemptRecord);
  }

  lastExamPayload = {
    nama: participantName,
    pendidikan_terakhir: participantEducation || "-",
    formasi: appliedFormation || "-",
    instansi: appliedInstitution || "-",
    mode: examModeLabel,
    twk: scoreRes.twk,
    tiu: scoreRes.tiu,
    tkp: scoreRes.tkp,
    total: scoreRes.total,
    status_pg: scoreRes.statusPg,
    perangkat: navigator.userAgent || "-",
    ip_address: "-",
    warning: warningText
  };

  reviewQuestions = attemptRecord.questions;
  reviewAnswers = attemptRecord.answers;
  reviewDurations = attemptRecord.durations;
  reviewDoubts = attemptRecord.doubts;
  reviewMetaLabel = `${participantName} • ${examModeLabel} • Skor ${scoreRes.total}`;
  reviewOnlyWeakMode = false;

  const titleEl = document.getElementById("resultParticipantTitle");
  const formEl = document.getElementById("resultFormationInfo");
  const metaEl = document.getElementById("resultMetaInfo");
  const totalEl = document.getElementById("totalScoreDisplay");
  const badgeEl = document.getElementById("resultStatusBadge");
  const bannerEl = document.getElementById("resultBanner");
  const anonAlert = document.getElementById("userAnomalyAlert");
  const anonDetail = document.getElementById("userAnomalyDetail");

  if (titleEl) titleEl.textContent = `Hasil Simulasi — ${participantName}`;
  if (formEl) {
    formEl.textContent = `Formasi: ${appliedFormation || "-"} • Instansi: ${appliedInstitution || "-"} • Pendidikan: ${participantEducation || "-"}`;
  }
  if (metaEl) {
    metaEl.textContent = `Mode: ${examModeLabel} • ${isAutoTimeout ? "Selesai otomatis (waktu habis)" : "Disubmit peserta"} • ${attemptRecord.waktuLabel}`;
  }
  if (totalEl) totalEl.textContent = String(scoreRes.total);

  const isPass = scoreRes.statusPg === "LULUS PG";
  if (badgeEl) {
    badgeEl.textContent = scoreRes.statusPg;
    badgeEl.className = isPass
      ? "inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-emerald-500 text-white"
      : "inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-rose-500 text-white";
  }
  if (bannerEl) {
    bannerEl.className = isPass
      ? "p-6 sm:p-8 text-white bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 flex flex-wrap items-center justify-between gap-4"
      : "p-6 sm:p-8 text-white bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex flex-wrap items-center justify-between gap-4";
  }

  const setSubtestScoreUI = (valId, badgeId, scoreVal, passed) => {
    const vEl = document.getElementById(valId);
    const bEl = document.getElementById(badgeId);
    if (vEl) vEl.textContent = String(scoreVal);
    if (bEl) {
      bEl.textContent = passed ? "MEMENUHI PG" : "BELUM MEMENUHI PG";
      bEl.className = passed
        ? "text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800"
        : "text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800";
    }
  };

  setSubtestScoreUI("twkScoreVal", "twkPassBadge", scoreRes.twk, scoreRes.passTwk);
  setSubtestScoreUI("tiuScoreVal", "tiuPassBadge", scoreRes.tiu, scoreRes.passTiu);
  setSubtestScoreUI("tkpScoreVal", "tkpPassBadge", scoreRes.tkp, scoreRes.passTkp);

  if (anonAlert && anonDetail) {
    if (anomalies.length > 0) {
      anonDetail.textContent = anomalies.join(" • ");
      anonAlert.classList.remove("hidden");
    } else {
      anonAlert.classList.add("hidden");
      anonDetail.textContent = "";
    }
  }

  const postSurveyCard = document.getElementById("postExamSurveyDonationCard");
  if (postSurveyCard) postSurveyCard.classList.remove("hidden");

  showScreen("result");
  if (typeof renderTimeAnalysisOnResult === "function") {
    renderTimeAnalysisOnResult();
  }
  sendScoreToGoogleSheet(lastExamPayload);
}

function startExam() {
  if (isExamActive) return;

  const nameInput = document.getElementById("participantNameInput");
  const eduSelect = document.getElementById("participantEducationSelect");
  const formInput = document.getElementById("appliedFormationInput");
  const instInput = document.getElementById("appliedInstitutionInput");
  const durSelect = document.getElementById("durationSelect");
  const orderSelect = document.getElementById("orderSelect");
  const focusSelect = document.getElementById("subtestFocusSelect");

  if (formInput && typeof applyAutoCapitalizeToInput === "function") {
    applyAutoCapitalizeToInput(formInput, true);
  }
  if (instInput && typeof applyAutoCapitalizeToInput === "function") {
    applyAutoCapitalizeToInput(instInput, true);
  }

  const nameVal = (nameInput?.value || loggedUser?.nama || "").trim();
  const eduVal = (eduSelect?.value || loggedUser?.pendidikan || "").trim();
  const formVal = (formInput?.value || "").trim();
  const instVal = (instInput?.value || "").trim();
  const durMinutes = Number(durSelect?.value || 100);
  const orderVal = orderSelect?.value || "standard";
  const focusVal = focusSelect?.value || "ALL";

  if (!nameVal) {
    alert("Silakan login atau daftar akun peserta terlebih dahulu sebelum memulai ujian.");
    return;
  }
  if (typeof findProfanityInName === "function" && findProfanityInName(nameVal).length > 0) {
    alert("Nama peserta mengandung kata yang tidak sopan.");
    return;
  }
  if (!eduVal) {
    alert("Pilih Pendidikan Terakhir terlebih dahulu.");
    if (eduSelect) eduSelect.focus();
    return;
  }
  if (!formVal) {
    alert("Isi Formasi yang Dilamar terlebih dahulu.");
    if (formInput) formInput.focus();
    return;
  }
  if (typeof findProfanityInName === "function" && findProfanityInName(formVal).length > 0) {
    alert("Formasi yang dilamar mengandung kata yang tidak sopan.");
    return;
  }
  if (!instVal) {
    alert("Isi Instansi yang Dilamar terlebih dahulu.");
    if (instInput) instInput.focus();
    return;
  }
  if (typeof findProfanityInName === "function" && findProfanityInName(instVal).length > 0) {
    alert("Instansi yang dilamar mengandung kata yang tidak sopan.");
    return;
  }

  const built = buildExamQuestionSet(focusVal, orderVal);
  if (!built.length) {
    alert("Bank soal belum tersedia. Silakan muat ulang halaman.");
    return;
  }

  participantName = nameVal;
  participantEducation = eduVal;
  appliedFormation = formVal;
  appliedInstitution = instVal;

  const focusLabel = focusVal === "ALL" ? "Paket Lengkap" : `Fokus ${focusVal}`;
  const pathLabel = durMinutes === 130 ? "Netra" : "Reguler";
  examModeLabel = `${pathLabel} • ${focusLabel} (${durMinutes} Menit)`;

  examQuestions = built;
  userAnswers = new Array(examQuestions.length).fill(null);
  doubtFlags = new Array(examQuestions.length).fill(false);
  questionDurations = new Array(examQuestions.length).fill(0);
  currentIndex = 0;
  examActiveFilter = "ALL";
  examStartedAt = Date.now();
  remainingSeconds = durMinutes * 60;
  examEndTime = examStartedAt + remainingSeconds * 1000;
  isExamActive = true;

  const hpName = document.getElementById("headerParticipantName");
  const hpMode = document.getElementById("headerExamMode");
  if (hpName) hpName.textContent = participantName;
  if (hpMode) hpMode.textContent = examModeLabel;

  document.querySelectorAll(".nav-filter-btn").forEach(btn => {
    const active = btn.dataset.filter === "ALL";
    btn.className = active
      ? "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white"
      : "nav-filter-btn flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700";
  });

  showScreen("exam");
  startTimerLoop();
  renderExamQuestion();
}

function resetAndRestartFromSetup() {
  if (isExamActive) return;
  if (typeof requireSurveyBeforeAction === "function" && !requireSurveyBeforeAction("memulai simulasi baru")) {
    return;
  }
  const revSec = document.getElementById("reviewSection");
  if (revSec) revSec.classList.add("hidden");
  showScreen("setup");
}

function retryWrongAndDoubtQuestions() {
  if (isExamActive) return;
  if (typeof requireSurveyBeforeAction === "function" && !requireSurveyBeforeAction("mengulangi soal salah & ragu")) {
    return;
  }

  const srcQs = Array.isArray(reviewQuestions) && reviewQuestions.length ? reviewQuestions : examQuestions;
  const srcAns = Array.isArray(reviewAnswers) && reviewAnswers.length ? reviewAnswers : userAnswers;
  const srcDoubt = Array.isArray(reviewDoubts) && reviewDoubts.length ? reviewDoubts : doubtFlags;

  if (!Array.isArray(srcQs) || !srcQs.length) {
    alert("Belum ada data soal dari sesi sebelumnya untuk diulangi.");
    return;
  }

  const targetIndices = [];
  srcQs.forEach((q, idx) => {
    const ans = srcAns[idx];
    const isDoubt = Boolean(srcDoubt[idx]);
    const sub = String(q.subtest || "TWK").toUpperCase();
    let isWeak = ans === null || ans === undefined || ans < 0;

    if (!isWeak) {
      if (sub === "TKP") {
        const scores = Array.isArray(q.scores) ? q.scores : [1, 2, 3, 4, 5];
        const maxPt = Math.max(...scores.map(Number));
        isWeak = Number(scores[ans] || 0) < maxPt;
      } else {
        isWeak = Number(ans) !== Number(q.answer);
      }
    }

    if (isDoubt || isWeak) {
      targetIndices.push(idx);
    }
  });

  if (targetIndices.length === 0) {
    alert("Hebat! Tidak ada soal salah maupun ragu-ragu pada sesi ini.");
    return;
  }

  examQuestions = targetIndices.map(idx => ({
    ...srcQs[idx],
    options: Array.isArray(srcQs[idx].options) ? [...srcQs[idx].options] : []
  }));
  userAnswers = new Array(examQuestions.length).fill(null);
  doubtFlags = new Array(examQuestions.length).fill(false);
  questionDurations = new Array(examQuestions.length).fill(0);
  currentIndex = 0;
  examActiveFilter = "ALL";
  examStartedAt = Date.now();

  const durMinutes = Math.max(15, Math.ceil(examQuestions.length * 1.0));
  remainingSeconds = durMinutes * 60;
  examEndTime = examStartedAt + remainingSeconds * 1000;
  examModeLabel = `Ulangi Salah & Ragu (${examQuestions.length} Soal • ${durMinutes} Menit)`;
  isExamActive = true;

  const hpName = document.getElementById("headerParticipantName");
  const hpMode = document.getElementById("headerExamMode");
  if (hpName) hpName.textContent = participantName || (typeof getActiveUserFilterName === "function" ? getActiveUserFilterName() : "") || "Peserta";
  if (hpMode) hpMode.textContent = examModeLabel;

  const revSec = document.getElementById("reviewSection");
  if (revSec) revSec.classList.add("hidden");

  showScreen("exam");
  startTimerLoop();
  renderExamQuestion();
}

function populateReviewCategoryFilter(qsList) {
  const sel = document.getElementById("reviewCategoryFilter");
  if (!sel) return;
  const prevVal = sel.value || "ALL";
  const cats = Array.from(
    new Set((qsList || []).map(q => String(q.category || "Umum").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "id"));

  sel.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Semua Kategori";
  sel.appendChild(allOpt);

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });

  sel.value = cats.includes(prevVal) ? prevVal : "ALL";
}

function updateWeakFilterButtonUI() {
  const btn = document.getElementById("reviewOnlyWeakBtn");
  if (!btn) return;
  btn.className = reviewOnlyWeakMode
    ? "px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white border border-rose-700"
    : "px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100";
}

function toggleReviewWeakOnly() {
  reviewOnlyWeakMode = !reviewOnlyWeakMode;
  updateWeakFilterButtonUI();
  const activeSub = document.querySelector(".review-subtest-btn.active-subtest")?.dataset.subtest || "ALL";
  renderReview(activeSub);
}

function toggleReviewFavoriteOnly() {
  alert("Filter favorit belum diaktifkan pada sesi ini.");
}

function toggleReviewSection() {
  const sec = document.getElementById("reviewSection");
  if (!sec) return;
  const isHidden = sec.classList.contains("hidden");

  if (
    isHidden &&
    typeof requireSurveyBeforeAction === "function" &&
    !requireSurveyBeforeAction("membuka kunci jawaban & pembahasan")
  ) {
    return;
  }

  if (typeof setBackToDashboardButtonVisible === "function") {
    setBackToDashboardButtonVisible(false);
  }

  if (!Array.isArray(reviewQuestions) || reviewQuestions.length === 0) {
    reviewQuestions = Array.isArray(questionBank) && questionBank.length
      ? questionBank.map(q => ({ ...q }))
      : buildDefaultQuestionBank();
    reviewAnswers = [];
    reviewDurations = [];
    reviewDoubts = [];
    reviewMetaLabel = "Kunci Jawaban & Pembahasan Bank Soal";
  }

  if (isHidden) {
    sec.classList.remove("hidden");
    const titleEl = document.getElementById("reviewSectionTitle");
    const subEl = document.getElementById("reviewSessionSubtitle");
    if (titleEl) titleEl.textContent = "Pembahasan Lengkap Soal SKD";
    if (subEl) subEl.textContent = reviewMetaLabel;
    populateReviewCategoryFilter(reviewQuestions);
    updateWeakFilterButtonUI();
    renderReview("ALL");
    sec.scrollIntoView({ behavior: "smooth" });
  } else {
    sec.classList.add("hidden");
  }
}

function renderReview(subtestFilter = "ALL") {
  const listEl = document.getElementById("reviewList");
  const statsEl = document.getElementById("reviewSubtestStats");
  const catFilterEl = document.getElementById("reviewCategoryFilter");
  if (!listEl) return;

  const subFilter = String(subtestFilter || "ALL").toUpperCase();
  const catFilter = catFilterEl?.value || "ALL";

  document.querySelectorAll(".review-subtest-btn").forEach(btn => {
    const isActive = String(btn.dataset.subtest || "").toUpperCase() === subFilter;
    btn.classList.toggle("active-subtest", isActive);
    btn.className = isActive
      ? "review-subtest-btn active-subtest px-3 py-1 text-xs font-bold rounded-lg bg-slate-800 text-white"
      : "review-subtest-btn px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700";
  });

  if (statsEl) {
    const sc = computeExamScores(reviewQuestions, reviewAnswers);
    statsEl.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5"><strong>TWK:</strong> ${sc.twk} / 150 (PG 65)</div>
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5"><strong>TIU:</strong> ${sc.tiu} / 175 (PG 80)</div>
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5"><strong>TKP:</strong> ${sc.tkp} / 225 (PG 166)</div>
    `;
  }

  const letters = ["A", "B", "C", "D", "E"];
  listEl.replaceChildren();

  let renderedCount = 0;

  (reviewQuestions || []).forEach((q, idx) => {
    const sub = String(q.subtest || "TWK").toUpperCase();
    const cat = String(q.category || "Umum").trim();
    const ans = Array.isArray(reviewAnswers) ? reviewAnswers[idx] : null;
    const durSec = Math.round(Number((Array.isArray(reviewDurations) ? reviewDurations[idx] : 0) || 0));

    if (subFilter !== "ALL" && sub !== subFilter) return;
    if (catFilter !== "ALL" && cat !== catFilter) return;

    let isCorrectOrMax = false;
    let ptsEarned = 0;

    if (ans !== null && ans !== undefined && ans >= 0) {
      ptsEarned = getQuestionScoreForAnswer(q, ans);
      if (sub === "TKP") {
        const scores = Array.isArray(q.scores) ? q.scores : [1, 2, 3, 4, 5];
        const maxPt = Math.max(...scores.map(Number));
        isCorrectOrMax = ptsEarned >= maxPt;
      } else {
        isCorrectOrMax = Number(ans) === Number(q.answer);
      }
    }

    if (reviewOnlyWeakMode && isCorrectOrMax) return;

    renderedCount++;
    const card = document.createElement("div");
    card.className = "border border-slate-200 rounded-xl p-4 space-y-2.5 bg-slate-50/50";

    const header = document.createElement("div");
    header.className = "flex flex-wrap items-center justify-between gap-2 text-xs";
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-extrabold text-slate-800">Soal No. ${idx + 1}</span>
        <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">${escapeHtml(sub)}</span>
        <span class="text-slate-500 font-medium">${escapeHtml(cat)}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-slate-500 font-mono">${durSec} dtk</span>
        <span class="px-2 py-0.5 rounded font-bold ${isCorrectOrMax ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}">
          Poin: ${ptsEarned}
        </span>
      </div>
    `;

    const prompt = document.createElement("div");
    prompt.className = "text-sm font-semibold text-slate-800 whitespace-pre-line";
    prompt.textContent = q.question || "";

    const optsBox = document.createElement("div");
    optsBox.className = "space-y-1.5 text-xs";
    (q.options || []).forEach((optText, oIdx) => {
      const isUserPick = Number(ans) === oIdx;
      const isKey = sub !== "TKP" && Number(q.answer) === oIdx;
      const tkpPt = sub === "TKP" ? Number((q.scores || [])[oIdx] || 0) : null;

      let rowCls = "bg-white border border-slate-200 text-slate-700";
      if (isKey || (sub === "TKP" && tkpPt === 5)) {
        rowCls = "bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold";
      } else if (isUserPick && !isKey && sub !== "TKP") {
        rowCls = "bg-rose-50 border border-rose-300 text-rose-900 font-semibold";
      }

      const row = document.createElement("div");
      row.className = `px-3 py-2 rounded-lg flex items-center justify-between gap-2 ${rowCls}`;
      const ptSuffix = tkpPt !== null ? ` (Poin ${tkpPt})` : (isKey ? " (Kunci)" : "");
      const pickSuffix = isUserPick ? " • Jawaban Anda" : "";
      row.innerHTML = `<span><strong>${letters[oIdx] || oIdx + 1}.</strong> ${escapeHtml(optText || "")}</span><span class="text-[11px] shrink-0">${escapeHtml(ptSuffix + pickSuffix)}</span>`;
      optsBox.appendChild(row);
    });

    const expBox = document.createElement("div");
    expBox.className = "bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed";
    expBox.innerHTML = `<strong class="text-blue-900">Pembahasan:</strong> ${escapeHtml(q.explanation || "Pembahasan belum tersedia untuk soal ini.")}`;

    card.append(header, prompt, optsBox, expBox);
    listEl.appendChild(card);
  });

  if (renderedCount === 0) {
    const empty = document.createElement("div");
    empty.className = "text-center text-xs text-slate-500 py-6";
    empty.textContent = "Tidak ada soal yang cocok dengan filter review saat ini.";
    listEl.appendChild(empty);
  }
}

function togglePostExamSurveyForm(forceOpen = false) {
  const form = document.getElementById("postExamSurveyForm");
  if (!form) return;
  if (forceOpen) {
    form.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("surveyFeedbackInput")?.focus();
  } else {
    form.classList.toggle("hidden");
  }
}

function dismissPostExamPrompt() {
  const card = document.getElementById("postExamSurveyDonationCard");
  const bar = document.getElementById("reopenSurveyDonationBar");
  if (card) card.classList.add("hidden");
  if (bar) bar.classList.remove("hidden");
}

function reopenPostExamPrompt(showForm = false) {
  const card = document.getElementById("postExamSurveyDonationCard");
  const bar = document.getElementById("reopenSurveyDonationBar");
  const form = document.getElementById("postExamSurveyForm");
  if (card) card.classList.remove("hidden");
  if (bar) bar.classList.add("hidden");
  if (showForm && form) form.classList.remove("hidden");
}

async function submitPostExamSurvey(event) {
  if (event) event.preventDefault();

  const feedbackEl = document.getElementById("surveyFeedbackInput");
  const contactEl = document.getElementById("surveyContactInput");
  const statusEl = document.getElementById("postExamSurveyStatus");
  const submitBtn = document.getElementById("submitSurveyBtn");

  const feedbackText = (feedbackEl?.value || "").trim();
  const contactText = (contactEl?.value || "").trim();

  if (feedbackText.length < 4) {
    if (statusEl) {
      statusEl.textContent = "Tuliskan saran atau masukan minimal 4 karakter.";
      statusEl.className = "text-xs font-semibold text-rose-600";
      statusEl.classList.remove("hidden");
    }
    return;
  }

  const uVals = [
    Number(document.getElementById("postSkmU1")?.value || 3),
    Number(document.getElementById("postSkmU2")?.value || 3),
    Number(document.getElementById("postSkmU3")?.value || 3),
    Number(document.getElementById("postSkmU4")?.value || 3),
    Number(document.getElementById("postSkmU5")?.value || 3),
    Number(document.getElementById("postSkmU6")?.value || 3),
    Number(document.getElementById("postSkmU7")?.value || 3),
    Number(document.getElementById("postSkmU8")?.value || 3),
    Number(document.getElementById("postSkmU9")?.value || 3)
  ];

  const avgNrr = Number((uVals.reduce((a, b) => a + b, 0) / 9).toFixed(2));
  const ikmVal = Number((avgNrr * 25).toFixed(2));
  const reporter = participantName || loggedUser?.nama || "Peserta Ujian";

  if (typeof saveSurveyToLocalHistory === "function") {
    saveSurveyToLocalHistory({
      id: `skm_post_${Date.now()}`,
      waktu: new Date().toISOString(),
      nama: reporter,
      kontak: contactText || "-",
      unsur: uVals,
      nrr: avgNrr,
      ikm: ikmVal,
      catatan: feedbackText
    });
  }
  if (typeof renderDashboardSurveySummary === "function") {
    renderDashboardSurveySummary();
  }
  if (typeof markPostExamSurveyCompleted_ === "function") {
    markPostExamSurveyCompleted_();
  }

  const endpoint = typeof GOOGLE_SCRIPT_URL !== "undefined" ? String(GOOGLE_SCRIPT_URL || "").trim() : "";
  const summaryMeta =
    `U1:${uVals[0]} | U2:${uVals[1]} | U3:${uVals[2]} | U4:${uVals[3]} | U5:${uVals[4]} | ` +
    `U6:${uVals[5]} | U7:${uVals[6]} | U8:${uVals[7]} | U9:${uVals[8]} ` +
    `(NRR:${avgNrr}/4, IKM:${ikmVal}) • Kontak:${contactText || "-"} • Mode:${examModeLabel}`;

  if (!endpoint || endpoint.includes("TEMPEL_URL")) {
    if (feedbackEl) feedbackEl.value = "";
    if (statusEl) {
      statusEl.textContent = `Terima kasih ${reporter} (NRR ${avgNrr}/4 • IKM ${ikmVal}). Survei 9 unsur tersimpan lokal; review soal sudah terbuka.`;
      statusEl.className = "text-xs font-semibold text-emerald-700";
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
        action: "report_question",
        nomor_soal: 0,
        subtest: "SURVEI_SKM_9",
        category: "Survei SKM 9 Unsur (Pasca Ujian)",
        question: summaryMeta.slice(0, 450),
        catatan: feedbackText,
        pelapor: reporter
      })
    });
    const json = await res.json();
    if (statusEl) {
      if (json && json.status === "sukses") {
        if (feedbackEl) feedbackEl.value = "";
        statusEl.textContent = `Terima kasih! Survei 9 unsur SKM (NRR ${avgNrr}/4 • IKM ${ikmVal}) terkirim ke Google Sheets; pembahasan soal kini bisa dibuka.`;
        statusEl.className = "text-xs font-semibold text-emerald-700";
      } else {
        statusEl.textContent = "Survei tersimpan lokal, namun belum terkonfirmasi server: " + ((json && json.pesan) || "coba lagi.");
        statusEl.className = "text-xs font-semibold text-amber-700";
      }
      statusEl.classList.remove("hidden");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = `Survei tersimpan lokal (NRR ${avgNrr}/4 • IKM ${ikmVal}), namun gagal mengirim ke server. Periksa koneksi internet.`;
      statusEl.className = "text-xs font-semibold text-amber-700";
      statusEl.classList.remove("hidden");
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Survei SKM";
    }
  }
}

function initializeAppOnLoad() {
  if (typeof updateQuestionStatsUI === "function") {
    updateQuestionStatsUI("Sumber Soal: Bank Soal Bawaan (110 soal unik)");
  }
  if (typeof bindInstitutionAutoCapitalize === "function") {
    bindInstitutionAutoCapitalize();
  }
  if (typeof loadLoggedUserFromStorage === "function") {
    loadLoggedUserFromStorage();
  }
  if (typeof applyLoggedUserToUI === "function") {
    applyLoggedUserToUI();
  }
  if (typeof updateRestoreHistoryButtons === "function") {
    updateRestoreHistoryButtons();
  }
  if (typeof muatBankSoalDariSheet === "function") {
    muatBankSoalDariSheet();
  }

  try {
    const rawSession = localStorage.getItem(examSessionStorageKey);
    if (rawSession) {
      const saved = JSON.parse(rawSession);
      const nowMs = Date.now();
      if (
        saved &&
        Array.isArray(saved.examQuestions) &&
        saved.examQuestions.length > 0 &&
        Number(saved.examEndTime || 0) > nowMs
      ) {
        if (confirm("Ditemukan sesi ujian yang belum selesai di browser ini. Lanjutkan ujian yang tersimpan?")) {
          examQuestions = saved.examQuestions;
          userAnswers = Array.isArray(saved.userAnswers) ? saved.userAnswers : new Array(examQuestions.length).fill(null);
          doubtFlags = Array.isArray(saved.doubtFlags) ? saved.doubtFlags : new Array(examQuestions.length).fill(false);
          questionDurations = Array.isArray(saved.questionDurations) ? saved.questionDurations : new Array(examQuestions.length).fill(0);
          currentIndex = Number(saved.currentIndex || 0);
          examActiveFilter = saved.examActiveFilter || "ALL";
          examEndTime = Number(saved.examEndTime);
          remainingSeconds = Math.max(1, Math.round((examEndTime - nowMs) / 1000));
          participantName = saved.participantName || loggedUser?.nama || "Peserta";
          participantEducation = saved.participantEducation || loggedUser?.pendidikan || "-";
          appliedFormation = saved.appliedFormation || "-";
          appliedInstitution = saved.appliedInstitution || "-";
          examModeLabel = saved.examModeLabel || "Reguler (100 Menit)";
          examStartedAt = Number(saved.examStartedAt || nowMs);
          isExamActive = true;

          const hpName = document.getElementById("headerParticipantName");
          const hpMode = document.getElementById("headerExamMode");
          if (hpName) hpName.textContent = participantName;
          if (hpMode) hpMode.textContent = examModeLabel;

          showScreen("exam");
          startTimerLoop();
          renderExamQuestion();
          return;
        } else {
          clearExamSessionState();
        }
      } else {
        clearExamSessionState();
      }
    }
  } catch (err) {
    clearExamSessionState();
  }

  showScreen("setup");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAppOnLoad);
} else {
  initializeAppOnLoad();
}
