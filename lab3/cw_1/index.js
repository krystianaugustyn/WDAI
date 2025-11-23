let timer = 0;
let intervalId = null;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return `${mins}min ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function updateDisplay() {
    document.getElementById("display").textContent = formatTime(timer);
}

document.getElementById("start").addEventListener("click", () => {
    if (!intervalId) {
        intervalId = setInterval(() => {
            timer++;
            updateDisplay();
        }, 1000);
    }
});

document.getElementById("stop").addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
});

document.getElementById("reset").addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    timer = 0;
    updateDisplay();
});
