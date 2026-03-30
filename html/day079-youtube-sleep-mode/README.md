# YouTube Sleep Mode

Chrome Manifest V3 extension that hides everything except the video player and live chat on YouTube.

## Files

- `manifest.json`: extension entry point
- `content.js`: applies the minimal watch/chat layout
- `popup.html` / `popup.js`: simple on/off toggle

## Load locally

1. Open `chrome://extensions`
2. Enable developer mode
3. Choose "Load unpacked"
4. Select `html/day079-youtube-sleep-mode`

## Supported pages

- `https://www.youtube.com/watch*`
- `https://www.youtube.com/live_chat*`
