export async function fetchMedia(params) {
  const res = await fetch("/api/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch media");
  }
  return data.items;
}

const CSV_COLUMNS = [
  "postUrl",
  "mediaType",
  "mediaUrl",
  "thumbnailUrl",
  "channelHandle",
  "authorName",
  "postDate",
  "viewsText",
  "position",
];

export function itemsToCsv(items) {
  const escapeCell = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = CSV_COLUMNS.map(escapeCell).join(",");
  const rows = items.map((item) =>
    CSV_COLUMNS.map((c) => escapeCell(item[c])).join(",")
  );
  return [header, ...rows].join("\r\n");
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
