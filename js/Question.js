// ============================================================
// QUESTION MODULE
// ============================================================

// ---- Helper functions (shared between Quiz & Question) ----
function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
// -----------------------------------------------------------

function Question(quiz, container, onQuizEnd) {
  this.quiz = quiz;
  this.container = container;
  this.onQuizEnd = onQuizEnd;
  this.questionData = quiz.getCurrentQuestion();
  this.index = quiz.currentQuestionIndex;
  this.question = this.decodeHtml(this.questionData.question);
  this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
  this.category = this.decodeHtml(this.questionData.category);
  this.wrongAnswers = [];
  for (var i = 0; i < this.questionData.incorrect_answers.length; i++) {
    this.wrongAnswers.push(this.decodeHtml(this.questionData.incorrect_answers[i]));
  }
  this.allAnswers = this.shuffleAnswers();
  this.answered = false;
  this.timerInterval = null;
  this.timeRemaining = 30;
  this._keyHandler = null;
}

Question.prototype.decodeHtml = function(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent;
};

Question.prototype.shuffleAnswers = function() {
  var arr = this.wrongAnswers.slice();
  arr.push(this.correctAnswer);
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};

Question.prototype.getProgress = function() {
  return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
};

Question.prototype.displayQuestion = function() {
  var self = this;
  var progress = self.getProgress();
  var diffClass = self.quiz.difficulty;

  var diffIcon = diffClass === 'easy'
    ? '<i class="fa-solid fa-face-smile"></i>'
    : diffClass === 'medium'
      ? '<i class="fa-solid fa-face-meh"></i>'
      : '<i class="fa-solid fa-skull"></i>';

  var answersHTML = '';
  for (var i = 0; i < self.allAnswers.length; i++) {
    answersHTML +=
      '<button class="answer-btn" data-answer="' + escapeAttr(self.allAnswers[i]) + '">' +
        '<span class="answer-key">' + (i + 1) + '</span>' +
        '<span class="answer-text">' + self.allAnswers[i] + '</span>' +
      '</button>';
  }

  var html =
    '<div class="game-card question-card">' +
      '<div class="xp-bar-container">' +
        '<div class="xp-bar-header">' +
          '<span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>' +
          '<span class="xp-value">Question ' + (self.index + 1) + '/' + self.quiz.numberOfQuestions + '</span>' +
        '</div>' +
        '<div class="xp-bar"><div class="xp-bar-fill" style="width:' + progress + '%"></div></div>' +
      '</div>' +
      '<div class="stats-row">' +
        '<div class="stat-badge category"><i class="fa-solid fa-bookmark"></i><span>' + self.category + '</span></div>' +
        '<div class="stat-badge difficulty ' + diffClass + '">' + diffIcon + '<span>' + self.quiz.difficulty + '</span></div>' +
        '<div class="stat-badge timer" id="timerBadge"><i class="fa-solid fa-stopwatch"></i><span class="timer-value" id="timerValue">' + self.timeRemaining + '</span>s</div>' +
        '<div class="stat-badge counter"><i class="fa-solid fa-gamepad"></i><span>' + (self.index + 1) + '/' + self.quiz.numberOfQuestions + '</span></div>' +
      '</div>' +
      '<h2 class="question-text">' + self.question + '</h2>' +
      '<div class="answers-grid">' + answersHTML + '</div>' +
      '<p class="keyboard-hint"><i class="fa-regular fa-keyboard"></i> Press 1-4 to select</p>' +
      '<div class="score-panel">' +
        '<div class="score-item">' +
          '<div class="score-item-label">Score</div>' +
          '<div class="score-item-value" id="liveScore">' + self.quiz.score + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  self.container.innerHTML = html;
  self.addEventListeners();
  self.startTimer();
};

