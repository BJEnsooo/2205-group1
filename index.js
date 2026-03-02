const answers = document.querySelectorAll(".answer-btn");
const feedback = document.getElementById("feedback");
const points = document.getElementById("points");
const timer = document.getElementById("timer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const resetBtn = document.getElementById("resetBtn");
const showTipsBtn = document.getElementById("showTipsBtn");
const tipsSection = document.getElementById("tipsSection");

let score = 0;
let timeLeft = 20;
let timerInterval = null;
let answered = false;

const correctAnswer = "7318";

const updateProgress = () => {
  const progressValue = Math.min(100, Math.round((score / 5) * 100));
  progressFill.style.width = `${progressValue}%`;
  progressText.textContent = `${progressValue}%`;
};

const updateTimer = () => {
  timer.textContent = `${timeLeft}s`;
};

const startTimer = () => {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      feedback.textContent = "Time is up! Tap Try Again to reset.";
      feedback.style.color = "#c94f4f";
      answers.forEach((button) => {
        button.disabled = true;
      });
    }
  }, 1000);
};

const resetGame = () => {
  score = 0;
  timeLeft = 20;
  answered = false;
  updateTimer();
  updateProgress();
  feedback.textContent = "Choose an answer to begin.";
  feedback.style.color = "#4c6b55";
  answers.forEach((button) => {
    button.classList.remove("correct", "wrong");
    button.disabled = false;
  });
  startTimer();
};

answers.forEach((button) => {
  button.addEventListener("click", () => {
    if (answered) return;
    answered = true;
    const isCorrect = button.dataset.answer === correctAnswer;
    if (isCorrect) {
      button.classList.add("correct");
      feedback.textContent = "Correct! Nice job.";
      feedback.style.color = "#2f8f4f";
      score += 5;
    } else {
      button.classList.add("wrong");
      feedback.textContent = "Oops! That's not quite right.";
      feedback.style.color = "#c94f4f";
      answers.forEach((item) => {
        if (item.dataset.answer === correctAnswer) {
          item.classList.add("correct");
        }
      });
    }
    points.textContent = score;
    updateProgress();
    clearInterval(timerInterval);
  });
});

resetBtn.addEventListener("click", resetGame);

showTipsBtn.addEventListener("click", () => {
  tipsSection.scrollIntoView({ behavior: "smooth" });
});

resetGame();
