// ---------- global variables ----------
let timerInterval;
let timeLeft = 20;
let score = 0;
let questionCount = 0;
const maxQuestions = 10;
let currentCorrectAnswer = 0;
let currentExplanation = '';
// Mode variables
let currentMode = 'easy'; // default
let currentOperation = 'addition'; // default operation

const modeSettings = {
    easy: {
        name: 'Easy',
        time: 20,
        icon: '🌱',
        color: '#4e7d3a',
        loadingMessage: 'Simple addition, subtraction, multiplication, division',
        ranges: {
            addition: { min: 0, max: 9 },
            subtraction: { min: 0, max: 9, ensurePositive: true },
            multiplication: { min: 0, max: 5 },
            division: { min: 1, max: 9, divisorRange: [1, 5] }
        }
    },
    medium: {
        name: 'Medium',
        time: 15,
        icon: '⚡',
        color: '#ff9800',
        loadingMessage: 'Getting challenging with two-digit numbers',
        ranges: {
            addition: { min: 10, max: 99 },
            subtraction: { min: 10, max: 99, ensurePositive: true },
            multiplication: { min: 2, max: 12 },
            division: { min: 1, max: 12, divisorRange: [2, 6] }
        }
    },
    hard: {
        name: 'Hard',
        time: 10,
        icon: '🔥',
        color: '#f44336',
        loadingMessage: 'Test your skills with three-digit numbers',
        ranges: {
            addition: { min: 100, max: 999 },
            subtraction: { min: 100, max: 999, ensurePositive: true },
            multiplication: { min: 6, max: 15 },
            division: { min: 1, max: 20, divisorRange: [3, 8] }
        }
    }
};