Question.prototype.addEventListeners = function() {
  var self = this;
  var btns = document.querySelectorAll('.answer-btn');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() { self.checkAnswer(btn); });
    })(btns[i]);
  }

  self._keyHandler = function(e) {
    var validKeys = ['1', '2', '3', '4'];
    if (validKeys.indexOf(e.key) !== -1) {
      var idx = parseInt(e.key) - 1;
      var allBtns = document.querySelectorAll('.answer-btn');
      if (allBtns[idx]) self.checkAnswer(allBtns[idx]);
    }
  };
  document.addEventListener('keydown', self._keyHandler);
};

Question.prototype.removeEventListeners = function() {
  if (this._keyHandler) {
    document.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = null;
  }
};

Question.prototype.startTimer = function() {
  var self = this;
  var timerEl = document.getElementById('timerValue');
  var timerBadge = document.getElementById('timerBadge');

  self.timerInterval = setInterval(function() {
    self.timeRemaining -= 1;

    timerEl = document.getElementById('timerValue');
    timerBadge = document.getElementById('timerBadge');

    if (timerEl) timerEl.textContent = self.timeRemaining;

    if (self.timeRemaining <= 10 && timerBadge) {
      timerBadge.classList.add('warning');
      AudioEngine.playTick();
    }

    if (self.timeRemaining <= 0) {
      self.stopTimer();
      self.handleTimeUp();
    }
  }, 1000);
};

Question.prototype.stopTimer = function() {
  clearInterval(this.timerInterval);
};

Question.prototype.handleTimeUp = function() {
  this.answered = true;
  this.removeEventListeners();
  AudioEngine.playTimeUp();

  // Highlight correct answer
  var btns = document.querySelectorAll('.answer-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].dataset.answer === this.correctAnswer) {
      btns[i].classList.add('correct-reveal');
    } else {
      btns[i].classList.add('disabled');
    }
  }

  // Show TIME'S UP message
  var grid = document.querySelector('.answers-grid');
  if (grid) {
    var msg = document.createElement('div');
    msg.className = 'time-up-message';
    msg.innerHTML = '<i class="fa-solid fa-clock"></i> TIME\'S UP!';
    grid.insertAdjacentElement('afterend', msg);
  }

  this.animateQuestion(500);
};

Question.prototype.checkAnswer = function(choiceElement) {
  if (this.answered) return;
  this.answered = true;
  this.stopTimer();
  this.removeEventListeners();

  var selected = choiceElement.dataset.answer;
  var isCorrect = selected.toLowerCase() === this.correctAnswer.toLowerCase();

  if (isCorrect) {
    choiceElement.classList.add('correct');
    this.quiz.incrementScore();
    AudioEngine.playCorrect();
    // Update live score
    var scoreEl = document.getElementById('liveScore');
    if (scoreEl) scoreEl.textContent = this.quiz.score;
  } else {
    choiceElement.classList.add('wrong');
    this.highlightCorrectAnswer();
    AudioEngine.playWrong();
  }

  // Disable other buttons
  var btns = document.querySelectorAll('.answer-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i] !== choiceElement && !btns[i].classList.contains('correct-reveal')) {
      btns[i].classList.add('disabled');
    }
  }

  this.animateQuestion(400);
};

Question.prototype.highlightCorrectAnswer = function() {
  var btns = document.querySelectorAll('.answer-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].dataset.answer === this.correctAnswer) {
      btns[i].classList.add('correct-reveal');
    }
  }
};

Question.prototype.getNextQuestion = function() {
  var self = this;
  var hasMore = self.quiz.nextQuestion();
  if (hasMore) {
    var q = new Question(self.quiz, self.container, self.onQuizEnd);
    q.displayQuestion();
  } else {
    AudioEngine.playGameOver();
    self.container.innerHTML = self.quiz.endQuiz();
    var playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', function() {
        self.onQuizEnd();
      });
    }
  }
};

Question.prototype.animateQuestion = function(duration) {
  var self = this;
  setTimeout(function() {
    var card = document.querySelector('.question-card');
    if (card) {
      card.classList.add('exit');
      setTimeout(function() {
        self.getNextQuestion();
      }, duration);
    } else {
      self.getNextQuestion();
    }
  }, 1500);
};
