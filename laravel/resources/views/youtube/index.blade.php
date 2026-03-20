<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Downloader</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen p-8">
    <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">YouTube 動画ダウンローダー</h1>

        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <div class="mb-4">
                <label class="block text-sm mb-2">YouTube URL</label>
                <input type="url" id="url" placeholder="https://www.youtube.com/watch?v=..."
                    class="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm mb-2">開始時間（秒 or HH:MM:SS）</label>
                    <input type="text" id="start" placeholder="0:02"
                        class="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm mb-2">終了時間（秒 or HH:MM:SS）</label>
                    <input type="text" id="end" placeholder="0:10"
                        class="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm mb-2">フォーマット</label>
                <select id="format" class="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="mp4">MP4（動画）</option>
                    <option value="mp3">MP3（音声のみ）</option>
                </select>
            </div>

            <button id="downloadBtn" onclick="download()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition">
                ダウンロード
            </button>

            <div id="status" class="mt-4 hidden">
                <div class="bg-gray-700 rounded p-4">
                    <p id="statusText" class="text-sm"></p>
                </div>
            </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4">ダウンロード済みファイル</h2>
            <div id="fileList">
                @if(empty($files))
                    <p class="text-gray-400">ファイルがありません</p>
                @else
                    <ul class="space-y-2">
                        @foreach($files as $file)
                            <li class="flex items-center justify-between bg-gray-700 rounded px-4 py-2">
                                <span class="truncate">{{ $file['name'] }}</span>
                                <span class="text-sm text-gray-400">{{ round($file['size'] / 1024 / 1024, 2) }} MB</span>
                            </li>
                        @endforeach
                    </ul>
                @endif
            </div>
            <button onclick="refreshFiles()" class="mt-4 text-blue-400 hover:text-blue-300 text-sm">
                更新
            </button>
        </div>
    </div>

    <script>
        async function download() {
            const url = document.getElementById('url').value;
            const start = document.getElementById('start').value;
            const end = document.getElementById('end').value;
            const format = document.getElementById('format').value;

            if (!url) {
                alert('URL を入力してください');
                return;
            }

            const btn = document.getElementById('downloadBtn');
            const status = document.getElementById('status');
            const statusText = document.getElementById('statusText');

            btn.disabled = true;
            btn.textContent = 'ダウンロード中...';
            status.classList.remove('hidden');
            statusText.textContent = '動画をダウンロードしています...';

            try {
                const response = await fetch('/youtube/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ url, start, end, format })
                });

                const result = await response.json();

                if (result.success) {
                    statusText.textContent = 'ダウンロード完了！ファイル: ' + result.files.join(', ');
                    status.classList.remove('hidden');
                    refreshFiles();
                } else {
                    statusText.textContent = 'エラー: ' + result.error;
                }
            } catch (e) {
                statusText.textContent = 'エラー: ' + e.message;
            } finally {
                btn.disabled = false;
                btn.textContent = 'ダウンロード';
            }
        }

        async function refreshFiles() {
            const response = await fetch('/youtube/files');
            const files = await response.json();
            const fileList = document.getElementById('fileList');

            if (files.length === 0) {
                fileList.innerHTML = '<p class="text-gray-400">ファイルがありません</p>';
            } else {
                fileList.innerHTML = '<ul class="space-y-2">' +
                    files.map(f => `
                        <li class="flex items-center justify-between bg-gray-700 rounded px-4 py-2">
                            <span class="truncate">${f.name}</span>
                            <span class="text-sm text-gray-400">${(f.size / 1024 / 1024).toFixed(2)} MB</span>
                        </li>
                    `).join('') +
                    '</ul>';
            }
        }
    </script>
</body>
</html>