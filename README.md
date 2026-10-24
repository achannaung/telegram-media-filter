# Telegram Media Date Filter

Web app that gets direct media links from public Telegram posts within an inclusive date range.

It parses public Telegram channel pages and returns one item per media file (photo / video) found in posts published between startDate and endDate (inclusive).

## Features

- Multiple public Telegram channel URLs (one per line or comma separated).
- Date range filtering with inclusive boundaries (startDate / endDate, YYYY-MM-DD).
- Media type filtering (all, photo, video, document).
- Limits: maxPostsPerChannel, maxMediaItems.
- Results table with thumbnail, media type, direct media URL, post URL, channel, author, post date, views, position.
- One-click CSV export of the results.

## API

POST /api/fetch

Request body:

{
  "channelUrls": ["https://t.me/s/telegram"],
  "maxPostsPerChannel": 100,
  "maxMediaItems": 100,
  "mediaTypes": ["all"],
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}

Response:

{
  "items": [
    {
      "thumbnailUrl": "https://cdn1.telesco.pe/....jpg",
      "mediaType": "photo",
      "mediaUrl": "https://cdn1.telesco.pe/....jpg",
      "postUrl": "https://t.me/telegram/441",
      "channelHandle": "@telegram",
      "authorName": "Telegram News",
      "postDate": "2026-05-14T16:08:31.000Z",
      "viewsText": "1.6M",
      "position": 1
    }
  ],
  "errors": []
}

## Local development

npm install
npm run dev

- API: http://localhost:3001
- Web: http://localhost:5173 (proxies /api to the API)

## Production build / start

npm run build
npm start

Serves the API and the static frontend on PORT (default 3001).

## Deployment

The repo includes render.yaml for one-click deployment on Render as a Node web service.

- Build command: npm ci && npm run build
- Start command: npm start
- Environment: NODE_VERSION=20, PORT=10000

Deploy steps:

1. Push this folder to a GitHub repository.
2. On Render: New -> Blueprint -> select the repo (or create a Web Service manually with the settings above).
3. Deploy. The service will be available at https://<service-name>.onrender.com.

Why not GitHub Pages / Vercel static-only: the date-range filtering requires a backend that fetches Telegram pages server-side (plus pagination), so a purely static host (GitHub Pages) is not enough. Options:

- Render (recommended): full Node service with Express + static build. See render.yaml.
- Vercel: replace Express with Vercel serverless functions (api/ folder) and keep the Vite build.
- Any Node host: run npm start with NODE_ENV=production.

## Example

{
  "target": "channel",
  "channelUrls": ["https://t.me/s/telegram"],
  "maxPostsPerChannel": 100,
  "maxMediaItems": 100,
  "mediaTypes": ["all"],
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}
