import dictionary from "./dictionary.js";
import targetWords from "./target-words.js";

const alertContainer = document.querySelector("[data-alert-container");
const guessGrid = document.querySelector("[data-guess-grid]");
const keyboard = document.querySelector("[data-keyboard");

const wordLength = 5;
const flipAnimationDuration = 500;
const danceAnimationDuration = 500;

const msStartDate = new Date(2022, 0, 1).getTime();
const msTodayDate = new Date().getTime();
const msOffset = msTodayDate - msStartDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];

startInteraction();

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyDown);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyDown);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }
}

function handleKeyDown(e) {
  if (e.key.match(/^[a-zA-Z]$/)) {
    pressKey(e.key);
    return;
  }

  if (e.key === "Delete" || e.key === "Backspace") {
    deleteKey();
    return;
  }

  if (e.key === "Enter") {
    submitGuess();
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();

  if (activeTiles.length < wordLength) {
    const nextTile = guessGrid.querySelector(":not([data-letter])");

    nextTile.dataset.state = "active";
    nextTile.dataset.letter = key;
    nextTile.textContent = key;
  }
  return;
}

function deleteKey() {
  const activeTiles = Array.from(getActiveTiles());

  if (activeTiles.length > 0) {
    const targetTile = activeTiles.slice(-1);

    delete targetTile[0].dataset.state;
    delete targetTile[0].dataset.letter;
    targetTile[0].textContent = "";
  }
  return;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  const theGuess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  if (activeTiles.length === 0) {
    showAlert("Type your guess");
    shakeTiles(Array.from(guessGrid.children).slice(0, 5));
    return;
  }

  if (activeTiles.length !== wordLength) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  if (!dictionary.includes(theGuess)) {
    showAlert("Not in the dictionary");
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, theGuess));
  return;
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");

  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);

  if (duration !== null) {
    setTimeout(() => {
      alert.classList.add("hide");
      alert.addEventListener("transitionend", () => {
        alert.remove();
      });
    }, duration);
  }
  return;
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener("animationend", () => {
      tile.classList.remove("shake");
    });
  });
}

function flipTile(tile, index, array, theGuess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);

  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * flipAnimationDuration) / 2);

  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");

    if (targetWord[index] === letter) {
      tile.dataset.state = "correct";
      key.classList.add("correct");
    } else if (targetWord.includes(letter)) {
      tile.dataset.state = "wrong-location";
      key.classList.add("wrong-location");
    } else {
      tile.dataset.state = "wrong";
      key.classList.add("wrong");
    }

    if (index === array.length - 1) {
      tile.addEventListener("transitionend", () => {
        startInteraction();
        checkWinLose(array, theGuess);
      });
    }
  });
}

function checkWinLose(tiles, theGuess) {
  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");

  if (theGuess === targetWord) {
    showAlert("You win", 5000);
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  if (remainingTiles.length === 0) {
    showAlert(`The answer is: ${targetWord.toUpperCase()}`, null);
    stopInteraction();
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener("animationend", () => {
        tile.classList.remove("dance");
      });
    }, (index * danceAnimationDuration) / 5);
  });
}
