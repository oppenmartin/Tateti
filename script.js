const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const rematchBtn = document.getElementById("rematchBtn");
const resetBtn = document.getElementById("resetBtn");
const clearScoreBtn = document.getElementById("clearScoreBtn");
const modeSelectEl = document.getElementById("modeSelect");

const name1El = document.getElementById("name1");
const name2El = document.getElementById("name2");
const photo1El = document.getElementById("photo1");
const photo2El = document.getElementById("photo2");

const facePickerEl = document.getElementById("facePicker");
const faceChoice0El = document.getElementById("faceChoice0");
const faceChoice1El = document.getElementById("faceChoice1");

const winnerOverlayEl = document.getElementById("winnerOverlay");
const winnerFaceEl = document.getElementById("winnerFace");
const winnerTextEl = document.getElementById("winnerText");
const scoreNameXEl = document.getElementById("scoreNameX");
const scoreNameOEl = document.getElementById("scoreNameO");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawsEl = document.getElementById("scoreDraws");

const defaultPlayers = [
  { name: "Delfi", defaultPhotoUrl: "assets/delfi.jpg" },
  { name: "Cata", defaultPhotoUrl: "assets/cata.jpg" },
];
const SCORE_STORAGE_KEY = "tatetiScoreV1";

let board = Array(9).fill(null);
let currentPlayer = 0;
let players = [];
let gameActive = false;
let gameMode = "normal";
let selectedFaceIndex = 0;
let hasLoadedPlayers = false;
let score = { xWins: 0, oWins: 0, draws: 0 };

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function loadScore() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    score = {
      xWins: Number(parsed.xWins) || 0,
      oWins: Number(parsed.oWins) || 0,
      draws: Number(parsed.draws) || 0,
    };
  } catch (error) {
    score = { xWins: 0, oWins: 0, draws: 0 };
  }
}

function saveScore() {
  localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(score));
}

function renderScoreboard() {
  const nameX = players[0]?.name || name1El.value.trim() || defaultPlayers[0].name;
  const nameO = players[1]?.name || name2El.value.trim() || defaultPlayers[1].name;
  scoreNameXEl.textContent = nameX;
  scoreNameOEl.textContent = nameO;
  scoreXEl.textContent = String(score.xWins);
  scoreOEl.textContent = String(score.oWins);
  scoreDrawsEl.textContent = String(score.draws);
}

function registerWin(winner) {
  if (winner.mark === "X") score.xWins += 1;
  if (winner.mark === "O") score.oWins += 1;
  saveScore();
  renderScoreboard();
}

function registerDraw() {
  score.draws += 1;
  saveScore();
  renderScoreboard();
}

function clearScore() {
  if (!window.confirm("¿Borrar el marcador guardado?")) return;
  score = { xWins: 0, oWins: 0, draws: 0 };
  saveScore();
  renderScoreboard();
}

function createBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i += 1) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.dataset.index = i;
    cell.addEventListener("click", handleMove);
    boardEl.appendChild(cell);
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function loadImageUrlIfExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function resolvePlayerPhoto(file, defaultUrl) {
  if (file) return readFileAsDataUrl(file);
  return loadImageUrlIfExists(defaultUrl);
}

function checkWinner(mark) {
  return winCombos.some((combo) =>
    combo.every((idx) => board[idx] !== null && board[idx].mark === mark)
  );
}

function checkFaceWinner(faceIndex) {
  return winCombos.some((combo) =>
    combo.every(
      (idx) => board[idx] !== null && board[idx].faceIndex === faceIndex
    )
  );
}

function boardIsFull() {
  return board.every((cell) => cell !== null);
}

function placeFace(index, faceData) {
  const cell = boardEl.children[index];
  const chip = document.createElement("div");
  chip.className = "face-chip";
  const img = document.createElement("img");
  img.className = "face";
  img.src = faceData.photo;
  img.alt = faceData.name;
  chip.appendChild(img);
  cell.appendChild(chip);
  cell.classList.add("disabled");
}

function isComplexMode() {
  return gameMode === "complex";
}

function setFaceChoice(index) {
  selectedFaceIndex = index;
  faceChoice0El.classList.toggle("active", index === 0);
  faceChoice1El.classList.toggle("active", index === 1);
}

function setupFacePicker() {
  if (!isComplexMode()) {
    facePickerEl.classList.add("hidden");
    return;
  }

  faceChoice0El.innerHTML = `<img src="${players[0].photo}" alt="${players[0].name}">`;
  faceChoice1El.innerHTML = `<img src="${players[1].photo}" alt="${players[1].name}">`;
  facePickerEl.classList.remove("hidden");
  setFaceChoice(0);
}

function hideWinnerOverlay() {
  winnerOverlayEl.classList.add("hidden");
  winnerFaceEl.removeAttribute("src");
  winnerTextEl.textContent = "";
}