// DOM elements
const dashboard = document.getElementById('dashboard');
const rulesModal = document.getElementById('rulesModal');
const loadingScreen = document.getElementById('loadingScreen');
const gameScreen = document.getElementById('gameScreen');
const pointsDisplay = document.getElementById('pointsDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const questionEl = document.getElementById('questionText');
const answerGrid = document.getElementById('answerGrid');
const feedbackPop = document.getElementById('feedbackPop');
const explanationArea = document.getElementById('explanationArea');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');

// Open rules — shows mode selection first
window.openRules = function() {
    document.getElementById('modeModal').style.display = 'flex';
};

// ---------- terms checkbox ----------
const agreeCheck = document.getElementById('agreeCheckbox');
const acceptBtn = document.getElementById('acceptBtn');
agreeCheck.addEventListener('change', function() {
    acceptBtn.disabled = !this.checked;
});

// Accept button on rules modal
acceptBtn.addEventListener('click', function() {
    rulesModal.style.display = 'none';
    dashboard.style.display = 'none';
    
    // Update loading screen before starting
    updateLoadingScreen(currentMode);
    
    startLoading();
});

function startLoading() {
    loadingScreen.style.display = 'block';
    
    // Make sure loading screen text is correct
    updateLoadingScreen(currentMode);
    
    const progress = document.getElementById('progressBar');
    let width = 0;
    const interval = setInterval(function() {
        width += 2;
        progress.style.width = width + '%';
        if (width >= 100) {
            clearInterval(interval);
            loadingScreen.style.display = 'none';
            
            // Reset game state to 0
            score = 0;
            questionCount = 0;
            timeLeft = modeSettings[currentMode].time;
            
            // Update displays
            pointsDisplay.innerText = 'Points 0';
            timerDisplay.innerText = timeLeft + ' seconds';
            updateProgressFill();
            
            // Update header to show mode
            var headerLabels = document.querySelector('.header-labels');
            var settings = modeSettings[currentMode];
            if (headerLabels) {
                headerLabels.innerHTML = settings.icon + ' ' + settings.name + ' mode';
            }
            
            // Clear any existing timer
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Show game screen
            gameScreen.style.display = 'flex';
            generateQuestion();
        }
    }, 40);
}

// update progress bar based on questionCount
function updateProgressFill() {
    if (progressFill) {
        progressFill.style.width = (questionCount / maxQuestions) * 100 + '%';
    }
}

// generate question based on selected mode and random operation
function generateQuestion() {
    // Stop any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Get mode settings
    var settings = modeSettings[currentMode];
    
    // Reset timer based on mode
    timeLeft = settings.time;
    timerDisplay.innerText = timeLeft + ' seconds';
    
    // Update header to show mode with icon
    var headerLabels = document.querySelector('.header-labels');
    if (headerLabels) {
        headerLabels.innerHTML = settings.icon + ' ' + settings.name + ' mode';
    }
    
    // Smooth fade on question container
    var questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
        questionContainer.classList.add('question-fade-in');
        setTimeout(function() {
            questionContainer.classList.remove('question-fade-in');
        }, 300);
    }
    
    // Hide explanation & next from previous
    explanationArea.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Reset buttons
    document.querySelectorAll('.ans-btn').forEach(function(btn) {
        btn.classList.remove('correct-highlight', 'wrong-highlight');
        btn.disabled = false;
        btn.style.background = '';
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
    });
    
    // Check if game is complete
    if (questionCount >= maxQuestions) {
        clearInterval(timerInterval);
        setTimeout(function() {
            showResults();
        }, 500);
        return;
    }
    
    questionCount++;
    updateProgressFill();
    
    // START TIMER
    startTimer();
    
    // Get random operation and generate numbers
    var operation = getRandomOperation();
    var questionData = generateNumbersForOperation(operation, currentMode);
    
    // Set values
    currentCorrectAnswer = questionData.answer;
    var qEl = document.getElementById('questionText');
    var operationSymbol = getOperationSymbol(questionData.operation);
    
    // Smooth update of question text
    qEl.style.opacity = '0';
    setTimeout(function() {
        qEl.innerText = questionData.questionText;
        qEl.style.opacity = '1';
    }, 100);
    
    // Set explanation with operation symbol
    currentExplanation = questionData.num1 + ' ' + operationSymbol + ' ' + questionData.num2 + ' = ' + currentCorrectAnswer + '.';
    
    // Generate choices based on mode and operation
    var choices = [currentCorrectAnswer];
    
    while (choices.length < 4) {
        var wrong;
        
        if (currentMode === 'easy') {
            if (operation === 'multiplication') {
                wrong = Math.floor(Math.random() * 30);
            } else if (operation === 'division') {
                wrong = Math.floor(Math.random() * 10) + 1;
            } else {
                wrong = Math.floor(Math.random() * 19);
            }
        } 
        else if (currentMode === 'medium') {
            if (operation === 'multiplication') {
                wrong = currentCorrectAnswer + Math.floor(Math.random() * 20) - 10;
                if (wrong < 0) wrong = currentCorrectAnswer + 5;
            } else {
                wrong = currentCorrectAnswer + Math.floor(Math.random() * 40) - 20;
                if (wrong < 0) wrong = currentCorrectAnswer + 10;
            }
        } 
        else if (currentMode === 'hard') {
            if (operation === 'multiplication') {
                wrong = currentCorrectAnswer + Math.floor(Math.random() * 100) - 50;
                if (wrong < 0) wrong = currentCorrectAnswer + 20;
            } else {
                wrong = currentCorrectAnswer + Math.floor(Math.random() * 200) - 100;
                if (wrong < 0) wrong = currentCorrectAnswer + 30;
            }
        }
        
        // Add if not duplicate and positive
        if (!choices.includes(wrong) && wrong > 0) {
            choices.push(wrong);
        }
    }
    
    // Shuffle choices
    choices.sort(function() { return Math.random() - 0.5; });
    
    // Render answer buttons
    answerGrid.innerHTML = '';
    choices.forEach(function(val, index) {
        var btn = document.createElement('button');
        btn.className = 'ans-btn';
        btn.innerText = val;
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';
        btn.onclick = function() { checkAnswer(btn, val); };
        answerGrid.appendChild(btn);
        
        // Staggered animation
        setTimeout(function() {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 50 * index);
    });
}

// Helper function to get operation symbol
function getOperationSymbol(operation) {
    var symbols = {
        addition: '+',
        subtraction: '-',
        multiplication: '×',
        division: '÷'
    };
    return symbols[operation];
}

// check answer - with detailed solution
window.checkAnswer = function(btn, selectedValue) {
    // Stop timer immediately
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Disable all buttons
    var allBtns = document.querySelectorAll('.ans-btn');
    allBtns.forEach(function(b) { b.disabled = true; });

    // Get current operation from question text
    var questionText = document.getElementById('questionText').innerText;
    var operation = 'addition';
    
    if (questionText.includes('×')) operation = 'multiplication';
    else if (questionText.includes('÷')) operation = 'division';
    else if (questionText.includes('-')) operation = 'subtraction';
    
    var operationSymbol = getOperationSymbol(operation);
    
    // Extract numbers from question
    var numbers = questionText.match(/\d+/g);
    var num1 = parseInt(numbers[0]);
    var num2 = parseInt(numbers[1]);

    // visual correct/wrong classes
    if (selectedValue === currentCorrectAnswer) {
        btn.classList.add('correct-highlight');
        score += 10;
        pointsDisplay.innerText = 'Points ' + score;
        feedbackPop.innerText = 'Correct!';
        feedbackPop.className = 'feedback-pop pop-correct';
    } else {
        btn.classList.add('wrong-highlight');
        feedbackPop.innerText = 'Wrong!';
        feedbackPop.className = 'feedback-pop pop-wrong';
        // highlight the correct answer among others
        allBtns.forEach(function(b) {
            if (parseInt(b.innerText) === currentCorrectAnswer) {
                b.classList.add('correct-highlight');
            }
        });
    }

    // Show detailed solution after feedback popup
    showDetailedSolution(num1, num2, operation, operationSymbol);
};

// ===== SHARED FUNCTION: Show detailed solution (used by both checkAnswer and timer timeout) =====
function showDetailedSolution(num1, num2, operation, operationSymbol) {
    // Generate detailed solution
    var solution = generateDetailedSolution(num1, num2, operation, currentCorrectAnswer, currentMode);
    
    // Update explanation area after feedback popup fades
    setTimeout(function() {
        feedbackPop.className = 'feedback-pop';
        
        // Update solution elements
        document.getElementById('solutionEquation').innerText = num1 + ' ' + operationSymbol + ' ' + num2 + ' = ?';
        
        var stepsContainer = document.getElementById('solutionSteps');
        stepsContainer.innerHTML = '';
        solution.steps.forEach(function(step, index) {
            var stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            stepItem.innerHTML = '<span class="step-number">' + (index + 1) + '</span><span class="step-text">' + step + '</span>';
            stepsContainer.appendChild(stepItem);
        });
        
        document.getElementById('finalAnswer').innerHTML = '✅ Final Answer: <strong>' + currentCorrectAnswer + '</strong>';
        document.getElementById('solutionTip').innerText = solution.tip;
        
        // Update mode tag
        var settings = modeSettings[currentMode];
        document.getElementById('explanationMode').innerHTML = settings.icon + ' ' + settings.name + ' Mode';
        
        // Add mode class to explanation card for colors
        var explanationCard = document.querySelector('.explanation-card');
        explanationCard.classList.remove('easy-mode', 'medium-mode', 'hard-mode');
        explanationCard.classList.add(currentMode + '-mode');
        
        // Show explanation
        explanationArea.style.display = 'flex';
        explanationArea.style.opacity = '0';
        
        // Fade in explanation
        setTimeout(function() {
            explanationArea.style.opacity = '1';
        }, 50);
        
        nextBtn.style.display = 'block';
        nextBtn.style.opacity = '0';
        
        // Fade in next button
        setTimeout(function() {
            nextBtn.style.opacity = '1';
        }, 150);
        
        // Auto-scroll down
        setTimeout(function() {
            explanationArea.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 200);
    }, 1000);
}

// next question - reset explanation
window.nextQuestion = function() {
    // Disable next button
    nextBtn.style.display = 'none';
    nextBtn.disabled = true;
    
    // Fade out question and explanation
    var questionContainer = document.querySelector('.question-container');
    var explanationContainer = document.getElementById('explanationArea');
    
    // Add fade-out class
    questionContainer.classList.add('question-fade-out');
    
    // Fade out explanation if visible
    if (explanationContainer.style.display === 'flex') {
        explanationContainer.style.opacity = '0';
        explanationContainer.style.transition = 'opacity 0.2s ease';
    }
    
    // Wait a bit before transitioning
    setTimeout(function() {
        // hide explanation & next
        explanationArea.style.display = 'none';
        explanationArea.style.opacity = '1'; // reset opacity
        
        // Remove fade-out class
        questionContainer.classList.remove('question-fade-out');
        
        // scroll to top - SMOOTH
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // generate new question
        setTimeout(function() {
            generateQuestion();
            nextBtn.disabled = false;
        }, 300);
    }, 200);
};

// timer
function startTimer() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.innerText = timeLeft + ' seconds';
        
        if (timeLeft <= 0) {
            // STOP TIMER
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Disable all buttons
            var allBtns = document.querySelectorAll('.ans-btn');
            allBtns.forEach(function(b) { b.disabled = true; });
            
            // Show time's up popup
            feedbackPop.innerText = "Time's Up!";
            feedbackPop.className = 'feedback-pop pop-wrong';

            // Highlight correct answer
            allBtns.forEach(function(b) {
                if (parseInt(b.innerText) === currentCorrectAnswer) {
                    b.classList.add('correct-highlight');
                }
            });

            // ===== FIX: Extract numbers and show detailed solution (same as checkAnswer) =====
            var questionText = document.getElementById('questionText').innerText;
            var operation = 'addition';
            
            if (questionText.includes('×')) operation = 'multiplication';
            else if (questionText.includes('÷')) operation = 'division';
            else if (questionText.includes('-')) operation = 'subtraction';
            
            var operationSymbol = getOperationSymbol(operation);
            
            // Extract numbers from question
            var numbers = questionText.match(/\d+/g);
            var num1 = parseInt(numbers[0]);
            var num2 = parseInt(numbers[1]);

            // Use the shared function to show the detailed solution and next button
            showDetailedSolution(num1, num2, operation, operationSymbol);
        }
    }, 1000);
}

