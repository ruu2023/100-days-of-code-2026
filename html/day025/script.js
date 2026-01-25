const dockerfiles = {
    apache: [
        "FROM httpd:2.4",
        "COPY ./public-html/ /usr/local/apache2/htdocs/",
        "EXPOSE 80",
        "RUN apt-get update && apt-get install -y vim",
        "LABEL maintainer=\"admin@example.com\""
    ],
    mysql: [
        "FROM mysql:8.0",
        "ENV MYSQL_ROOT_PASSWORD=password",
        "ENV MYSQL_DATABASE=mydatabase",
        "COPY ./my.cnf /etc/mysql/conf.d/",
        "EXPOSE 3306"
    ]
};

let currentCourse = [];
let currentIndex = 0;
let time = 0;
let timerId = null;
let isPlaying = false;

const wordDisplay = document.getElementById('word-display');
const wordInput = document.getElementById('word-input');
const timeDisplay = document.getElementById('time');
const indexDisplay = document.getElementById('current-index');
const totalDisplay = document.getElementById('total-index');
const message = document.getElementById('message');
const courseSelector = document.getElementById('course-selector');
const gameArea = document.getElementById('game-area');
const resultScreen = document.getElementById('result-screen');
const finalTime = document.getElementById('final-time');

// 1. Initialize Game
function startGame(course) {
    currentCourse = dockerfiles[course];
    currentIndex = 0;
    time = 0;
    isPlaying = true;
    
    courseSelector.classList.add('hidden');
    gameArea.classList.remove('hidden');
    resultScreen.classList.add('hidden');
    
    totalDisplay.innerText = currentCourse.length;
    wordInput.value = '';
    wordInput.focus();
    
    showLine();
    
    // Start timer
    if(timerId) clearInterval(timerId);
    timerId = setInterval(updateTime, 1000);
}

// 2. Display the current line
function showLine() {
    const line = currentCourse[currentIndex];
    indexDisplay.innerText = currentIndex + 1;
    
    // Create span for each character to allow coloring
    wordDisplay.innerHTML = '';
    line.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        wordDisplay.appendChild(span);
    });
}

// 3. Update Timer
function updateTime() {
    time++;
    timeDisplay.innerText = time;
}

// 4. Handle Input
wordInput.addEventListener('input', () => {
    const currentLine = currentCourse[currentIndex];
    const inputValue = wordInput.value;
    const arrayLine = wordDisplay.querySelectorAll('span');
    
    let isError = false;

    arrayLine.forEach((span, index) => {
        const char = inputValue[index];
        if (char == null) {
            span.classList.remove('match');
            span.classList.remove('unmatch');
        } else if (char === span.innerText) {
            span.classList.add('match');
            span.classList.remove('unmatch');
        } else {
            span.classList.remove('match');
            span.classList.add('unmatch');
            isError = true;
        }
    });

    if (isError) {
        message.innerText = "Error in typing...";
    } else {
        message.innerText = "";
    }

    // Check if line complete
    if (inputValue === currentLine) {
        currentIndex++;
        if (currentIndex < currentCourse.length) {
            wordInput.value = '';
            showLine();
        } else {
            finishGame();
        }
    }
});

// 5. Wrap up
function finishGame() {
    isPlaying = false;
    clearInterval(timerId);
    gameArea.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalTime.innerText = time;
}