function showWinnerOverlay(winner) {
  winnerFaceEl.src = winner.photo;
  winnerFaceEl.alt = winner.name;
  winnerTextEl.textContent = `Ganó ${winner.name}`;
  winnerOverlayEl.classList.remove("hidden");
}

function updateTurnStatus() {
  const modeText =
    gameMode === "reverse"
      ? " (modo al revés)"
      : gameMode === "complex"
      ? " (modo complejo)"
      : "";
  statusEl.textContent = `Turno de ${players[currentPlayer].name}${modeText}`;
}

function disableBoard() {
  [...boardEl.children].forEach((cell) => cell.classList.add("disabled"));
}

function endWithWinner(winner, extraText = "") {
  statusEl.textContent = `Ganó ${winner.name}${extraText}`;
  showWinnerOverlay(winner);
  registerWin(winner);
  gameActive = false;
  disableBoard();
  rematchBtn.disabled = false;
}

function handleMove(event) {
  if (!gameActive) return;

  const index = Number(event.currentTarget.dataset.index);
  if (board[index] !== null) return;

  const player = players[currentPlayer];
  const chosenFaceIndex = isComplexMode() ? selectedFaceIndex : currentPlayer;
  const chosenFace = players[chosenFaceIndex];
  board[index] = {
    mark: player.mark,
    faceIndex: chosenFaceIndex,
  };

  placeFace(index, chosenFace);

  const hasWinningLine = isComplexMode()
    ? checkFaceWinner(chosenFaceIndex)
    : checkWinner(player.mark);

  if (hasWinningLine) {
    if (gameMode === "reverse") {
      const winner = players[(currentPlayer + 1) % 2];
      endWithWinner(winner, " (porque no hizo ta-te-ti)");
      return;
    }
    endWithWinner(player);
    return;
  }

  if (boardIsFull()) {
    statusEl.textContent = "Empate";
    registerDraw();
    gameActive = false;
    rematchBtn.disabled = false;
    return;
  }

  currentPlayer = (currentPlayer + 1) % 2;
  updateTurnStatus();
}

async function startGame() {
  const file1 = photo1El.files[0];
  const file2 = photo2El.files[0];

  try {
    const [photo1, photo2] = await Promise.all([
      resolvePlayerPhoto(file1, defaultPlayers[0].defaultPhotoUrl),
      resolvePlayerPhoto(file2, defaultPlayers[1].defaultPhotoUrl),
    ]);

    if (!photo1 || !photo2) {
      statusEl.textContent =
        "Faltan fotos por defecto. Verificá assets/delfi.jpg y assets/cata.jpg.";
      return;
    }

    players = [
      {
        name: name1El.value.trim() || defaultPlayers[0].name,
        mark: "X",
        photo: photo1,
      },
      {
        name: name2El.value.trim() || defaultPlayers[1].name,
        mark: "O",
        photo: photo2,
      },
    ];

    gameMode = modeSelectEl.value;
    board = Array(9).fill(null);
    currentPlayer = 0;
    selectedFaceIndex = 0;
    gameActive = true;
    hasLoadedPlayers = true;
    rematchBtn.disabled = true;
    createBoard();
    hideWinnerOverlay();
    setupFacePicker();
    renderScoreboard();
    updateTurnStatus();
  } catch (error) {
    statusEl.textContent = "Hubo un problema al leer las fotos.";
  }
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 0;
  selectedFaceIndex = 0;
  gameActive = false;
  hasLoadedPlayers = false;
  createBoard();
  hideWinnerOverlay();
  facePickerEl.classList.add("hidden");
  rematchBtn.disabled = true;
  statusEl.textContent = 'Tocá "Empezar partida" para jugar.';
}

function rematchGame() {
  if (!hasLoadedPlayers) return;

  board = Array(9).fill(null);
  currentPlayer = 0;
  selectedFaceIndex = 0;
  gameActive = true;
  gameMode = modeSelectEl.value;
  createBoard();
  hideWinnerOverlay();
  setupFacePicker();
  updateTurnStatus();
  rematchBtn.disabled = true;
}

faceChoice0El.addEventListener("click", () => {
  if (gameActive && isComplexMode()) setFaceChoice(0);
});

faceChoice1El.addEventListener("click", () => {
  if (gameActive && isComplexMode()) setFaceChoice(1);
});

startBtn.addEventListener("click", startGame);
rematchBtn.addEventListener("click", rematchGame);
resetBtn.addEventListener("click", resetGame);
clearScoreBtn.addEventListener("click", clearScore);
name1El.addEventListener("input", renderScoreboard);
name2El.addEventListener("input", renderScoreboard);

loadScore();
renderScoreboard();
createBoard();
