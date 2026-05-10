// Audio System (Offline Synthesized Sounds)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'tap') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'draw') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// Game Logic
const board = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const p1Info = document.getElementById('p1-info');
const p2Info = document.getElementById('p2-info');
const resetBtn = document.getElementById('reset-btn');
const modalResetBtn = document.getElementById('modal-reset-btn');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const splashScreen = document.getElementById('splash-screen');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Splash Screen Handler
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.visibility = 'hidden';
        }, 800);
    }, 2500);
});

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    playSound('tap');
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

function handleResultValidation() {
    let roundWon = false;
    let winningLine = null;

    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        playSound('win');
        resultMessage.innerText = `Player ${currentPlayer} Wins!`;
        scores[currentPlayer]++;
        updateScoreBoard();
        highlightWinningCells(winningLine);
        gameActive = false;
        setTimeout(() => {
            resultModal.style.display = 'flex';
        }, 600);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        playSound('draw');
        resultMessage.innerText = "It's a Draw!";
        gameActive = false;
        setTimeout(() => {
            resultModal.style.display = 'flex';
        }, 600);
        return;
    }

    handlePlayerChange();
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `Player ${currentPlayer}'s Turn`;
    
    if (currentPlayer === 'X') {
        p1Info.classList.add('active');
        p2Info.classList.remove('active');
    } else {
        p2Info.classList.add('active');
        p1Info.classList.remove('active');
    }
}

function updateScoreBoard() {
    scoreXElement.innerText = scores.X;
    scoreOElement.innerText = scores.O;
}

function highlightWinningCells(line) {
    line.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function restartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.innerText = "Player X's Turn";
    p1Info.classList.add('active');
    p2Info.classList.remove('active');
    resultModal.style.display = 'none';
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('x', 'o', 'winner');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', () => {
    playSound('tap');
    restartGame();
});
modalResetBtn.addEventListener('click', () => {
    playSound('tap');
    restartGame();
});
