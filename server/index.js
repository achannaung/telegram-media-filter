const express = require("express");
const path = require("path");
const { runFilter } = require("./telegram");

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/fetch", async (req, res) => {
  try {
    const { channelUrls, maxPostsPerChannel, maxMediaItems, mediaTypes, startDate, endDate } =
      req.body || {};
    const { items, errors } = await runFilter({
      channelUrls,
      maxPostsPerChannel,
      maxMediaItems,
      mediaTypes,
      startDate,
      endDate,
    });
    res.json({ items, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Telegram Media Date Filter API listening on port ${PORT}`));
