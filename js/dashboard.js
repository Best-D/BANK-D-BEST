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

function renderDashboardSurveySummary() {
  const nrrEl = document.getElementById("dashSurveyAvgNrr");
  const ikmEl = document.getElementById("dashSurveyAvgIkm");
  const catEl = document.getElementById("dashSurveyAvgCategory");
  const countEl = document.getElementById("dashSurveyCountBadge");
  const listEl = document.getElementById("dashSurveyRecentList");
  if (!nrrEl && !ikmEl && !catEl && !countEl && !listEl) return;

  const list = getLocalSurveyHistory();
  const totalCount = list.length;
  const avgNrr = totalCount > 0
    ? Number((list.reduce((sum, item) => sum + Number(item.nrr || 0), 0) / totalCount).toFixed(2))
    : 0;
  const avgIkm = totalCount > 0
    ? Number((list.reduce((sum, item) => sum + Number(item.ikm || 0), 0) / totalCount).toFixed(2))
    : 0;

  if (nrrEl) nrrEl.textContent = totalCount > 0 ? `${avgNrr} / 4,00` : "-";
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
  if (countEl) countEl.textContent = `${totalCount} Responden`;

  if (!listEl) return;
  listEl.replaceChildren();

  if (totalCount === 0) {
    const empty = document.createElement("div");
    empty.className = "text-xs text-slate-500";
    empty.textContent = "Belum ada data survei tersimpan di browser ini. Klik 'Isi Survei SKM' untuk mengirim penilaian.";
    listEl.appendChild(empty);
    return;
  }

  list.slice(0, 5).forEach(item => {
    const qItem = getSurveyQualityCategory_(item.ikm);
    const row = document.createElement("div");
    row.className = "bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2";
    row.innerHTML = `
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-extrabold text-slate-800">
          <span>${safeText(item.nama)}</span>
          <span class="text-blue-700">• NRR ${safeText(item.nrr)}/4 (IKM ${safeText(item.ikm)})</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full ${qItem.badgeCls}">${safeText(qItem.label)}</span>
        </div>
        <div class="text-[11px] text-slate-600 truncate">${safeText(item.catatan)}</div>
        <div class="text-[10px] text-slate-400">${safeText(formatShortDate(item.waktu))}</div>
      </div>
    `;
    listEl.appendChild(row);
  });
}
