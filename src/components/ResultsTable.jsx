import React from "react";

export default function ResultsTable({ items, loading, error }) {
  if (loading) {
    return <div className="card empty">Fetching Telegram media...</div>;
  }
  if (error) {
    return <div className="error-box">{error}</div>;
  }
  if (!items || items.length === 0) {
    return <div className="card empty">No media found for the given filters.</div>;
  }

  return (
    <div className="card">
      <div className="results-meta">
        {items.length} media item{items.length === 1 ? "" : "s"} found
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Post URL</th>
              <th>Post date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={`${item.postUrl}-${idx}`}>
                <td title={item.postText || ""}>{item.postText ? item.postText.slice(0, 200) : "-"}</td>
                <td><a href={item.postUrl}>{item.postUrl}</a></td>
                <td>{item.postDate ? new Date(item.postDate).toISOString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
