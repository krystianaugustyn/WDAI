const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ASSET_BASE = 'assets/Flappy Bird/';
const SFX_BASE = 'assets/Sound Efects/';
const UI_BASE   = 'assets/UI/';

const assetsToLoad = {
    bg: ASSET_BASE + 'background-day.png',
    base: ASSET_BASE + 'base.png',
    pipe: ASSET_BASE + 'pipe-green.png',
    bird_up: ASSET_BASE + 'yellowbird-upflap.png',
    bird_mid: ASSET_BASE + 'yellowbird-midflap.png',
    bird_down: ASSET_BASE + 'yellowbird-downflap.png',
    msg: UI_BASE + 'message.png',
    gameoverImg: UI_BASE + 'gameover.png'
};

for (let i=0;i<=9;i++) {
    assetsToLoad['n' + i] = UI_BASE + 'Numbers/' + i + '.png';
}

const sounds = {
    wing: SFX_BASE + 'wing.wav',
    point: SFX_BASE + 'point.wav',
    hit: SFX_BASE + 'hit.wav',
    die: SFX_BASE + 'die.wav',
    swoosh: SFX_BASE + 'swoosh.wav'
};

function playSound(key){
    const s = new Audio(sounds[key]);
    s.play().catch(()=>{});
}

const IMAGES = {};
let toLoadCount = Object.keys(assetsToLoad).length;
let loadedCount = 0;

function resourceLoaded(){
    loadedCount++;
    if (loadedCount >= toLoadCount) {
        init();
    }
}

for (const key in assetsToLoad){
    const img = new Image();
    img.src = assetsToLoad[key];
    img.onload = resourceLoaded;
    img.onerror = resourceLoaded;
    IMAGES[key] = img;
}

let state = 'start';

const bird = {
    x: 100,
    y: 0,
    w: 34,
    h: 24,
    dy: 0,
    gravity: 0.45,
    flap: -8,
    maxFall: 10
};

let baseY = canvas.height - 112;
const pipes = [];
const pipeGap = 120;
const pipeSpeed = 2.5;
let lastPipe = 0;
const pipeInterval = 1500;
let score = 0;
let bestScores = loadBestScores();

document.addEventListener('keydown', e => { if(e.code==='Space') onAction(); });
canvas.addEventListener('click', onAction);

function onAction(){
    if(state==='start'){
        startGame();
        playSound('swoosh');
    }
    else if(state==='play'){
        bird.dy = bird.flap;
        playSound('wing');
    }
    else if(state==='gameover'){
        resetGame();
        playSound('swoosh');
    }
}

function resetGame(){
    state = 'start';
    score = 0;
    pipes.length = 0;
    bird.y = canvas.height/2 - bird.h/2;
    bird.dy = 0;
}

function init(){
    bird.y = canvas.height/2 - bird.h/2;
    baseY = canvas.height - (IMAGES.base?.height || 112);
    lastPipe = performance.now();
    requestAnimationFrame(loop);
}

function startGame(){
    state='play';
    lastPipe = performance.now();
}

function spawnPipe(){
    const minTop = 40;
    const maxTop = baseY - pipeGap - 40;
    const topY = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

    pipes.push({
        x: canvas.width,
        topY,
        bottomY: topY + pipeGap,
        passed: false
    });
}

let lastTime = performance.now();

function update(now){
    const dt = now - lastTime;
    lastTime = now;

    if(state==='play'){
        bird.dy += bird.gravity;
        if(bird.dy > bird.maxFall) bird.dy = bird.maxFall;
        bird.y += bird.dy;

        if(now - lastPipe > pipeInterval){
            spawnPipe();
            lastPipe = now;
        }

        for(let i=pipes.length-1;i>=0;i--){
            const p = pipes[i];
            p.x -= pipeSpeed;

            if(!p.passed && p.x + IMAGES.pipe.width < bird.x){
                p.passed = true;
                score++;
                playSound('point');
            }

            if(p.x + IMAGES.pipe.width < -50)
                pipes.splice(i,1);
        }

        if(bird.y + bird.h >= baseY){
            triggerFall();
        }

        for(const p of pipes){
            const pw = IMAGES.pipe.width;

            const bx1 = bird.x;
            const by1 = bird.y;
            const bx2 = bird.x + bird.w;
            const by2 = bird.y + bird.h;

            const tx1 = p.x;
            const tx2 = p.x + pw;

            if(bx2>=tx1 && bx1<=tx2){
                if(by1 < p.topY || by2 > p.bottomY){
                    triggerFall();
                }
            }
        }
    }

    if(state==='fall'){
        bird.dy += bird.gravity * 1.2;
        if(bird.dy > bird.maxFall*1.5) bird.dy = bird.maxFall*1.5;
        bird.y += bird.dy;

        if(bird.y + bird.h >= baseY){
            bird.y = baseY - bird.h;
            endGame();
        }
    }
}

