// ============================================================
// APP.JS - Main Entry Point
// Depends on: AudioEngine.js, Quiz.js, Question.js, UIControls.js
// ============================================================

var quizOptionsForm    = document.getElementById('quizOptions');
var playerNameInput    = document.getElementById('playerName');
var categoryInput      = document.getElementById('categoryMenu');
var difficultyOptions  = document.getElementById('difficultyOptions');
var questionsNumber    = document.getElementById('questionsNumber');
var startQuizBtn       = document.getElementById('startQuiz');
var questionsContainer = document.getElementById('questionsContainer');

var currentQuiz = null;

// ---- Loading / Error UI ----

function showLoading() {
  questionsContainer.innerHTML =
    '<div class="loading-overlay">' +
      '<div class="loading-spinner"></div>' +
      '<p class="loading-text">Loading Questions...</p>' +
    '</div>';
}

function hideLoading() {
  var overlay = questionsContainer.querySelector('.loading-overlay');
  if (overlay) overlay.remove();
}

function showError(message) {
  questionsContainer.innerHTML =
    '<div class="game-card error-card">' +
      '<div class="error-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>' +
      '<h3 class="error-title">Oops! Something went wrong</h3>' +
      '<p class="error-message">' + (message || 'Failed to load questions. Please try again.') + '</p>' +
      '<button class="btn-play retry-btn" id="retryBtn">' +
        '<i class="fa-solid fa-rotate-right"></i> Try Again' +
      '</button>' +
    '</div>';
  var retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function() { resetToStart(); });
  }
}

// ---- Form Validation ----

function validateForm() {
  var val = questionsNumber.value;
  if (!val || val === '') {
    return { isValid: false, error: 'Please enter the number of questions.' };
  }
  var num = parseInt(val);
  if (isNaN(num) || num < 1) {
    return { isValid: false, error: 'Please enter at least 1 question.' };
  }
  if (num > 50) {
    return { isValid: false, error: 'Maximum is 50 questions.' };
  }
  return { isValid: true, error: null };
}

function showFormError(message) {
  var existing = quizOptionsForm.querySelector('.form-error');
  if (existing) existing.remove();

  var div = document.createElement('div');
  div.className = 'form-error';
  div.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + message;
  startQuizBtn.insertAdjacentElement('beforebegin', div);

  setTimeout(function() {
    if (div.parentNode) {
      div.style.transition = 'opacity 0.3s ease';
      div.style.opacity = '0';
      setTimeout(function() { if (div.parentNode) div.remove(); }, 300);
    }
  }, 3000);
}

// ---- Game Flow ----

function resetToStart() {
  questionsContainer.innerHTML = '';
  quizOptionsForm.classList.remove('hidden');
  currentQuiz = null;
}

function startQuiz() {
  var validation = validateForm();
  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  var playerName       = playerNameInput.value.trim() || 'Player';
  var category         = categoryInput.value;
  var difficulty       = difficultyOptions.value;
  var numberOfQuestions = parseInt(questionsNumber.value);

  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);

  quizOptionsForm.classList.add('hidden');
  showLoading();

  currentQuiz.getQuestions()
    .then(function(questions) {
      hideLoading();
      if (!questions || questions.length === 0) {
        showError('No questions found for your selection. Try different settings.');
        return;
      }
      var q = new Question(currentQuiz, questionsContainer, resetToStart);
      q.displayQuestion();
    })
    .catch(function(err) {
      hideLoading();
      showError(err.message || 'Failed to load questions. Please check your connection and try again.');
      quizOptionsForm.classList.remove('hidden');
    });
}

// ---- Event Listeners ----

startQuizBtn.addEventListener('click', function() { startQuiz(); });

questionsNumber.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') startQuiz();
});
