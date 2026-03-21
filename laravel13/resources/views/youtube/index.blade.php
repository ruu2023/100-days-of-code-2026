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

        <div class="bg-gray-800 rounded-lg p-6">
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
    </div>

    <script>
        let downloadStarted = false;

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
            btn.textContent = '処理中...';
            status.classList.remove('hidden');
            statusText.textContent = '動画を準備しています...';
            downloadStarted = false;

            try {
                // フォームを動的に作成してサブミット（ブラウザダウンロード dialog 対応）
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/youtube/download';
                form.style.display = 'none';

                const params = { url, format };
                if (start) params.start = start;
                if (end) params.end = end;

                for (const [key, value] of Object.entries(params)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }

                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = '{{ csrf_token() }}';
                form.appendChild(csrfInput);

                document.body.appendChild(form);

                form.submit();
                document.body.removeChild(form);

                statusText.textContent = 'ダウンロード開始しました';
                downloadStarted = true;

                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'ダウンロード';
                }, 3000);

            } catch (e) {
                statusText.textContent = 'エラー: ' + e.message;
                btn.disabled = false;
                btn.textContent = 'ダウンロード';
            }
        }
    </script>
</body>
</html>