const CHANNEL_RE = /(?:https?:\/\/)?(?:www\.)?t[.]me\/(?:s\/)?@?([A-Za-z0-9_]+)/i;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function extractHandle(url) {
  if (!url) return null;
  const value = String(url).trim();
  const m = value.match(CHANNEL_RE);
  if (!m) return null;
  const handle = m[1].replace(/^@/, "");
  return handle || null;
}

function parseDate(value) {
  if (value === undefined || value === null || value === "") return null;
  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000Z`)
    : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchChannelPage(handle, beforeId) {
  const url = `https://t.me/s/${handle}${beforeId ? `?before=${encodeURIComponent(beforeId)}` : ""}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 404) return { html: "", hasMore: false };
  if (!res.ok) throw new Error(`Telegram responded with status ${res.status}`);
  const html = await res.text();
  return { html, hasMore: /tme_messages_more/.test(html) };
}

function parseMessages(html) {
  const blocks = [];
  const startTag = '<div class="tgme_widget_message_wrap js-widget_message_wrap">';
  const parts = html.split(startTag);
  for (let i = 1; i < parts.length; i++) {
    const nextIdx = parts[i].indexOf(startTag);
    const blockContent = nextIdx === -1 ? parts[i] : parts[i].slice(0, nextIdx);
    blocks.push(startTag + blockContent);
  }

  return blocks.map((block) => {
    const postMatch = block.match(/data-post="([^"]+)"/);
    const postPath = postMatch ? postMatch[1] : null;
    const parts = postPath ? postPath.split("/") : [];
    const postNum = parts.length > 1 ? parts[1] : null;
    const postChannel = parts.length > 1 ? parts[0] : null;

    const timeMatch = block.match(/<time datetime="([^"]+)"/);
    const date = timeMatch ? new Date(timeMatch[1]) : null;

    const viewsMatch = block.match(/tgme_widget_message_views">([^<]*)</);
    const viewsText = viewsMatch ? viewsMatch[1].trim() : "";

    const authorMatch = block.match(
      /tgme_widget_message_owner_name" href="([^"]+)"><span dir="auto">([^<]*)</
    );

    const videos = Array.from(
      block.matchAll(/<video[^>]*src="([^"]+)"[^>]*>/g),
      (x) => x[1]
    );
    const videoThumbs = Array.from(
      block.matchAll(
        /<i class="tgme_widget_message_video_thumb" style="background-image:url\(['"]?([^'")]+)['"]?\)"/g
      ),
      (x) => x[1]
    );
    const photos = Array.from(
      block.matchAll(
        /<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\(['"]?([^'")]+)['"]?\)"/g
      ),
      (x) => x[1]
    );

    const mediaItems = [];
    if (videos.length > 0) {
      mediaItems.push({
        mediaType: "video",
        mediaUrl: videos[0],
        thumbnailUrl: videoThumbs[0] || videos[0],
        position: 1,
      });
    } else if (photos.length > 0) {
      photos.forEach((url, i) => {
        mediaItems.push({
          mediaType: "photo",
          mediaUrl: url,
          thumbnailUrl: url,
          position: i + 1,
        });
      });
    }

    return {
      postNum,
      postChannel,
      postUrl: postNum ? `https://t.me/${postChannel || ""}/${postNum}` : null,
      date,
      viewsText,
      authorName: authorMatch ? authorMatch[2] : "",
      mediaItems,
    };
  });
}

function normalizeMediaTypes(mediaTypes) {
  const list = Array.isArray(mediaTypes)
    ? mediaTypes.map((t) => String(t).toLowerCase())
    : String(mediaTypes || "all")
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  if (list.length === 0 || list.includes("all")) return "all";
  return Array.from(new Set(list));
}

export async function runFilter({
  channelUrls = [],
  maxPostsPerChannel = 100,
  maxMediaItems = 100,
  mediaTypes = ["all"],
  startDate = null,
  endDate = null,
} = {}) {
  const items = [];
  const errors = [];
  const types = normalizeMediaTypes(mediaTypes);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const maxPosts = Number(maxPostsPerChannel) > 0 ? Number(maxPostsPerChannel) : 100;

  const urls = (Array.isArray(channelUrls) ? channelUrls : [channelUrls])
    .map((u) => String(u).trim())
    .filter(Boolean);

  for (const rawUrl of urls) {
    const handle = extractHandle(rawUrl);
    if (!handle) {
      errors.push(`Invalid channel URL: ${rawUrl}`);
      continue;
    }
    let scanned = 0;
    let beforeId = null;
    let hasMore = true;
    let stopPaging = false;

    try {
      while (hasMore && !stopPaging && scanned < maxPosts) {
        const page = await fetchChannelPage(handle, beforeId);
        if (!page) break;
        const messages = parseMessages(page.html);
        console.error('DEBUG page handle=' + handle + ' beforeId=' + beforeId + ' msgs=' + messages.length);
        let lastPostNum = null;

        for (const msg of messages) {
          if (scanned >= maxPosts) break;
          scanned += 1;
          lastPostNum = msg.postNum;

          if (start && msg.date && msg.date < start) {
            stopPaging = true;
            break;
          }
          if (end && msg.date && msg.date > end) continue;

          console.error('DEBUG msg postNum=' + msg.postNum + ' date=' + (msg.date && msg.date.toISOString()) + ' media=' + msg.mediaItems.length);
          for (const media of msg.mediaItems) {
            if (types !== "all" && !types.includes(media.mediaType)) continue;
            items.push({
              thumbnailUrl: media.thumbnailUrl || null,
              mediaType: media.mediaType,
              mediaUrl: media.mediaUrl,
              postUrl: msg.postUrl,
              channelHandle: `@${handle}`,
              authorName: msg.authorName || handle,
              postDate: msg.date ? msg.date.toISOString() : null,
              viewsText: msg.viewsText || "",
              position: media.position,
            });
          }
        }

        hasMore = page.hasMore;
        beforeId = lastPostNum;
      }
    } catch (err) {
      errors.push(`Failed to fetch @${handle}: ${err.message}`);
    }
  }

  const cap = Number(maxMediaItems) > 0 ? Number(maxMediaItems) : items.length;
  return { items: items.slice(0, cap), errors };
}
