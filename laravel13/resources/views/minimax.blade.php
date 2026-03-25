<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MiniMax AI Tools</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen text-gray-900 font-sans">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <header class="text-center mb-12">
            <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">MiniMax AI Tools</h1>
            <p class="text-lg text-gray-600">画像生成と音声合成（T2A）を一つの画面で利用できます。</p>
        </header>

        <!-- API Key Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 class="text-xl font-bold mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                API設定
            </h2>
            <div>
                <label for="api_key" class="block text-sm font-medium text-gray-700 mb-1">MiniMax API Key</label>
                <input type="password" id="api_key" placeholder="Enter your MiniMax API Key" 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                <p class="mt-2 text-xs text-gray-500">APIキーはブラウザのLocalStorageにのみ保存され、サーバーには保存されません。</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-2 mb-6 bg-gray-200 p-1 rounded-xl">
            <button onclick="switchTab('image')" id="tab-image" class="flex-1 py-2 text-sm font-medium rounded-lg bg-white shadow text-gray-900 transition-all">画像生成 (Image Gen)</button>
            <button onclick="switchTab('audio')" id="tab-audio" class="flex-1 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 transition-all">音声合成 (Text to Audio)</button>
        </div>

        <!-- Image Generation Section -->
        <div id="section-image" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div class="space-y-6">
                <div>
                    <label for="image_prompt" class="block text-sm font-medium text-gray-700 mb-1">プロンプト (Prompt)</label>
                    <textarea id="image_prompt" rows="3" placeholder="Anime illustration of a young man, 90s retro anime style..." 
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"></textarea>
                </div>
                <button onclick="generateImage()" id="btn-image" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                    <span>生成する</span>
                    <svg id="loading-image" class="animate-spin ml-2 h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
                <div id="image-result" class="grid grid-cols-1 gap-4 mt-6">
                    <!-- Images will be injected here -->
                </div>
            </div>
        </div>

        <!-- Audio Generation Section -->
        <div id="section-audio" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hidden">
            <div class="space-y-6">
                <div>
                    <label for="audio_text" class="block text-sm font-medium text-gray-700 mb-1">テキスト (Text)</label>
                    <textarea id="audio_text" rows="3" placeholder="こんにちは！これは音声合成のテストです。" 
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"></textarea>
                </div>
                <div>
                    <label for="voice_id" class="block text-sm font-medium text-gray-700 mb-1">ボイス (Voice)</label>
                    <select id="voice_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                        <option value="Japanese_Whisper_Belle">Japanese Whisper Belle (Belle)</option>
                        <option value="English_expressive_narrator">English Expressive Narrator</option>
                        <option value="moss_audio_24875c4a-7be4-11f0-9359-4e72c55db738">Japanese Voice 1</option>
                        <option value="moss_audio_7f4ee608-78ea-11f0-bb73-1e2a4cfcd245">Japanese Voice 2</option>
                        <option value="English_Graceful_Lady">English Graceful Lady</option>
                    </select>
                </div>
                <button onclick="generateAudio()" id="btn-audio" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                    <span>音声を生成する</span>
                    <svg id="loading-audio" class="animate-spin ml-2 h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
                <div id="audio-result" class="mt-6 flex justify-center">
                    <!-- Audio player will be injected here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        // Load API Key from LocalStorage
        const apiKeyInput = document.getElementById('api_key');
        apiKeyInput.value = localStorage.getItem('minimax_api_key') || '';
        apiKeyInput.addEventListener('change', (e) => {
            localStorage.setItem('minimax_api_key', e.target.value);
        });

        function switchTab(tab) {
            const sections = {
                image: document.getElementById('section-image'),
                audio: document.getElementById('section-audio')
            };
            const tabs = {
                image: document.getElementById('tab-image'),
                audio: document.getElementById('tab-audio')
            };

            if (tab === 'image') {
                sections.image.classList.remove('hidden');
                sections.audio.classList.add('hidden');
                tabs.image.classList.add('bg-white', 'shadow', 'text-gray-900');
                tabs.image.classList.remove('text-gray-600');
                tabs.audio.classList.remove('bg-white', 'shadow', 'text-gray-900');
                tabs.audio.classList.add('text-gray-600');
            } else {
                sections.image.classList.add('hidden');
                sections.audio.classList.remove('hidden');
                tabs.audio.classList.add('bg-white', 'shadow', 'text-gray-900');
                tabs.audio.classList.remove('text-gray-600');
                tabs.image.classList.remove('bg-white', 'shadow', 'text-gray-900');
                tabs.image.classList.add('text-gray-600');
            }
        }

        async function generateImage() {
            const apiKey = apiKeyInput.value;
            const prompt = document.getElementById('image_prompt').value;
            const btn = document.getElementById('btn-image');
            const loader = document.getElementById('loading-image');
            const resultDiv = document.getElementById('image-result');

            if (!apiKey || !prompt) {
                alert('APIキーとプロンプトを入力してください。');
                return;
            }

            btn.disabled = true;
            loader.classList.remove('hidden');
            resultDiv.innerHTML = '';

            try {
                const response = await fetch('{{ route("minimax.image") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ api_key: apiKey, prompt: prompt })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                data.images.forEach((base64, index) => {
                    const img = document.createElement('img');
                    img.src = `data:image/jpeg;base64,${base64}`;
                    img.className = "w-full rounded-xl shadow-lg border border-gray-100";
                    resultDiv.appendChild(img);
                });
            } catch (error) {
                console.error(error);
                resultDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            } finally {
                btn.disabled = false;
                loader.classList.add('hidden');
            }
        }

        async function generateAudio() {
            const apiKey = apiKeyInput.value;
            const text = document.getElementById('audio_text').value;
            const voiceId = document.getElementById('voice_id').value;
            const btn = document.getElementById('btn-audio');
            const loader = document.getElementById('loading-audio');
            const resultDiv = document.getElementById('audio-result');

            if (!apiKey || !text) {
                alert('APIキーとテキストを入力してください。');
                return;
            }

            btn.disabled = true;
            loader.classList.remove('hidden');
            resultDiv.innerHTML = '';

            try {
                const response = await fetch('{{ route("minimax.audio") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ api_key: apiKey, text: text, voice_id: voiceId })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = `data:audio/mp3;base64,${data.audio}`;
                audio.className = "w-full max-w-md";
                resultDiv.appendChild(audio);
                audio.play();
            } catch (error) {
                console.error(error);
                resultDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            } finally {
                btn.disabled = false;
                loader.classList.add('hidden');
            }
        }
    </script>
</body>
</html>