function triggerFall(){
    if(state !== 'play') return;
    state = 'fall';
    playSound('hit');
    setTimeout(()=>playSound('die'),200);
}

function endGame(){
    state = 'gameover';
    saveBestScore(score);
}

function render(){
    const W = canvas.width;
    const H = canvas.height;

    ctx.drawImage(IMAGES.bg,0,0,W,H);

    for(const p of pipes){
        const pw = IMAGES.pipe.width;
        const ph = IMAGES.pipe.height;

        ctx.save();
        ctx.translate(p.x, p.topY);
        ctx.scale(1, -1);
        ctx.drawImage(
            IMAGES.pipe,
            0, 0, pw, ph,
            0, 0, pw, p.topY
        );
        ctx.restore();

        ctx.drawImage(
            IMAGES.pipe,
            0, 0, pw, ph,
            p.x, p.bottomY,
            pw, canvas.height - p.bottomY
        );
    }

    const bw = IMAGES.base.width;
    for(let x=0; x<W+bw; x+=bw){
        ctx.drawImage(IMAGES.base, x, baseY);
    }

    const frameIndex = Math.floor((Date.now()/100)%3);
    const birdImg = frameIndex===0?IMAGES.bird_up:(frameIndex===1?IMAGES.bird_mid:IMAGES.bird_down);

    const angle = Math.max(-25, Math.min(90, bird.dy*6)) * Math.PI/180;

    ctx.save();
    ctx.translate(bird.x+bird.w/2, bird.y+bird.h/2);
    ctx.rotate(angle);
    ctx.drawImage(birdImg, -bird.w/2, -bird.h/2, bird.w, bird.h);
    ctx.restore();

    function getScoreWidth(value){
        const s = String(value);
        let w = 0;
        for (const ch of s) {
            const img = IMAGES['n' + ch];
            if (img) w += img.width + 2;
            else w += 18;
        }
        return w;
    }

    drawScore(score, canvas.width - getScoreWidth(score) - 10, 12);


    if(state==='start'){
        ctx.drawImage(IMAGES.msg,(W-IMAGES.msg.width)/2,H/2-30);
    }

    if(state==='gameover'){
        ctx.drawImage(IMAGES.gameoverImg,(W-IMAGES.gameoverImg.width)/2,H/2-60);
        ctx.fillStyle='white';
        ctx.font='18px Arial';
        ctx.fillText(`Score: ${score}`, W/2-40, H/2+50);
        ctx.fillText(`Best: ${bestScores[0]||0}`, W/2-40, H/2+75);
    }
}

function drawScore(value,x,y){
    const s = String(value);
    let cx = x;
    for(const digit of s){
        const img = IMAGES['n'+digit];
        ctx.drawImage(img, cx, y);
        cx += img.width + 2;
    }
}

function loadBestScores(){
    try{
        const s = localStorage.getItem('flappy_best');
        if(!s) return [];
        return JSON.parse(s).scores||[];
    } catch(e){ return []; }
}

function saveBestScore(newScore){
    const arr = loadBestScores();
    arr.push(newScore);
    arr.sort((a,b)=>b-a);
    const top = arr.slice(0,5);
    localStorage.setItem('flappy_best', JSON.stringify({scores:top}));
    bestScores = top;
}

function loop(now=performance.now()){
    update(now);
    render();
    requestAnimationFrame(loop);
}
