let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let startTime;
let timerInterval;
let isAnswering = false;
let wrongAnswers = []; // To store wrong answers
let chapter1Questions = [];
let chapter2Questions = [];
let chapter3Questions = [];
let allQuestions = [];


// Utility function to pick distinct random elements from an array
function pickDistinctRandomQuestions(array, count) {
    if (count > array.length) {
        return "Error: Cannot pick more questions than available.";
    }
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

fetch("chapter1.json")
    .then(response => response.json())
    .then(data => {
        chapter1FullData = data; // Store the full dataset
    })
    .catch(error => console.error('Error fetching chapter1:', error));

fetch("chapter2.json")
    .then(response => response.json())
    .then(data => {
        chapter2FullData = data; // Store the full dataset
    })
    .catch(error => console.error('Error fetching chapter2:', error));

fetch("chapter3.json")
    .then(response => response.json())
    .then(data => {
        chapter3FullData = data; // Store the full dataset
    })
    .catch(error => console.error('Error fetching chapter3:', error));

fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        allFullData = data; // Store the full dataset
    })
    .catch(error => console.error('Error fetching questions:', error));


    document.getElementById("chapter1-btn").addEventListener("click", () => startQuiz(chapter1FullData));
    document.getElementById("chapter2-btn").addEventListener("click", () => startQuiz(chapter2FullData));
    document.getElementById("chapter3-btn").addEventListener("click", () => startQuiz(chapter3FullData));
    document.getElementById("start-btn").addEventListener("click", () => startQuiz(allFullData));
    document.getElementById('history-button').addEventListener('click', function() {
        window.location.href = 'history.html'; // Navigate to history.html
    });
    
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    function updateTimer() {
        let elapsed = Math.floor((new Date() - startTime) / 1000);
        let hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        let minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
        let seconds = String(elapsed % 60).padStart(2, "0");
    
        document.getElementById("timer").textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    function startQuiz(fullQuestionSet) {
        // Select a new set of 35 distinct random questions each time
        const selectedQuestions = pickDistinctRandomQuestions(fullQuestionSet, 35);
        if (typeof selectedQuestions === 'string' && selectedQuestions.startsWith("Error")) {
            console.error(selectedQuestions);
            return; // Handle the error appropriately
        }
        questions = selectedQuestions;
        currentQuestionIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        isAnswering = false;
        wrongAnswers = [];
    
        document.getElementById("chapter1-btn").classList.add("hidden");
        document.getElementById("chapter2-btn").classList.add("hidden");
        document.getElementById("chapter3-btn").classList.add("hidden");
        document.getElementById("start-btn").classList.add("hidden");
        document.getElementById('history-button').classList.add('hidden');
        document.getElementById("floating-bar").classList.remove("hidden"); // Shows floating bar
    
        document.getElementById("question-container").classList.remove("hidden");
        displayQuestion();
    }
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    let questionData = questions[currentQuestionIndex];
    let questionDiv = document.getElementById("question");
    let answersDiv = document.getElementById("answers");
    let imageContainer = document.getElementById("image-container");

    questionDiv.innerHTML = `<strong>${currentQuestionIndex + 1}. </strong>${questionData.question}`;
    answersDiv.innerHTML = "";
    imageContainer.innerHTML = "";

    if (questionData.image) {
        let img = document.createElement("img");
        img.src = questionData.image;
        img.style.maxWidth = "100%";
        imageContainer.appendChild(img);
    }

    let shuffledAnswers = shuffleArray([...questionData.answers]);
    let correctAnswerValue = questionData.answers[questionData.correct];

    let answerButtons = [];
    shuffledAnswers.forEach(answer => {
        let answerBtn = document.createElement("div");
        answerBtn.classList.add("answer");

        if (typeof answer === "object" && (answer.image || answer.text)) {
            // Răspuns cu imagine și/sau text
            if (answer.image) {
                let img = document.createElement("img");
                img.src = answer.image;
                img.alt = answer.text || "Answer Image";
                img.classList.add("answer-image");
                answerBtn.appendChild(img);
            }
            if (answer.text) {
                let p = document.createElement("p");
                p.textContent = answer.text;
                answerBtn.appendChild(p);
            }
        } else {
            // Răspuns text simplu
            let p = document.createElement("p");
            p.textContent = answer;
            answerBtn.appendChild(p);
        }

        answerBtn.onclick = () => checkAnswer(answer, correctAnswerValue, answerBtn, answerButtons, questionData);
        answerButtons.push(answerBtn);
        answersDiv.appendChild(answerBtn);
    });
    let questionContainer = document.getElementById("question-container");
    questionContainer.scrollTo({ top: 0, behavior: "smooth" }); // smooth scrolling effect
}
function nextQuestion() {
    currentQuestionIndex++;
    isAnswering = false;
    displayQuestion();
}

