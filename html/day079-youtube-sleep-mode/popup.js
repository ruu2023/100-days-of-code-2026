const STORAGE_KEY = "youtubeSleepModeEnabled";

const toggleButton = document.getElementById("toggleButton");
const statusText = document.getElementById("statusText");

initialize();

async function initialize() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const enabled = stored[STORAGE_KEY] !== false;
  render(enabled);
}

toggleButton.addEventListener("click", async () => {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const nextEnabled = stored[STORAGE_KEY] === false;
  await chrome.storage.local.set({ [STORAGE_KEY]: nextEnabled });
  render(nextEnabled);
});

function render(enabled) {
  toggleButton.dataset.state = enabled ? "on" : "off";
  toggleButton.textContent = enabled ? "Sleep Mode: ON" : "Sleep Mode: OFF";
  statusText.textContent = enabled
    ? "おすすめ、ヘッダー、説明欄を非表示にしています。"
    : "通常の YouTube 表示です。";
}