// PAUSE GAME FUNCTION
window.pauseGame = function() {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update pause modal with current progress
    var pauseProgress = document.getElementById('pauseProgressBar');
    var pausePoints = document.getElementById('pausePoints');
    var pauseTimer = document.getElementById('pauseTimer');
    var pauseModal = document.getElementById('pauseModal');
    var modeTagEl = pauseModal.querySelector('.mode-tag');
    
    // Update mode tag in pause modal
    var settings = modeSettings[currentMode];
    if (modeTagEl) {
        modeTagEl.innerHTML = settings.icon + ' ' + settings.name + ' mode';
    }
    
    // Update progress bar
    if (pauseProgress) {
        var progressPercent = (questionCount / maxQuestions) * 100;
        pauseProgress.style.width = progressPercent + '%';
    }
    
    // Update points and timer
    if (pausePoints) pausePoints.innerText = 'Points ' + score;
    if (pauseTimer) pauseTimer.innerText = timeLeft + ' seconds';
    
    // Hide any open forfeit confirmation
    hideForfeitConfirm();
    
    // Show pause modal
    if (pauseModal) pauseModal.style.display = 'flex';
};

// RESUME GAME
window.resumeGame = function() {
    closePauseModal();
};

// SHOW FORFEIT CONFIRMATION INSIDE PAUSE MODAL
window.showForfeitConfirm = function() {
    document.getElementById('forfeitConfirmBox').style.display = 'block';
    setTimeout(function() {
        document.getElementById('forfeitConfirmBox').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
};

// HIDE FORFEIT CONFIRMATION
window.hideForfeitConfirm = function() {
    document.getElementById('forfeitConfirmBox').style.display = 'none';
};

// CONFIRM FORFEIT - restart game from beginning
window.confirmForfeit = function() {
    // Hide pause modal
    document.getElementById('pauseModal').style.display = 'none';
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reload to go back to dashboard
    window.location.reload();
};

// Click outside modal to close
window.onclick = function(e) {
    var pauseModal = document.getElementById('pauseModal');
    if (e.target === pauseModal) {
        closePauseModal();
    }
};

// CLOSE PAUSE MODAL FUNCTION
window.closePauseModal = function() {
    // Hide the pause modal
    var pauseModal = document.getElementById('pauseModal');
    if (pauseModal) {
        pauseModal.style.display = 'none';
    }
    
    // Hide forfeit confirmation (in case it was open)
    hideForfeitConfirm();
    
    // Resume timer if game still active and buttons are not disabled (question not answered yet)
    var allBtns = document.querySelectorAll('.ans-btn');
    var anyEnabled = false;
    allBtns.forEach(function(b) {
        if (!b.disabled) anyEnabled = true;
    });
    
    if (timeLeft > 0 && questionCount <= maxQuestions && anyEnabled) {
        startTimer();
    }
};

// SHOW RESULTS FUNCTION
window.showResults = function() {
    // Hide game screen
    document.getElementById('gameScreen').style.display = 'none';
    
    // Get results elements
    var finalScore = document.getElementById('finalScore');
    var correctCount = document.getElementById('correctCount');
    var wrongCount = document.getElementById('wrongCount');
    var timeSpent = document.getElementById('timeSpent');
    var feedbackText = document.getElementById('feedbackText');
    var modeTag = document.querySelector('.mode-tag-results');
    var settings = modeSettings[currentMode];
    if (modeTag) {
        modeTag.innerHTML = settings.icon + ' ' + settings.name + ' mode';
    }
    
    // Compute wrong answers (10 - correct)
    var correct = Math.floor(score / 10);
    var wrong = 10 - correct;
    
    // Update stats
    finalScore.innerText = score;
    correctCount.innerText = correct;
    wrongCount.innerText = wrong;
    
    // Compute time spent
    var totalTime = maxQuestions * settings.time;
    var totalSeconds = Math.max(0, totalTime - (timeLeft * (maxQuestions - questionCount + 1)));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    timeSpent.innerText = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    // Generate feedback based on score
    if (score >= 90) {
        feedbackText.innerText = '"Excellent! Perfect score! 🌟"';
    } else if (score >= 70) {
        feedbackText.innerText = '"Great job! You\'re improving!"';
    } else if (score >= 50) {
        feedbackText.innerText = '"Good effort! Keep practicing!"';
    } else {
        feedbackText.innerText = '"Keep trying! You\'ll get better!"';
    }
    
    // Show results screen
    var resultsScreen = document.getElementById('resultsScreen');
    resultsScreen.style.display = 'flex';
    
    // Auto-scroll to top
    setTimeout(function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 300);
};

// PLAY AGAIN FUNCTION
window.playAgain = function() {
    // Hide results screen
    document.getElementById('resultsScreen').style.display = 'none';
    
    // Reset all variables to 0
    score = 0;
    questionCount = 0;
    timeLeft = modeSettings[currentMode].time;
    
    // Update points display on game screen
    pointsDisplay.innerText = 'Points 0';
    timerDisplay.innerText = timeLeft + ' seconds';
    
    // Reset progress bar
    updateProgressFill();
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Show game screen
    document.getElementById('gameScreen').style.display = 'flex';
    
    // Start new game
    setTimeout(function() {
        generateQuestion();
    }, 300);
};

// MAIN MENU FUNCTION
window.mainMenu = function() {
    // Hide results and game screens
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    
    // Reset all variables to 0
    score = 0;
    questionCount = 0;
    timeLeft = 20;
    
    // Update points display
    pointsDisplay.innerText = 'Points 0';
    timerDisplay.innerText = '20 seconds';
    
    // Reset progress bar
    updateProgressFill();
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Show dashboard
    document.getElementById('dashboard').style.display = 'block';
};

// SELECT MODE FUNCTION
window.selectMode = function(mode) {
    // Add click animation on card
    var activeCard = document.querySelector('.' + mode + '-mode-card');
    activeCard.style.transform = 'scale(0.95)';
    
    setTimeout(function() {
        activeCard.style.transform = '';
        
        // Set current mode
        currentMode = mode;
        
        // Update timer based on mode
        timeLeft = modeSettings[mode].time;
        
        // Update loading screen text
        updateLoadingScreen(mode);
        
        // Close mode modal with fade out
        var modeModal = document.getElementById('modeModal');
        modeModal.style.opacity = '0';
        
        setTimeout(function() {
            modeModal.style.display = 'none';
            modeModal.style.opacity = '1';
            
            // Open rules modal
            document.getElementById('rulesModal').style.display = 'flex';
        }, 200);
    }, 150);
};

// FUNCTION TO UPDATE LOADING SCREEN
function updateLoadingScreen(mode) {
    var modeTitle = document.getElementById('modeTitle');
    var sentenceText = document.getElementById('sentenceText');
    var loadingScreenEl = document.getElementById('loadingScreen');
    
    var settings = modeSettings[mode];
    
    if (modeTitle) {
        modeTitle.innerText = settings.name.toUpperCase() + ' MODE';
    }
    
    if (sentenceText) {
        sentenceText.innerText = settings.loadingMessage;
    }
    
    // Update data-mode attribute for dynamic colors
    if (loadingScreenEl) {
        loadingScreenEl.setAttribute('data-mode', mode);
    }
}

// CLOSE MODE MODAL
window.closeModeModal = function() {
    document.getElementById('modeModal').style.display = 'none';
};

// Get random operation
function getRandomOperation() {
    var operations = ['addition', 'subtraction', 'multiplication', 'division'];
    return operations[Math.floor(Math.random() * operations.length)];
}

// Generate numbers based on operation and mode
function generateNumbersForOperation(operation, mode) {
    var range = modeSettings[mode].ranges[operation];
    var num1, num2, answer, questionText;
    
    switch(operation) {
        case 'addition':
            num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            answer = num1 + num2;
            questionText = num1 + ' + ' + num2 + ' = ?';
            break;
            
        case 'subtraction':
            if (range.ensurePositive) {
                num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                num2 = Math.floor(Math.random() * (num1 - range.min + 1)) + range.min;
            } else {
                num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            }
            answer = num1 - num2;
            questionText = num1 + ' - ' + num2 + ' = ?';
            break;
            
        case 'multiplication':
            num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            answer = num1 * num2;
            questionText = num1 + ' × ' + num2 + ' = ?';
            break;
            
        case 'division':
            var divisorMin = range.divisorRange[0];
            var divisorMax = range.divisorRange[1];
            var divisor = Math.floor(Math.random() * (divisorMax - divisorMin + 1)) + divisorMin;
            var quotient = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            num1 = divisor * quotient;
            num2 = divisor;
            answer = quotient;
            questionText = num1 + ' ÷ ' + num2 + ' = ?';
            break;
    }
    
    return {
        num1: num1,
        num2: num2,
        answer: answer,
        questionText: questionText,
        operation: operation
    };
}

// Function to generate detailed solution based on operation and numbers
function generateDetailedSolution(num1, num2, operation, answer, mode) {
    var steps = [];
    var tip = '';
    
    var operationName = getOperationName(operation);
    
    // Step 1: Identify numbers
    steps.push('Identify the numbers: ' + num1 + ' and ' + num2);
    
    // Step 2: Operation
    steps.push('Operation: ' + operationName);
    
    // Step 3: Computation with explanation
    switch(operation) {
        case 'addition':
            steps.push(num1 + ' + ' + num2 + ' = ' + answer);
            tip = getAdditionTip(num1, num2, mode);
            break;
        case 'subtraction':
            steps.push(num1 + ' - ' + num2 + ' = ' + answer);
            tip = getSubtractionTip(num1, num2, mode);
            break;
        case 'multiplication':
            steps.push(num1 + ' × ' + num2 + ' = ' + answer);
            tip = getMultiplicationTip(num1, num2, mode);
            break;
        case 'division':
            steps.push(num1 + ' ÷ ' + num2 + ' = ' + answer);
            tip = getDivisionTip(num1, num2, answer, mode);
            break;
    }
    
    return { steps: steps, tip: tip };
}

// Helper functions for tips
function getAdditionTip(num1, num2, mode) {
    if (mode === 'easy') {
        if (num1 + num2 <= 10) {
            return '💡 Tip: Count ' + num2 + ' steps forward from ' + num1 + ' to get ' + (num1 + num2);
        } else {
            return '💡 Tip: ' + num1 + ' + ' + num2 + ' = ' + (num1 + num2);
        }
    } else if (mode === 'medium') {
        return '💡 Tip: Add tens first: ' + (Math.floor(num1/10)*10) + ' + ' + (Math.floor(num2/10)*10) + ' = ' + (Math.floor(num1/10)*10 + Math.floor(num2/10)*10) + ', then add ones';
    } else {
        return '💡 Tip: Break it down: ' + num1 + ' + ' + num2 + ' = (' + num1 + ' + ' + (Math.floor(num2/100)*100) + ') + ' + (num2 % 100);
    }
}

function getSubtractionTip(num1, num2, mode) {
    if (mode === 'easy') {
        return '💡 Tip: Count backwards ' + num2 + ' steps from ' + num1;
    } else if (mode === 'medium') {
        return '💡 Tip: Subtract tens first: ' + num1 + ' - ' + (Math.floor(num2/10)*10) + ' = ' + (num1 - Math.floor(num2/10)*10) + ', then subtract ' + (num2 % 10);
    } else {
        return '💡 Tip: ' + num1 + ' - ' + num2 + ' = ' + num1 + ' - ' + (Math.floor(num2/100)*100) + ' - ' + (num2 % 100);
    }
}

function getMultiplicationTip(num1, num2, mode) {
    if (mode === 'easy') {
        var arr = [];
        for (var i = 0; i < num2; i++) arr.push(num1);
        return '💡 Tip: ' + num1 + ' × ' + num2 + ' means adding ' + num1 + ', ' + num2 + ' times: ' + arr.join(' + ') + ' = ' + (num1 * num2);
    } else if (mode === 'medium') {
        return '💡 Tip: ' + num1 + ' × ' + num2 + ' = (' + num1 + ' × ' + (Math.floor(num2/10)*10) + ') + (' + num1 + ' × ' + (num2 % 10) + ')';
    } else {
        return '💡 Tip: Break it down using distributive property';
    }
}

function getDivisionTip(num1, num2, answer, mode) {
    if (mode === 'easy') {
        return '💡 Tip: ' + num2 + ' × ' + answer + ' = ' + num1 + ', so ' + num1 + ' ÷ ' + num2 + ' = ' + answer;
    } else {
        return '💡 Tip: Check: ' + num2 + ' × ' + answer + ' = ' + num1;
    }
}

function getOperationName(operation) {
    var names = {
        addition: 'Addition',
        subtraction: 'Subtraction',
        multiplication: 'Multiplication',
        division: 'Division'
    };
    return names[operation];
}
