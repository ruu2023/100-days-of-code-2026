const STORAGE_KEY = "youtubeSleepModeEnabled";
const ROOT_FLAG = "data-yt-sleep-mode";
const STYLE_ID = "yt-sleep-mode-style";

let enabled = true;
let observer = null;
let rafId = 0;

initialize();

async function initialize() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  enabled = stored[STORAGE_KEY] !== false;

  injectStyle();
  applyMode();
  observePage();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    enabled = changes[STORAGE_KEY].newValue !== false;
    applyMode();
  });

  window.addEventListener("yt-navigate-finish", scheduleApply, { passive: true });
  document.addEventListener("yt-page-data-updated", scheduleApply, { passive: true });
  window.addEventListener("resize", scheduleApply, { passive: true });
}

function observePage() {
  observer = new MutationObserver(() => {
    scheduleApply();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function scheduleApply() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    applyMode();
  });
}

function applyMode() {
  if (location.pathname.startsWith("/live_chat")) {
    applyChatMode();
    return;
  }

  applyWatchMode();
}

function applyWatchMode() {
  const root = document.documentElement;
  if (!enabled) {
    root.removeAttribute(ROOT_FLAG);
    return;
  }

  root.setAttribute(ROOT_FLAG, "watch");

  const page = document.querySelector("ytd-watch-flexy");
  if (!page) return;

  page.removeAttribute("theater");

  const primary = document.querySelector("#primary");
  const chat = document.querySelector("ytd-live-chat-frame, #chat, #chat-container");
  const chatFrame = document.querySelector("ytd-live-chat-frame iframe");

  if (primary) {
    primary.removeAttribute("hidden");
  }

  if (chat) {
    chat.removeAttribute("collapsed");
    chat.removeAttribute("hidden");
  }

  if (chatFrame) {
    chatFrame.style.visibility = "visible";
    chatFrame.style.opacity = "1";
  }
}

