const M = 9;
const N = 7;
let gameOver = false;
let flagsCount = 0;
let cells;
let matrix = [];

const flagDiv = document.querySelector(".flag");
const colorsOfNumbers = [
  "rgb(0, 42, 255)",
  "rgb(255, 251, 0)",
  "red",
  "rgb(79, 141, 41)",
  "brown",
  "rgb(26, 18, 98)",
  "black",
  "rgb(127, 129, 131)",
];
const fieldContainer = document.querySelector(".fieldContainer");

startGame();

function startGame() {
  renderField(N);
  visited = initializeVisited(N);
  gameMatrix = generateGameMatrix(matrix, N);

  cells.forEach((element, index) => {
    element.addEventListener("click", () => leftClickHandler(element, index));
    element.flagVisible = false;
    element.addEventListener("contextmenu", rightClickHandler);
  });
}

function renderField(N) {
  flagDiv.innerHTML = `${M - flagsCount} 🚩`;

  fieldContainer.innerHTML = "";
  createMatrix(N);
  addBombsToMatrix(N);

  for (let i = 0; i < N ** 2; i++) {
    fieldContainer.innerHTML += `<div class='cell'></div>`;
  }
  fieldContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

  cells = document.querySelectorAll(".cell");
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.style.width = `calc(1.3*((40vw - (${N} + 2)*1vw) / ${N}))`;
    cell.style.height = `calc(1.3*((40vw - (${N} + 2)*1vw) / ${N}))`;
  });
}

function createMatrix(N) {
  matrix = Array.from(
    { length: N },
    (el) => (el = Array.from({ length: N }, (i) => (i = 0)))
  );
}

function addBombsToMatrix(N) {
  for (let i = 0; i < M; i++) {
    let randomPosition;
    do {
      randomPosition = Math.floor(Math.random() * N ** 2);
    } while (matrix[Math.floor(randomPosition / N)][randomPosition % N] === 1);

    matrix[Math.floor(randomPosition / N)][randomPosition % N] = 1;
  }
}

function generateGameMatrix(matrix, N) {
  const gameMatrix = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (matrix[i] && matrix[i][j] === 1) {
        gameMatrix[i][j] = -1;
        continue;
      }
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const ni = i + dx;
          const nj = j + dy;
          if (matrix[ni] && matrix[ni][nj] === 1) {
            gameMatrix[i][j]++;
          }
        }
      }
    }
  }

  return gameMatrix;
}

function rightClickHandler(event) {
  event.preventDefault();
  if (gameOver) {
    return;
  }
  if (!this.flagVisible && flagsCount === M) {
    return;
  }
  if (!this.flagVisible && flagsCount < M) {
    this.innerHTML = "<p>🚩</p>";
    this.flagVisible = true;
    flagsCount++;
  } else {
    this.innerHTML = "";
    this.flagVisible = false;
    flagsCount--;
  }

  flagDiv.innerHTML = `${M - flagsCount} 🚩`;
  if (checkWinner()) {
    return;
  }
}

function initializeVisited(N) {
  let visited = Array.from({ length: N }, () => Array(N).fill(false));
  return visited;
}

function leftClickHandler(element, index) {
  if (gameOver) {
    return;
  }
  const x = Math.floor(index / N);
  const y = index % N;

  if (cells[index].flagVisible) {
    return;
  }

  if (gameMatrix[x][y] === 0 && !visited[x][y]) {
    openNulls(gameMatrix, x, y, visited);
  } else if (gameMatrix[x][y] > 0 && !visited[x][y]) {
    visited[x][y] = true;
  }

  visited[x][y] = true;
  element.style.backgroundColor = "rgb(104, 86, 86)";

  if (gameMatrix[x][y] === -1 && visited[x][y]) {
    document.body.style.backgroundColor = "red";
    gameOver = true;

    cells.forEach((cell, cellIndex) => {
      const l = Math.floor(cellIndex / N);
      const k = cellIndex % N;

      if (gameMatrix[l][k] === -1) {
        cell.innerHTML = "<p>💣</p>";
        cell.style.backgroundColor = "rgb(104, 86, 86)";
      }
    });
  }

  cells.forEach((cell, cellIndex) => {
    const i = Math.floor(cellIndex / N);
    const j = cellIndex % N;

    if (visited[i][j]) {
      cell.style.backgroundColor = "rgb(104, 86, 86)";
    }

    if (gameMatrix[i][j] !== 0 && visited[i][j] && cell.innerHTML === "") {
      const number = gameMatrix[i][j];
      cell.innerHTML += `<p>${number}</p>`;
      const color = colorsOfNumbers[number - 1];
      cell.style.color = color;
    }
  });
  if (checkWinner()) {
    return;
  }
}

function openNulls(matrix, x, y, visited) {
  if (
    x < 0 ||
    x >= matrix.length ||
    y < 0 ||
    y >= matrix[x].length ||
    visited[x][y] ||
    matrix[x][y] !== 0
  ) {
    return;
  }

  if (matrix[x][y] === 0 && !this.flagVisible) {
    visited[x][y] = true;
    openNulls(matrix, x - 1, y, visited);
    openNulls(matrix, x + 1, y, visited);
    openNulls(matrix, x, y - 1, visited);
    openNulls(matrix, x, y + 1, visited);
  } else if (matrix[x][y] > 0 && !this.flagVisible) {
    visited[x][y] = true;
  }
}

function checkWinner() {
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (gameMatrix[i][j] === -1 && !cells[i * N + j].flagVisible) {
        return false;
      }
      if (gameMatrix[i][j] !== -1 && !visited[i][j]) {
        return false;
      }
    }
  }
  document.body.style.backgroundColor = "rgb(106, 255, 0)";
  return true;
}
