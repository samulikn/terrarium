(function () {
  // all of our quotes
  const quotes = [
    "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
    "There is nothing more deceptive than an obvious fact.",
    "I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.",
    "I never make exceptions. An exception disproves the rule.",
    "What one man can invent another can discover.",
    "Nothing clears up a case so much as stating it to another person.",
    "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
  ];
  let words = [];
  let wordIndex = 0;
  let startTime = Date.now();
  let quoteLenght = 0;
  const quoteElement = document.getElementById("quote");
  const messageElement = document.getElementById("message");
  const typedValueElement = document.getElementById("typed-value");
  const modal = document.getElementById("modalBox");
  const closeBtn = document.getElementsByClassName("close")[0];
  const startGame = document.getElementById("start");

  // start the game
  startGame.addEventListener("click", () => {
    const quote = pickRandom(quotes);
    quoteLenght = quote.length;
    words = quote.split(" ");
    wordIndex = 0;
    quoteElement.innerHTML = spanWords(words);

    highlightWord(wordIndex);
    prepareInputBoxForTyping();

    startTime = new Date().getTime();
  });

  typedValueElement.addEventListener("input", () => {
    const currentWord = words[wordIndex];
    const typedValue = typedValueElement.value;

    const typedLastWord =
      typedValue === currentWord && wordIndex === words.length - 1;
    const finishedTypingWord =
      typedValue.endsWith(" ") && typedValue.trim() === currentWord;
    const correctTyping = currentWord.startsWith(typedValue);

    if (typedLastWord) {
      const elapsedTime = new Date().getTime() - startTime;
      const elapsedTimeInSec = elapsedTime / 1000;

      let message = `You finished in ${elapsedTimeInSec} seconds.`;
      let storageQuote = "maxScoreForQuoteLength-" + quoteLenght;

      typedValueElement.disabled = true;

      if (overridesPreviousTime(storageQuote, elapsedTimeInSec)) {
        message = message + "\n You recorded the MAX score!";
      }

      messageElement.innerText = message;

      // Modal box for congratulations
      modal.style.display = "block";
    } else if (finishedTypingWord) {
      clearTypedValue();
      wordIndex++;
      for (const wordElement of quoteElement.childNodes) {
        wordElement.className = "";
      }
      highlightWord(wordIndex);
    } else if (correctTyping) {
      clearClass();
    } else {
      setErrorClass();
    }
  });

  closeBtn.onclick = closeModal;

  // When the user clicks anywhere outside of the modal content, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  //When user press Esc key, close the modal
  document.addEventListener("keydown", (event) => {
    if (event.code == "Escape") {
      closeModal();
    }
  });

  function pickRandom(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  function spanWords(words) {
    return words.map((word) => `<span>${word} </span>`).join("");
  }

  function overridesPreviousTime(storageQuote, elapsedTimeInSec) {
    const previousTime = localStorage.getItem(storageQuote);
    if (!previousTime || previousTime > elapsedTimeInSec) {
      localStorage.setItem(storageQuote, elapsedTimeInSec);
      return true;
    }
    return false;
  }

  function prepareInputBoxForTyping() {
    typedValueElement.style.display = "block";
    typedValueElement.disabled = false;
    messageElement.innerText = "";
    clearTypedValue();
    typedValueElement.focus();
    clearClass();
  }

  function highlightWord(i) {
    quoteElement.childNodes[i].className = "highlight";
  }

  function clearTypedValue() {
    typedValueElement.value = "";
  }

  function clearClass() {
    typedValueElement.className = "";
  }

  function setErrorClass() {
    typedValueElement.className = "error";
  }

  function closeModal() {
    modal.style.display = "none";
    typedValueElement.style.display = "none";
    startGame.focus();
  }
})();