function applyChatMode() {
  const root = document.documentElement;

  if (!enabled) {
    root.removeAttribute(ROOT_FLAG);
    return;
  }

  root.setAttribute(ROOT_FLAG, "chat");

  const inputPanel = document.querySelector("#input-panel");
  if (inputPanel) {
    inputPanel.style.display = "none";
  }
}

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html[${ROOT_FLAG}="watch"],
    html[${ROOT_FLAG}="watch"] body,
    html[${ROOT_FLAG}="watch"] ytd-app,
    html[${ROOT_FLAG}="watch"] #page-manager,
    html[${ROOT_FLAG}="watch"] #columns,
    html[${ROOT_FLAG}="watch"] #primary,
    html[${ROOT_FLAG}="watch"] #secondary,
    html[${ROOT_FLAG}="chat"],
    html[${ROOT_FLAG}="chat"] body {
      background: #000 !important;
      color: #f5f5f5 !important;
    }

    html[${ROOT_FLAG}="watch"] ytd-masthead,
    html[${ROOT_FLAG}="watch"] #below,
    html[${ROOT_FLAG}="watch"] #related,
    html[${ROOT_FLAG}="watch"] #secondary #items,
    html[${ROOT_FLAG}="watch"] #secondary-inner > :not(#chat):not(ytd-live-chat-frame),
    html[${ROOT_FLAG}="watch"] #comments,
    html[${ROOT_FLAG}="watch"] #chips-wrapper,
    html[${ROOT_FLAG}="watch"] #guide,
    html[${ROOT_FLAG}="watch"] ytd-mini-guide-renderer,
    html[${ROOT_FLAG}="watch"] ytd-merch-shelf-renderer,
    html[${ROOT_FLAG}="watch"] ytd-watch-next-secondary-results-renderer,
    html[${ROOT_FLAG}="watch"] ytd-reel-shelf-renderer,
    html[${ROOT_FLAG}="watch"] .ytp-ce-element,
    html[${ROOT_FLAG}="watch"] .ytp-cards-button,
    html[${ROOT_FLAG}="watch"] .ytp-paid-content-overlay,
    html[${ROOT_FLAG}="watch"] .annotation,
    html[${ROOT_FLAG}="watch"] .iv-branding,
    html[${ROOT_FLAG}="watch"] #panels,
    html[${ROOT_FLAG}="watch"] #description,
    html[${ROOT_FLAG}="watch"] #meta,
    html[${ROOT_FLAG}="watch"] #title,
    html[${ROOT_FLAG}="watch"] #header {
      display: none !important;
    }

    html[${ROOT_FLAG}="watch"] #page-manager,
    html[${ROOT_FLAG}="watch"] ytd-watch-flexy,
    html[${ROOT_FLAG}="watch"] #full-bleed-container {
      background: #000 !important;
    }

    html[${ROOT_FLAG}="watch"] #columns {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 360px !important;
      gap: 16px !important;
      max-width: none !important;
      padding: 16px !important;
      box-sizing: border-box !important;
    }

    html[${ROOT_FLAG}="watch"] #primary,
    html[${ROOT_FLAG}="watch"] #primary-inner,
    html[${ROOT_FLAG}="watch"] #player,
    html[${ROOT_FLAG}="watch"] #full-bleed-container {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
    }

    html[${ROOT_FLAG}="watch"] #secondary,
    html[${ROOT_FLAG}="watch"] #secondary-inner,
    html[${ROOT_FLAG}="watch"] #chat,
    html[${ROOT_FLAG}="watch"] ytd-live-chat-frame {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
    }

    html[${ROOT_FLAG}="watch"] ytd-live-chat-frame {
      position: sticky !important;
      top: 16px !important;
      height: calc(100vh - 32px) !important;
      min-height: 480px !important;
      border: 1px solid #202020 !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      background: #000 !important;
    }

    html[${ROOT_FLAG}="watch"] iframe.ytd-live-chat-frame,
    html[${ROOT_FLAG}="watch"] ytd-live-chat-frame iframe {
      background: #000 !important;
    }

    html[${ROOT_FLAG}="watch"] video {
      background: #000 !important;
    }

    html[${ROOT_FLAG}="watch"] .html5-video-player,
    html[${ROOT_FLAG}="watch"] .ytp-chrome-bottom,
    html[${ROOT_FLAG}="watch"] .ytp-gradient-bottom,
    html[${ROOT_FLAG}="watch"] .ytp-gradient-top {
      background-color: transparent !important;
    }

    html[${ROOT_FLAG}="watch"] .ytp-show-cards-title,
    html[${ROOT_FLAG}="watch"] .ytp-ce-covering-shadow,
    html[${ROOT_FLAG}="watch"] .ytp-endscreen-content {
      display: none !important;
    }

    html[${ROOT_FLAG}="chat"] yt-live-chat-renderer,
    html[${ROOT_FLAG}="chat"] #chat,
    html[${ROOT_FLAG}="chat"] #contents,
    html[${ROOT_FLAG}="chat"] #item-scroller,
    html[${ROOT_FLAG}="chat"] #items {
      background: #000 !important;
    }

    html[${ROOT_FLAG}="chat"] #panel-pages,
    html[${ROOT_FLAG}="chat"] #chat-messages,
    html[${ROOT_FLAG}="chat"] yt-live-chat-item-list-renderer,
    html[${ROOT_FLAG}="chat"] yt-live-chat-text-message-renderer,
    html[${ROOT_FLAG}="chat"] yt-live-chat-paid-message-renderer {
      background: #000 !important;
      color: #f5f5f5 !important;
    }

    html[${ROOT_FLAG}="chat"] #author-name,
    html[${ROOT_FLAG}="chat"] #message,
    html[${ROOT_FLAG}="chat"] #timestamp {
      color: #f5f5f5 !important;
    }

    html[${ROOT_FLAG}="chat"] #ticker,
    html[${ROOT_FLAG}="chat"] #separator,
    html[${ROOT_FLAG}="chat"] #menu,
    html[${ROOT_FLAG}="chat"] #show-hide-button,
    html[${ROOT_FLAG}="chat"] yt-live-chat-header-renderer {
      display: none !important;
    }

    @media (max-width: 1100px) {
      html[${ROOT_FLAG}="watch"] #columns {
        grid-template-columns: 1fr !important;
      }

      html[${ROOT_FLAG}="watch"] ytd-live-chat-frame {
        position: relative !important;
        top: 0 !important;
        height: 480px !important;
      }
    }
  `;

  (document.head || document.documentElement).appendChild(style);
}
