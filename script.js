let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let startTime;
let timerInterval;

// Fetch questions from JSON
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = shuffleArray(data).slice(0, 25); // Pick 25 random questions
    })
    .catch(error => console.error('Error fetching questions:', error)); // Added error handling for fetch

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
        showResults(); // Show the results if all questions are answered
        return;
    }

    let questionData = questions[currentQuestionIndex];
    let questionDiv = document.getElementById("question");
    let answersDiv = document.getElementById("answers");
    let imageContainer = document.getElementById("image-container"); // Image container outside the answer box

    // Clear previous content
    questionDiv.innerHTML = `<strong>${currentQuestionIndex + 1}. </strong>${questionData.question}`;
    answersDiv.innerHTML = "";
    imageContainer.innerHTML = ""; // Clear any previously displayed image

    // If the question has an associated image, display it in the image container
    if (questionData.image) {
        let img = document.createElement("img");
        img.src = questionData.image;
        img.style.maxWidth = "100%";
        imageContainer.appendChild(img); // Append image outside of the answer box
    }

    // Shuffle answers for randomness
    let shuffledAnswers = shuffleArray([...questionData.answers]);

    // Find the new index of the correct answer after shuffling
    let correctAnswerIndex = shuffledAnswers.indexOf(questionData.answers[questionData.correct]);

    // Display the shuffled answers
    shuffledAnswers.forEach((answer, index) => {
        let answerBtn = document.createElement("div");
        answerBtn.classList.add("answer");
        answerBtn.textContent = answer;

        // Check if this answer is the correct one based on its new index
        answerBtn.onclick = () => checkAnswer(index, correctAnswerIndex, answerBtn);
        answersDiv.appendChild(answerBtn);
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}
function checkAnswer(selected, correct, answerBtn) {
    let answersDiv = document.getElementById("answers");
    let answerButtons = answersDiv.querySelectorAll('.answer');

    if (selected === correct) {
        correctCount++;
        document.getElementById("good-count").textContent = correctCount;
        answerBtn.classList.add("correct");
        setTimeout(nextQuestion, 1000); // 1s delay for correct answers
    } else {
        wrongCount++;
        document.getElementById("wrong-count").textContent = wrongCount;
        answerBtn.classList.add("wrong");

        // Highlight the correct answer
        answerButtons.forEach((btn, index) => {
            if (index === correct) {
                btn.classList.add("correct");
            }
        });

        setTimeout(nextQuestion, 3000); // 3s delay for incorrect answers
    }
}
function showResults() {
    clearInterval(timerInterval); // Stop the timer

    // Hide the quiz container
    document.getElementById("question-container").classList.add("hidden");

    // Determine if "ADMIS" or "RESPINS"
    let isAdmis = correctCount >= 18;
    let resultMessage = isAdmis ? "ADMIS" : "RESPINS";

    // Set the result title and color
    let resultTitle = document.getElementById("result-title");
    resultTitle.textContent = resultMessage;
    resultTitle.style.color = isAdmis ? "#4CAF50" : "#FF4C4C";

    // Update the counts and total time
    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("incorrect-count").textContent = wrongCount;
    let totalTime = document.getElementById("timer").textContent;
    document.getElementById("total-time").textContent = totalTime;

    // Show the result container
    document.getElementById("result-container").classList.remove("hidden");
}


// Restart the quiz
document.getElementById("restart-btn").addEventListener("click", function() {
    // Reset counters and timer
    correctCount = 0;
    wrongCount = 0;
    currentQuestionIndex = 0;
    document.getElementById("good-count").textContent = 0;
    document.getElementById("wrong-count").textContent = 0;
    document.getElementById("timer").textContent = "00:00:00";

    // Hide result container and show the quiz container
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("question-container").classList.remove("hidden");

    // Start a new quiz
    startQuiz();
});

// Utility: Shuffle array function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
