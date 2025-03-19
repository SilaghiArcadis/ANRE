document.addEventListener('DOMContentLoaded', function() {
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    let historyDiv = document.getElementById("quiz-history");
    let categoryFilter = document.getElementById("category-filter");
    let successRateDisplay = document.getElementById("success-rate");

    function getCategoryColor(category) {
        switch (category) {
            case "Legislație": return "#FFFF00"; // Yellow
            case "Electrotehnică": return "#00FF00"; // Green Lime
            case "Norme tehnice": return "#FF00FF"; // Violet
            case "Test final ANRE": return "#4CAF50"; // Green Army
            default: return "#888";
        }
    }

    function displayHistory(filteredHistory) {
        if (filteredHistory.length === 0) {
            historyDiv.innerHTML = "<p>Încă nu există un istoric.</p>";
            successRateDisplay.textContent = "";
            return;
        }

        let historyHTML = "<table><tbody>";
        filteredHistory.forEach((quiz, index) => {
            historyHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="background-color: ${getCategoryColor(quiz.category)};">${quiz.category}</td>
                    <td>${quiz.success ? "Admis" : "Respins"}</td>
                    <td style="color: green;">${quiz.correctCount}</td>
                    <td style="color: red;">${quiz.wrongCount}</td>
                    <td>${quiz.time}</td>
                </tr>
            `;
        });
        historyHTML += "</tbody></table>";
        historyDiv.innerHTML = historyHTML;

        // Calculate and display success rate
        let successCount = filteredHistory.filter(quiz => quiz.success).length;
        let rate = (filteredHistory.length > 0) ? ((successCount / filteredHistory.length) * 100).toFixed(2) : 0;
        successRateDisplay.textContent = `Rata de succes: ${rate}% `;
    }

    function filterHistory(category) {
        if (category === "all") {
            displayHistory(history);
        } else {
            let filteredHistory = history.filter(quiz => quiz.category === category);
            displayHistory(filteredHistory);
        }
    }

    // Initial display
    filterHistory(categoryFilter.value);

    // Filter change event listener
    categoryFilter.addEventListener("change", function() {
        filterHistory(this.value);
    });

    // Function to generate and save simulated data
    function generateSimulatedData(count) {
        let categories = ["Legislație", "Electrotehnică", "Norme tehnice", "Test final ANRE"];
        for (let i = 0; i < count; i++) {
            let category = categories[Math.floor(Math.random() * categories.length)];
            let success = Math.random() < 0.7; // 70% chance of success
            let correctCount = Math.floor(Math.random() * 25);
            let wrongCount = Math.floor(Math.random() * 10);
            let time = `${Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

            let quizData = {
                category: category,
                success: success,
                correctCount: correctCount,
                wrongCount: wrongCount,
                time: time
            };

            saveQuizHistory(quizData);
        }
    }

    // Function to save quiz data to localStorage
    function saveQuizHistory(quizData) {
        let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
        history.push(quizData);
        localStorage.setItem("quizHistory", JSON.stringify(history));
    }

    // Generate simulated data (e.g., 20 entries)
    //generateSimulatedData(120);

    // Clear History Button Logic
    document.getElementById("clear-history-btn").addEventListener("click", function() {
        if (confirm("Sigur vrei să ștergi istoricul?")) {
            localStorage.removeItem("quizHistory");
            history = [];
            filterHistory(categoryFilter.value);
        }
    });
});