// Check the answer selected by the user
function checkAnswer(selectedValue, correctValue, answerBtn, answerButtons, questionData) {
    if (isAnswering) return;

    isAnswering = true;

    // Dezactivează toate butoanele
    answerButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });

    let isCorrect = JSON.stringify(selectedValue) === JSON.stringify(correctValue);


    if (isCorrect) {
        correctCount++;
        document.getElementById("good-count").textContent = correctCount;
        answerBtn.classList.add("correct"); // Evidențiază răspunsul selectat ca fiind corect
        setTimeout(nextQuestion, 1000);
    } else {
        wrongCount++;
        document.getElementById("wrong-count").textContent = wrongCount;
        answerBtn.classList.add("wrong"); // Evidențiază răspunsul greșit

        // Evidențiază răspunsul corect
        answerButtons.forEach(btn => {
            let btnText = null;
            let btnImage = null;

            // Verifică dacă butonul conține text (căutând tag-ul <p>)
            const textElement = btn.querySelector("p");
            if (textElement) {
                btnText = textElement.textContent.trim();
            }

            // Verifică dacă butonul conține o imagine (căutând tag-ul <img>)
            const imageElement = btn.querySelector("img");
            if (imageElement) {
                btnImage = imageElement.src;
            }


            // Determină valorile corecte pentru text și imagine
            let correctText = typeof correctValue === "object" ? correctValue.text : correctValue;
            let correctImage = typeof correctValue === "object" && correctValue.image ? correctValue.image : null;


            // Verifică dacă butonul se potrivește cu răspunsul corect
            let isTextMatch = btnText && btnText === correctText;
            let isImageMatch = btnImage && btnImage.includes(correctImage);

            // Evidențiază doar răspunsul corect
            if (typeof correctValue === "object") { // Răspunsul corect este un obiect
                if (isTextMatch || isImageMatch) {
                    btn.classList.add("correct");
                }
            } else { // Răspunsul corect este un șir de text
                if (btnText === correctValue) {
                    btn.classList.add("correct");
                }
            }
        });

        // Stochează răspunsul greșit pentru revizuire
        wrongAnswers.push({
            question: questionData,
            selectedAnswer: selectedValue,
            correctAnswer: correctValue
        });

        setTimeout(nextQuestion, 3000); // Întârziere pentru a afișa răspunsul corect
    }
}
function showResults() {
    clearInterval(timerInterval);

    document.getElementById("question-container").classList.add("hidden");
    document.getElementById("floating-bar").classList.add("hidden"); // Hides the floating bar

    let isAdmis = correctCount >= 25;
    let resultMessage = isAdmis ? "ADMIS" : "RESPINS";
    let resultTitle = document.getElementById("result-title");
    resultTitle.textContent = resultMessage;
    resultTitle.style.color = isAdmis ? "#4CAF50" : "#FF4C4C";

    let success = correctCount >= 25;

    let quizData = {
        category: getCategoryName(),
        success: success,
        correctCount: correctCount,
        wrongCount: wrongCount,
        time: document.getElementById("timer").textContent
    };

    saveQuizHistory(quizData);

    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("incorrect-count").textContent = wrongCount;
    let totalTime = document.getElementById("timer").textContent;
    document.getElementById("total-time").textContent = totalTime;

    // Show result container
    document.getElementById("result-container").classList.remove("hidden");

    // Show the "Review Answers" button only if there are wrong answers
    if (wrongAnswers.length > 0) {
        document.getElementById("review-btn").classList.remove("hidden");
    }
}

