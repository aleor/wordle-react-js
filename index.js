'use strict';

let wordList = [
  'patio',
  'darts',
  'piano',
  'horse',
  'hello',
  'water',
  'pizza',
  'sushi',
  'crabs',
];

let randomIndex = Math.floor(Math.random() * wordList.length);
let secret = wordList[0];

let history = [];
let currentAttempt = '';

let GRAY = '#212121';
let LIGHTGRAY = '#888';
let GREEN = '#538d4e';
let YELLOW = '#b59f3b';
let BLACK = '#111';

function buildGrid() {
  for (let i = 0; i < 6; i++) {
    let row = document.createElement('div');
    for (let j = 0; j < 5; j++) {
      let cell = document.createElement('div');
      cell.className = 'cell';
      let front = document.createElement('div');
      front.className = 'front';
      let back = document.createElement('div');
      back.className = 'back';
      let surface = document.createElement('div');
      surface.className = 'surface';
      surface.style.transitionDelay = j * 300 + 'ms';
      surface.appendChild(front);
      surface.appendChild(back);

      cell.appendChild(surface);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function buildKeyboardRow(letters, isLastRow) {
  let row = document.createElement('div');

  if (isLastRow) {
    let button = document.createElement('button');
    button.textContent = 'Enter';
    button.style.backgroundColor = LIGHTGRAY;
    button.onclick = () => handleKey('Enter');

    row.appendChild(button);
  }

  for (let letter of letters) {
    let button = document.createElement('button');
    button.textContent = letter;
    button.style.backgroundColor = LIGHTGRAY;
    button.onclick = () => handleKey(letter);
    keyboardButtons.set(letter, button);

    row.appendChild(button);
  }

  if (isLastRow) {
    let button = document.createElement('button');
    button.textContent = '<-';
    button.style.backgroundColor = LIGHTGRAY;
    button.onclick = () => handleKey('Backspace');

    row.appendChild(button);
  }

  keyboard.appendChild(row);
}

function buildKeyboard() {
  buildKeyboardRow('qwertyuiop', false);
  buildKeyboardRow('asdfghjkl', false);
  buildKeyboardRow('zxcvbnm', true);
}

function updateGrid() {
  for (let i = 0; i < 6; i++) {
    let row = grid.children[i];
    if (i < history.length) {
      drawAttempt(row, history[i], true);
    } else if (i === history.length) {
      drawAttempt(row, currentAttempt, false);
    } else {
      drawAttempt(row, '', false);
    }
  }
}

function drawAttempt(row, attempt, solved) {
  for (let i = 0; i < 5; i++) {
    let cell = row.children[i];
    let surface = cell.firstChild;
    let front = surface.children[0];
    let back = surface.children[1];

    front.textContent = attempt[i] ? attempt[i] : '';
    back.textContent = attempt[i] ? attempt[i] : '';

    if (attempt[i] == undefined) {
      front.innerHTML = '<div style="opacity: 0">X</div>';
      back.innerHTML = '<div style="opacity: 0">X</div>';
      clearAnimation(cell);
    }

    front.style.backgroundColor = BLACK;
    front.style.borderColor = attempt[i] ? '#666' : '';

    back.style.backgroundColor = getBgColor(attempt, i);
    back.style.borderColor = getBgColor(attempt, i);

    if (solved) {
      cell.classList.add('solved');
    } else {
      cell.classList.remove('solved');
    }
  }
}

function getBgColor(attempt, i) {
  let correctLetter = secret[i];
  let attemptLetter = attempt[i];

  if (!attemptLetter || !attempt.includes(correctLetter)) {
    return GRAY;
  }

  if (attemptLetter === correctLetter) {
    return GREEN;
  }

  return YELLOW;
}

function handleKeyDown(e) {
  if (e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }

  handleKey(e.key);
}

function handleKey(key) {
  if (isAnimating) return;

  if (history.length === 6) {
    return;
  }

  let letter = key.toLowerCase();
  if (letter === 'enter') {
    if (currentAttempt?.length < 5) {
      return;
    }

    if (!wordList.includes(currentAttempt)) {
      alert('Not in the dictionary');
      return;
    }

    history.push(currentAttempt);
    updateKeyboard();
    saveGame();

    if (currentAttempt === secret) {
      alert('You win!');
      return;
    }
    currentAttempt = '';
    pauseInput();
  } else if (letter === 'backspace') {
    currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1);
  } else if (/^[a-z]$/.test(letter)) {
    if (currentAttempt.length < 5) {
      currentAttempt += letter;
      animatePress(currentAttempt.length - 1);
    }
  }
  updateGrid();

  if (history.length === 6 && currentAttempt !== secret) {
    setTimeout(() => alert(secret), 0);
  }
}

let isAnimating = false;
function pauseInput() {
  if (isAnimating) throw Error('Should not happen');
  isAnimating = true;
  setTimeout(() => {
    isAnimating = false;
  }, 1800);
}

function animatePress(index) {
  let rowIndex = history.length;
  let row = grid.children[rowIndex];
  let cell = row.children[index];
  cell.style.animationName = 'press';
  cell.style.animationDuration = '0.1s';
  cell.style.animationTimingFunction = 'ease-out';
}

function clearAnimation(cell) {
  cell.style.animationName = '';
  cell.style.animationDuration = '';
  cell.style.animationTimingFunction = '';
}

function getBetterColor(a, b) {
  if (a === GREEN || b === GREEN) {
    return GREEN;
  }

  if (a === YELLOW || b === YELLOW) {
    return YELLOW;
  }

  return GRAY;
}

function updateKeyboard() {
  let bestColors = new Map();

  for (let attempt of history) {
    for (let i = 0; i < 5; i++) {
      let color = getBgColor(attempt, i);
      let bestColor = bestColors.get(attempt[i]);
      bestColors.set(attempt[i], getBetterColor(color, bestColor));
    }
  }

  for (let [key, button] of keyboardButtons) {
    button.style.backgroundColor = bestColors.get(key);
    button.style.borderColor = bestColors.get(key);
  }
}

function loadGame() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem('data'));
  } catch {}

  if (data) {
    if (data.secret.toLowerCase() === secret.toLowerCase()) {
      history = data.history;
    }
  }
}

function saveGame() {
  let data = JSON.stringify({
    secret,
    history,
  });

  console.log(data);

  try {
    localStorage.setItem('data', data);
  } catch {}
}

let grid = document.getElementById('grid');
let keyboard = document.getElementById('keyboard');
let keyboardButtons = new Map();

loadGame();
buildGrid();
buildKeyboard();
updateGrid();
window.addEventListener('keydown', handleKeyDown);
