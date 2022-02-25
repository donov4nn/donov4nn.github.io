import "./style.css";

let tries,
  wordLength,
  attempt,
  grid,
  currentWord,
  responseWord,
  checkWord,
  input;
const gridContainer = document.querySelector(".grid");

const appendToDiv = (divTo, className) => {
  const div = document.createElement("div");
  div.classList.add(className);
  divTo.appendChild(div);
  return div;
};

const getRandomWord = async () => {
  const allWords = (await (await fetch("liste.json")).json()).words.filter(
    (w) => w.length === wordLength
  );
  return allWords[(allWords.length * Math.random()) | 0]
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const waitForEnter = () =>
  new Promise(async (resolve) => {
    document.addEventListener("keydown", onKeyHandler);
    function onKeyHandler(e) {
      if (e.keyCode === 13) {
        document.removeEventListener("keydown", onKeyHandler);
        resolve();
      }
    }
  });

const displayMsgAndInit = async (msg) => {
  const p = document.createElement("p");
  p.appendChild(
    document.createTextNode(msg + " (appuyez sur entrée pour continuer)")
  );
  gridContainer.appendChild(p);
  await waitForEnter();
  await initGrid();
};

const initGrid = async () => {
  gridContainer.innerHTML = "";
  currentWord = "";
  tries = 5;
  wordLength = 5;
  attempt = 0;
  grid = [...Array(tries)].map(() => Array(wordLength));

  for (let lineIndex = 0; lineIndex < tries; lineIndex += 1) {
    const line = appendToDiv(gridContainer, "line");
    for (let letterIndex = 0; letterIndex < wordLength; letterIndex += 1) {
      grid[lineIndex][letterIndex] = appendToDiv(line, "case");
    }
  }

  responseWord = checkWord = await getRandomWord();
  console.log(responseWord);

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    input = document.createElement("input");
    input.setAttribute("id", "word");
    input.setAttribute("maxlength", "5");
    input.addEventListener(
      "input",
      ({ target }) => (target.value = target.value.toUpperCase())
    );
    gridContainer.insertBefore(input, gridContainer.firstChild);
  }
};

const handleKeyPress = async (event) => {
  if (
    ((event.key >= "a" && event.key <= "z") ||
      (input?.value >= "a" && input?.value <= "z")) &&
    currentWord.length < wordLength
  ) {
    const letter = event.key.toUpperCase();
    currentWord += letter;
    grid[attempt][currentWord.length - 1].appendChild(
      document.createTextNode(letter)
    );
    return;
  }

  if (
    event.keyCode !== 13 ||
    currentWord.length !== wordLength ||
    currentWord.includes(" ")
  )
    return;

  if (attempt === tries - 1)
    setTimeout(async () => await displayMsgAndInit(responseWord), 100);

  for (let letterIndex = 0; letterIndex < wordLength; letterIndex += 1) {
    const caseDiv = grid[attempt][letterIndex];
    let color = "";
    if (checkWord[letterIndex] === currentWord[letterIndex]) {
      color = "correct";
      const newCheckWord = checkWord.split("");
      newCheckWord[letterIndex] = " ";
      checkWord = newCheckWord.join("");
    } else if (
      checkWord.includes(currentWord[letterIndex]) &&
      checkWord[checkWord.indexOf(currentWord[letterIndex])] !==
        currentWord[checkWord.indexOf(currentWord[letterIndex])]
    )
      color = "present";
    else color = "absent";
    caseDiv.classList.add(color);
  }

  if (currentWord == responseWord)
    setTimeout(async () => await displayMsgAndInit("Bravo !"), 100);

  attempt += 1;
  checkWord = responseWord;
  currentWord = "";
  if (input) input.value = "";
};

document.addEventListener("DOMContentLoaded", initGrid);
document.addEventListener("keypress", handleKeyPress);
document.addEventListener("keyup", (event) => {
  if (event.keyCode === 8 && currentWord.length > 0) {
    currentWord = currentWord.slice(0, -1);
    grid[attempt][currentWord.length].innerHTML = "";
  }
});
