const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let AssetsToLoad = {
    bg: 'assets/Flappy Bird/background-day.png',
    base: 'assets/Flappy Bird/base.png',
    pg: 'assets/Flappy Bird/pipe-green.png',
    yd: 'assets/Flappy Bird/yellowbird-downflap.png',
    ym: 'assets/Flappy Bird/yellowbird-midflap.png',
    yu: 'assets/Flappy Bird/yellowbird-upflap.png',
    go: 'assets/UI/gameover.png',
    mes: 'assets/UI/message.png',
}

for (let i= 0; i < 10; i++) {
    AssetsToLoad['n' + i] = 'assets/UI/Numbers/' + i + '.png';
}

for (let key in AssetsToLoad) {
    let img = new Image();
    img.src = AssetsToLoad[key];
    AssetsToLoad[key] = img;
}

const Sounds = {
    die: new Audio('assets/Sound Efects/die.wav'),
    hit: new Audio('assets/Sound Efects/hit.wav'),
    point: new Audio('assets/Sound Efects/point.wav'),
    swoosh: new Audio('assets/Sound Efects/swoosh.wav'),
    wing: new Audio('assets/Sound Efects/wing.wav')
}

const floorHeight = 50;

class Bird {
    constructor() {
        this.state = 1;
        this.x = 100;
        this.y = 400;
        this.w = 74;
        this.h = 54;
        this.gravity = 0.45;
        this.flap = -8;
        this.maxfall = 10;
        this.velocity = 0;
        this.angle = 0;
    }

    jump() {
        Sounds.wing.currentTime = 0;
        Sounds.wing.play();
        this.velocity = this.flap
    }

    update() {
        if (!gameStarted) { return }

        const floorY = canvas.height - floorHeight;

        if (this.y + this.h >= floorY) {
            this.y = floorY - this.h;
            this.velocity = 0;
        }

        this.velocity += this.gravity;

        if (this.velocity > this.maxfall) {
            this.velocity = this.maxfall;
        }

        this.y += this.velocity;

        if (this.state === 0) {
            this.angle += 2 * Math.PI / 180;
            if (this.angle > 45 * Math.PI / 180) { this.angle = 45 * Math.PI / 180; }
        }

        if (this.state === 2) {
            this.angle -= 2 * Math.PI / 180;
            if (this.angle < -25 * Math.PI / 180) { this.angle = -25 * Math.PI / 180; }
        }

        if (this.velocity > 0) { this.state = 0 }
        else if (this.velocity === 0) { this.state = 1 }
        else { this.state = 2 }
    }

    draw() {
        let image;

        if (this.state === 0) { image = AssetsToLoad.yd }
        if (this.state === 1) { image = AssetsToLoad.ym }
        if (this.state === 2) { image = AssetsToLoad.yu }

        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(image, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 130;
        this.gap = 300;
        this.speed = 5;
        this.passed = false;

        let minHeight = 40
        let maxHeight = canvas.height - floorHeight - this.gap - minHeight
        this.top = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight
        this.bottom = this.top + this.gap;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.top / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(AssetsToLoad.pg, -this.width / 2, -this.top / 2, this.width, this.top)
        ctx.restore();

        ctx.drawImage(AssetsToLoad.pg, this.x, this.bottom, this.width, canvas.height - floorHeight - this.bottom);
    }
}

let bird = new Bird();
let pipes = [];
let pipeSpace = 400;
let gameOver = false;
let gameStarted = false;
let birdCrashed = false;
let swooshPlayed = false;
let score = 0
let bestScore = 0

function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(AssetsToLoad.bg, 0, 0, canvas.width, canvas.height - floorHeight);

    if (gameStarted) {

        bird.update();

        if (!gameOver) {
            pipes.forEach(pipe => pipe.update());

            if (pipes.length === 0) pipes.push(new Pipe(canvas.width));

            if (pipes[pipes.length - 1].x < canvas.width - pipeSpace) {
                pipes.push(new Pipe(canvas.width));
            }

            pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
            countScore();
        }
    }

    pipes.forEach(pipe => pipe.draw());

    bird.draw();

    checkCollision()

    ctx.drawImage(AssetsToLoad.base, 0, canvas.height - floorHeight, canvas.width, floorHeight);

    drawScore();

    if (gameOver) {
        if (!swooshPlayed) {
            swooshPlayed = true;
            setTimeout(() => {
                Sounds.swoosh.currentTime = 0;
                Sounds.swoosh.play();
            }, 600);
        }

        ctx.drawImage(AssetsToLoad.go, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 80);
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("Best Score: " + bestScore, canvas.width / 2, canvas.height / 2 + 30);
    }

    if (!gameStarted) {
        ctx.drawImage(AssetsToLoad.mes, canvas.width / 2 - 150, canvas.height / 2 - 100, 300, 250);
    }

    requestAnimationFrame(gameLoop);
}

function checkCollision() {
    const floorY = canvas.height - floorHeight;

    if (bird.y <= 0) {
        if (!gameOver) {
            Sounds.hit.currentTime = 0;
            Sounds.hit.play();
        }
        birdCrashed = true;
        gameOver = true;
        bird.velocity = 5;
        bird.angle = 45 * Math.PI / 180;
        return;
    }

    if (bird.y + bird.h + 10 >= floorY) {
        if (!gameOver) {
            Sounds.die.currentTime = 0;
            Sounds.die.play();
        }
        gameOver = true;
        return;
    }

    pipes.forEach(pipe => {
        if (pipe.x < bird.x + bird.w && pipe.x + pipe.width > bird.x) {
            if (bird.y < pipe.top || bird.y + bird.h > pipe.bottom) {
                if(!birdCrashed) {
                    Sounds.hit.currentTime = 0;
                    Sounds.hit.play();
                    birdCrashed = true;
                    gameOver = true;
                    bird.velocity = 0;
                    bird.angle = 45 * Math.PI/180;
                }
            }
        }
    })
}

function resetGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    birdCrashed = false;
    gameStarted = false;
    swooshPlayed = false;
    gameOver = false;
}

function countScore() {
    if (gameStarted && !gameOver) {

        pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                Sounds.point.currentTime = 0;
                Sounds.point.play();
                pipe.passed = true;
                score += 1;
            }
        })
    }
}

function drawScore() {
    let scoreStr = score.toString();
    let digitWidth = 35;
    let digitHeight = 50;
    let totalWidth = scoreStr.length * digitWidth;
    let startX = canvas.width - totalWidth - 20;

    for (let i = 0; i < scoreStr.length; i++) {
        let digit = scoreStr[i];
        ctx.drawImage(
            AssetsToLoad["n" + digit],
            startX + i * digitWidth,
            30,
            digitWidth,
            digitHeight
        );
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code !== 'Space') { return }

    if (!gameStarted && !gameOver) {
        gameStarted = true;
    } else if (!gameOver && !birdCrashed) {
        bird.angle = 0;
        bird.jump()
    }
    else if (gameOver) {
        bestScore = Math.max(score, bestScore);
        Sounds.swoosh.currentTime = 0;
        Sounds.swoosh.play();
        resetGame();
    }
})

gameLoop();