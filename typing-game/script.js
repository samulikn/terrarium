; (function () {
    // all of our quotes
    const quotes = [
        'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
        'There is nothing more deceptive than an obvious fact.',
        'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
        'I never make exceptions. An exception disproves the rule.',
        'What one man can invent another can discover.',
        'Nothing clears up a case so much as stating it to another person.',
        'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
        'Hello world.',
    ];
    // store the list of words and the index of the word the player is currently typing
    let words = [];
    let wordIndex = 0;
    // the starting time
    let startTime = Date.now();
    // length of quote
    let quoteLenght = 0;
    let storageQuote = '';
    let elapsedTime = 0;
    let savedMaxScore = 0;
    // page elements
    const quoteElement = document.getElementById('quote');
    const messageElement = document.getElementById('message');
    const typedValueElement = document.getElementById('typed-value');
    const modal = document.getElementById('modalBox');
    const closeBtn = document.getElementsByClassName('close')[0];
    const startGame = document.getElementById('start');

    function populateLocalStorage(storageQuote, elapsedTime) {
        localStorage.setItem(storageQuote, elapsedTime);
    }

    // start the game
    startGame.addEventListener('click', () => {

        // get a quote
        const quoteIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[quoteIndex];

        // Put the quote into an array of words
        words = quote.split(' ');
        // reset the word index for tracking
        wordIndex = 0;

        // UI updates
        // Create an array of span elements so we can set a class
        const spanWords = words.map(function (word) { return `<span>${word} </span>` });
        // Convert into string and set as innerHTML on quote display
        quoteElement.innerHTML = spanWords.join('');
        // Highlight the first word
        quoteElement.childNodes[0].className = 'highlight';

        // Enable the input block
        typedValueElement.style.display = 'block';
        typedValueElement.disabled = false;

        // Clear any prior messages
        messageElement.innerText = '';

        // Setup the textbox
        // Clear the textbox
        typedValueElement.value = '';
        // set focus
        typedValueElement.focus();
        // set the event handler
        typedValueElement.className = ''

        // Start the timer
        startTime = new Date().getTime();
    });

    typedValueElement.addEventListener('input', () => {
        // Get the current word
        const currentWord = words[wordIndex];
        // get the current value
        const typedValue = typedValueElement.value;

        // end of sentence
        if (typedValue === currentWord && wordIndex === words.length - 1) {

            // Display success
            elapsedTime = (new Date().getTime() - startTime) / 1000;
            let message = `You finished in ${elapsedTime} seconds.`;
            storageQuote = 'maxScoreForQuoteLength-' + quoteLenght;
            typedValueElement.disabled = true;
            savedMaxScore = localStorage.getItem(storageQuote);

            // collect max score in local storage
            if (!localStorage.getItem(storageQuote)) {
                // populate storage
                populateLocalStorage(storageQuote, elapsedTime);
            }
            else if (savedMaxScore > elapsedTime) {
                // update storage
                populateLocalStorage(storageQuote, elapsedTime);
                message = message + '\n You recorded the MAX score!';
            };
            messageElement.innerText = message;

            // Modal box for congratulations
            // Open modal box
            modal.style.display = 'block';

        } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
            // end of word
            // clear the typedValueElement for the next word
            typedValueElement.value = '';
            // move to the next word
            wordIndex++;
            // reset the class name for all elements in quote
            for (const wordElement of quoteElement.childNodes) {
                wordElement.className = '';
            }
            // highlight the new word
            quoteElement.childNodes[wordIndex].className = 'highlight';
        } else if (currentWord.startsWith(typedValue)) {
            // currently correct
            // highlight the next word
            typedValueElement.className = '';
        } else {
            // error state
            typedValueElement.className = 'error';
        }
    });

    closeBtn.onclick = closeModal;

    // When the user clicks on <span> (x), close the modal
    function closeModal() {
        modal.style.display = 'none';
        typedValueElement.style.display = 'none';
        startGame.focus();
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    };

    //When user press Esc key, close the modal
    document.addEventListener('keydown', (event) => {
        if (event.code == 'Escape') {
            closeModal();
        }
    });
})()