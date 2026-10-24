import React, { useState } from "react";
import FilterForm, { DEFAULT_FORM } from "./components/FilterForm";
import ResultsTable from "./components/ResultsTable";
import { fetchMedia, itemsToCsv, downloadCsv } from "./lib/api";

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const urls = String(form.channelUrls || "")
        .split(new RegExp("[\\n,;|]"))
        .map((u) => u.trim())
        .filter(Boolean);
      const params = {
        channelUrls: urls,
        maxPostsPerChannel: Number(form.maxPostsPerChannel) || 100,
        maxMediaItems: Number(form.maxMediaItems) || 100,
        mediaTypes: form.mediaTypes && form.mediaTypes.length ? form.mediaTypes : ["all"],
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const result = await fetchMedia(params);
      setItems(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csv = itemsToCsv(items);
    downloadCsv("telegram-media-" + new Date().toISOString().slice(0, 10) + ".csv", csv);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Telegram Media Date Filter</h1>
        <p>Get direct media links from public Telegram posts within an inclusive date range.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <FilterForm form={form} onChange={setForm} />
        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Fetch media"}
          </button>
        </div>
      </form>

      <ResultsTable items={items} loading={loading} error={error} />

      {items && items.length > 0 && (
        <div className="actions">
          <button className="btn secondary" type="button" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
