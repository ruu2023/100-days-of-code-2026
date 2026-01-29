// index
document.addEventListener('DOMContentLoaded', async () => {
  displayLogs();
});

// save
document.getElementById('clipBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getYouTubeInfo,
  }, (results) => {
    if (results && results[0].result) {
      saveLog(results[0].result);
    }
  });
});

// fetch info
function getYouTubeInfo() {
  const title = document.title.replace(' - YouTube', '');
  const video = document.querySelector('video');
  const time = video ? Math.floor(video.currentTime) : 0;

  // second format 00:00
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const urlObj = new URL(window.location.href);
  urlObj.searchParams.set('t', time);
  return { title, timestamp, url: urlObj.toString() };
}

// data save to chrome
async function saveLog(data) {
  const { logs = [] } = await chrome.storage.local.get('logs');
  logs.unshift(data); // add to first
  await chrome.storage.local.set( { logs: logs.slice(0,10) }); // max 10
  displayLogs();
}

async function displayLogs() {
  const { logs = [] } = await chrome.storage.local.get('logs');
  const listEl = document.getElementById('list');
  listEl.innerHTML = logs.map(log => `
    <li class="text-xs bg-white p-2 rounded bordr bordr-slate-200 shadow-sm">
      <div class="font-bold text-slate-700 truncate">${log.title}</div>
      <a href="${log.url}" target="_blank" class="text-blue-500 hover:underline">
       ⏱${log.timestamp} から再生
      </a>
    </li>
  `).join('');
}

// delete all
document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.storage.local.set({ logs: [] }, displayLogs);
})