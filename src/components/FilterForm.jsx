import React from "react";

export const MEDIA_TYPE_OPTIONS = [
  { value: "all", label: "All media" },
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
];

export const DEFAULT_FORM = {
  channelUrls: "https://t.me/s/telegram",
  maxPostsPerChannel: 100,
  maxMediaItems: 100,
  mediaTypes: ["all"],
  startDate: "",
  endDate: "",
};

export default function FilterForm({ form, onChange }) {
  const setField = (field) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    onChange({ ...form, [field]: value });
  };

  const toggleMediaType = (value) => {
    const current = form.mediaTypes.includes(value) ? form.mediaTypes.filter((t) => t !== value) : [...form.mediaTypes, value];
    onChange({ ...form, mediaTypes: current.length ? current : ["all"] });
  };

  return (
    <div className="card">
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="channelUrls">Channel URLs</label>
          <textarea id="channelUrls" name="channelUrls" value={form.channelUrls} onChange={setField("channelUrls")} placeholder={"https://t.me/s/telegram\nhttps://t.me/otherchannel"} />
          <span className="hint">One URL per line. Public channel links like https://t.me/s/username.</span>
        </div>

        <div className="field">
          <label htmlFor="maxPostsPerChannel">Max posts per channel</label>
          <input id="maxPostsPerChannel" name="maxPostsPerChannel" type="number" min={1} value={form.maxPostsPerChannel} onChange={setField("maxPostsPerChannel")} />
        </div>

        <div className="field">
          <label htmlFor="maxMediaItems">Max media items</label>
          <input id="maxMediaItems" name="maxMediaItems" type="number" min={1} value={form.maxMediaItems} onChange={setField("maxMediaItems")} />
        </div>

        <div className="field">
          <label htmlFor="startDate">Start date (YYYY-MM-DD or DD/MM/YYYY)</label>
          <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={setField("startDate")} />
        </div>

        <div className="field">
          <label htmlFor="endDate">End date (YYYY-MM-DD or DD/MM/YYYY)</label>
          <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={setField("endDate")} />
        </div>
      </div>

      <div className="checks">
        <span className="check">
          <input id="mediaAll" type="checkbox" checked={form.mediaTypes.includes("all")} onChange={() => toggleMediaType("all")} />
          <label htmlFor="mediaAll">All media</label>
        </span>
        {MEDIA_TYPE_OPTIONS.filter((o) => o.value !== "all").map((o) => (
          <span className="check" key={o.value}>
            <input id={`media-${o.value}`} type="checkbox" checked={form.mediaTypes.includes(o.value)} onChange={() => toggleMediaType(o.value)} />
            <label htmlFor={`media-${o.value}`}>{o.label}</label>
          </span>
        ))}
      </div>
    </div>
  );
}