function saveQuizHistory(quizData) {
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(quizData);
    localStorage.setItem("quizHistory", JSON.stringify(history));
}

function getCategoryName() {
    if(questions === chapter1Questions) return "Legislație";
    if(questions === chapter2Questions) return "Electrotehnică";
    if(questions === chapter3Questions) return "Norme tehnice";
    if(questions === allQuestions) return "Test final ANRE";
    return "Unknown Category";
}

// Review Wrong Answers
document.getElementById("review-btn").addEventListener("click", function() {
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("review-container").classList.remove("hidden");
    displayReviewAnswer(0); // Show first wrong answer
});

// Restart the quiz by reloading the page
function restartQuiz() {
    location.reload(); // Refreshes the entire page
}

document.getElementById("restart-btn").addEventListener("click", restartQuiz); // Result page restart
document.getElementById("restart-review-btn").addEventListener("click", restartQuiz); // Review page restart

// Review Buttons Navigation (Next, Previous)
let currentReviewIndex = 0;

// Display the review for the wrong answers
function displayReviewAnswer(index) {
    let reviewDiv = document.getElementById("review-answer");
    let answerData = wrongAnswers[index]; // Get the current wrong answer data

    // Helper to format answers (supports both objects and plain text answers)
    const formatAnswer = (answer, isCorrect, questionImage) => {
        let text = typeof answer === "object" ? answer.text : answer; // Get text whether it's an object or string
        let image = typeof answer === "object" && answer.image ? `<img src="${answer.image}" alt="${text}" class="answer-image">` : "";
        let highlightClass = isCorrect ? "correct" : "wrong";

        return `
            <div class="answer-section">
                ${image}
                <div class="answer-text ${highlightClass}">${text}</div>
            </div>
        `;
    };

    // Get the question image (if any)
    let questionImage = answerData.question.image;

    // Display question and answers with correct colors
    reviewDiv.innerHTML = `
        <h3>${answerData.question.question}</h3>
        ${questionImage ? `<img src="${questionImage}" alt="Question Image" class="answer-image">` : ''}

        <div class="answer-block">
            <p><strong>Raspunsul tau:</strong></p>
            ${formatAnswer(answerData.selectedAnswer, false, questionImage)}
        </div>

        <div class="answer-block">
            <p><strong>Raspuns corect:</strong></p>
            ${formatAnswer(answerData.correctAnswer, true, questionImage)}
        </div>
    `;

     // Reset scroll to top
     reviewDiv.scrollTo({ top: 0, behavior: "smooth" });

    currentReviewIndex = index;
    updateNavigationButtons();
}





// Update the navigation buttons (Next, Previous)
function updateNavigationButtons() {
    // Disable the Previous button if we're at the start
    document.getElementById("previous-btn").disabled = currentReviewIndex === 0;
    // Disable the Next button if we're at the last wrong answer
    document.getElementById("next-btn").disabled = currentReviewIndex === wrongAnswers.length - 1;
}

// Event listeners for the Previous and Next buttons
document.getElementById("previous-btn")?.addEventListener("click", function() {
    if (currentReviewIndex > 0) {
        displayReviewAnswer(currentReviewIndex - 1);
    }
});

document.getElementById("next-btn")?.addEventListener("click", function() {
    if (currentReviewIndex < wrongAnswers.length - 1) {
        displayReviewAnswer(currentReviewIndex + 1);
    }
});

// Utility: Shuffle array function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);

    
}