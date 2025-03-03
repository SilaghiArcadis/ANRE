let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let startTime;
let timerInterval;
let isAnswering = false;
let wrongAnswers = []; // To store wrong answers

// Fetch questions from JSON
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = shuffleArray(data).slice(0, 25); // Pick 25 random questions
    })
    .catch(error => console.error('Error fetching questions:', error));

document.getElementById("start-btn").addEventListener("click", startQuiz);

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

function startQuiz() {
    document.getElementById("start-btn").classList.add("hidden");
    document.getElementById("question-container").classList.remove("hidden");
    startTimer();
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

    // Shuffle the answers
    let shuffledAnswers = shuffleArray([...questionData.answers]);

    // Store the value of the correct answer
    let correctAnswerValue = questionData.answers[questionData.correct];

    let answerButtons = [];
    shuffledAnswers.forEach(answer => {
        let answerBtn = document.createElement("div");
        answerBtn.classList.add("answer");
        answerBtn.textContent = answer;
        
        // Pass correctAnswerValue into checkAnswer
        answerBtn.onclick = () => checkAnswer(answer, correctAnswerValue, answerBtn, answerButtons, questionData);
        
        answerButtons.push(answerBtn);
        answersDiv.appendChild(answerBtn);
    });
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

    // Disable all buttons and add disabled class
    answerButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });

    // If the answer is correct
    if (selectedValue === correctValue) {
        correctCount++;
        document.getElementById("good-count").textContent = correctCount;
        answerBtn.classList.add("correct");
        setTimeout(nextQuestion, 1000);
    } else {
        wrongCount++;
        document.getElementById("wrong-count").textContent = wrongCount;
        answerBtn.classList.add("wrong");

        // Highlight the correct answer
        answerButtons.forEach(btn => {
            if (btn.textContent === correctValue) {
                btn.classList.add("correct");
            }
        });

        // Store the wrong answer with the selected and correct answer values
        wrongAnswers.push({
            question: questionData,  // Store the entire question object
            selectedAnswer: selectedValue,  // Store the selected answer value
            correctAnswer: correctValue  // Store the correct answer value
        });

        setTimeout(nextQuestion, 3000);  // Move to the next question after 3 seconds
    }
}

function showResults() {
    clearInterval(timerInterval);

    document.getElementById("question-container").classList.add("hidden");

    let isAdmis = correctCount >= 18;
    let resultMessage = isAdmis ? "ADMIS" : "RESPINS";
    let resultTitle = document.getElementById("result-title");
    resultTitle.textContent = resultMessage;
    resultTitle.style.color = isAdmis ? "#4CAF50" : "#FF4C4C";

    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("incorrect-count").textContent = wrongCount;
    let totalTime = document.getElementById("timer").textContent;
    document.getElementById("total-time").textContent = totalTime;

    // Show result container
    document.getElementById("result-container").classList.remove("hidden");

    // Show the "Review Answers" button only if there are wrong answers
    if (wrongAnswers.length > 0) {
        document.getElementById("review-btn").classList.remove("hidden"); // Show the review button
    }
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
    let answerData = wrongAnswers[index];  // Get the current wrong answer data

    // Show the question, selected answer, and correct answer
    reviewDiv.innerHTML = `
        <p><strong>${answerData.question.question}</strong></p>
        <p><strong>Raspunsul tau:</strong> <span class="wrong">${answerData.selectedAnswer}</span></p>
        <p><strong>Raspuns corect:</strong> <span class="correct">${answerData.correctAnswer}</span></p>
    `;

    // Update the current review index
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
