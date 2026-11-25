let cachedChatMessages = [];

function normalizeChatUserKey(raw) {
  if (typeof normalizeUsernameKey === "function") {
    return normalizeUsernameKey(raw || "");
  }
  return String(raw || "").trim().replace(/\s+/g, "").toLowerCase();
}

function getCurrentChatUserKey() {
  if (typeof loggedUser !== "undefined" && loggedUser) {
    const raw = loggedUser.username || loggedUser.nama || "";
    return normalizeChatUserKey(raw);
  }
  return "";
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
  panel.scrollIntoView({ behavior: "smooth" });
}

function closeChatPanel() {
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
    empty.textContent = "Belum ada pesan pada percakapan ini. Kirim pesan kapan saja—penerima akan membaca & membalas saat aktif.";
    listEl.appendChild(empty);
    return;
  }

  visible.forEach(msg => {
    const isMine = msg.pengirim_key === myKey;
    const item = document.createElement("div");
    item.className = isMine
      ? "bg-teal-50 border border-teal-200 rounded-lg p-2.5 space-y-1 ml-6"
      : "bg-white border border-slate-200 rounded-lg p-2.5 space-y-1 mr-6";

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

    const body = document.createElement("p");
    body.className = "text-xs text-slate-700 break-words";
    body.textContent = msg.pesan || "";

    item.append(meta, body);
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
      cachedChatMessages = json.chat;
      renderFilteredChatMessages();
      if (fbEl) fbEl.classList.add("hidden");

      if (markRead) {
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

  const senderName = (typeof loggedUser !== "undefined" && loggedUser?.nama) || "Peserta";

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
