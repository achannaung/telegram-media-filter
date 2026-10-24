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
              <th>Thumbnail</th>
              <th>Media type</th>
              <th>Media URL</th>
              <th>Post URL</th>
              <th>Channel</th>
              <th>Author</th>
              <th>Post date</th>
              <th>Views</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={`${item.postUrl}-${idx}`}>
                <td>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" />
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
                <td>{item.mediaType}</td>
                <td>
                  {item.mediaUrl ? <a href={item.mediaUrl}>{item.mediaUrl}</a> : "-"}
                </td>
                <td>
                  {item.postUrl ? <a href={item.postUrl}>{item.postUrl}</a> : "-"}
                </td>
                <td>
                  {item.channelHandle}
                  <br />
                  <span className="muted">{item.authorName}</span>
                </td>
                <td>{item.authorName}</td>
                <td>{item.postDate ? new Date(item.postDate).toISOString() : "-"}</td>
                <td>{item.viewsText}</td>
                <td>{item.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
