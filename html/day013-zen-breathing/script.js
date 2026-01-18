const container = document.querySelector('.container');
const text = document.getElementById('instruction-text');
const startBtn = document.getElementById('start-btn');
const breathingContainer = document.getElementById('breathing-container');

// Breathing Cycle Times (ms)
const BREATHE_IN_TIME = 4000;
const HOLD_TIME = 4000;
const BREATHE_OUT_TIME = 4000;
const HOLD_EMPTY_TIME = 4000; // Total 16s cycle for Box Breathing

let isRunning = false;
let intervalId;

function breatheAnimation() {
    if (!isRunning) return;

    // Breathe In
    text.innerText = 'Breathe In';
    container.className = 'container grow';

    setTimeout(() => {
        if (!isRunning) return;
        
        // Hold
        text.innerText = 'Hold';

        setTimeout(() => {
            if (!isRunning) return;

            // Breathe Out
            text.innerText = 'Breathe Out';
            container.className = 'container shrink';

            setTimeout(() => {
                if (!isRunning) return;
                
                // Hold Empty (optional, sometimes good for box breathing) or just loop
                // Let's do a simple In/Hold/Out loop for relaxation which is often 4-7-8 or 4-4-4.
                // Let's stick to the 4-4-4 rhythm implemented in class names:
                // Actually my CSS only has Grow and Shrink. 
                // Grow = Big (End of Inhale)
                // Shrink = Small (End of Exhale)
                
                // Refined Logic for visual sync:
                // 1. "Grow" class added -> Circle expands (takes 3s CSS transition?)
                // My CSS transition is 3s.
                // So:
                // 0ms: Start Expand (Text: Breathe In)
                // 4000ms: Fully Expanded (Text: Hold)
                // 8000ms: Start Shrink (Text: Breathe Out)
                // 12000ms: Fully Shrunk (Text: Hold)
                
                text.innerText = 'Hold';
                
            }, BREATHE_OUT_TIME);

        }, HOLD_TIME);

    }, BREATHE_IN_TIME);
}

// Loop logic needs to match the timeouts
// Total time = 4000 + 4000 + 4000 + 4000 = 16000
function startBreathing() {
    breatheAnimation();
    intervalId = setInterval(breatheAnimation, 16000);
}

startBtn.addEventListener('click', () => {
    if (isRunning) {
        // Stop
        isRunning = false;
        clearInterval(intervalId);
        startBtn.innerText = 'Start Session';
        text.innerText = 'Ready?';
        container.classList.remove('grow', 'shrink');
        return;
    }

    isRunning = true;
    startBtn.innerText = 'Stop Session';
    startBreathing();
});
