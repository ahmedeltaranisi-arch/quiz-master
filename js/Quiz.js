// ============================================================
// QUIZ MODULE
// ============================================================

function Quiz(category, difficulty, numberOfQuestions, playerName) {
  this.category = category;
  this.difficulty = difficulty;
  this.numberOfQuestions = numberOfQuestions;
  this.playerName = playerName;
  this.score = 0;
  this.questions = [];
  this.currentQuestionIndex = 0;
}

Quiz.prototype.buildApiUrl = function() {
  var params = new URLSearchParams();
  params.set('amount', this.numberOfQuestions);
  params.set('difficulty', this.difficulty);
  params.set('type', 'multiple');
  if (this.category) params.set('category', this.category);
  return 'https://opentdb.com/api.php?' + params.toString();
};

Quiz.prototype.getQuestions = function() {
  var self = this;
  var url = self.buildApiUrl();
  return fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(function(data) {
      if (data.response_code !== 0) {
        throw new Error('API Error: response_code ' + data.response_code + '. Try fewer questions or a different category.');
      }
      self.questions = data.results;
      return self.questions;
    });
};

Quiz.prototype.incrementScore = function() {
  this.score += 1;
};

Quiz.prototype.getCurrentQuestion = function() {
  if (this.currentQuestionIndex >= this.questions.length) return null;
  return this.questions[this.currentQuestionIndex];
};

Quiz.prototype.nextQuestion = function() {
  this.currentQuestionIndex += 1;
  return this.currentQuestionIndex < this.questions.length;
};

Quiz.prototype.isComplete = function() {
  return this.currentQuestionIndex >= this.questions.length;
};

Quiz.prototype.getScorePercentage = function() {
  return Math.round((this.score / this.numberOfQuestions) * 100);
};

Quiz.prototype.getHighScores = function() {
  try {
    var data = localStorage.getItem('quizHighScores');
    return data ? JSON.parse(data) : [];
  } catch(e) {
    return [];
  }
};

Quiz.prototype.isHighScore = function() {
  var scores = this.getHighScores();
  var pct = this.getScorePercentage();
  if (scores.length < 10) return true;
  return pct > scores[scores.length - 1].percentage;
};

Quiz.prototype.saveHighScore = function() {
  var scores = this.getHighScores();
  var entry = {
    name: this.playerName,
    score: this.score,
    total: this.numberOfQuestions,
    percentage: this.getScorePercentage(),
    difficulty: this.difficulty,
    date: new Date().toLocaleDateString()
  };
  scores.push(entry);
  scores.sort(function(a, b) { return b.percentage - a.percentage; });
  scores = scores.slice(0, 10);
  try {
    localStorage.setItem('quizHighScores', JSON.stringify(scores));
  } catch(e) {}
};

Quiz.prototype.endQuiz = function() {
  var pct = this.getScorePercentage();
  var isNew = this.isHighScore();

  if (isNew) this.saveHighScore();

  var scores = this.getHighScores();

  // Build leaderboard HTML
  var leaderboardHTML = '';
  for (var i = 0; i < scores.length; i++) {
    var rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    leaderboardHTML +=
      '<li class="leaderboard-item ' + rankClass + '">' +
        '<span class="leaderboard-rank">#' + (i + 1) + '</span>' +
        '<span class="leaderboard-name">' + escapeHtml(scores[i].name) + '</span>' +
        '<span class="leaderboard-score">' + scores[i].percentage + '%</span>' +
      '</li>';
  }

  var newRecordHTML = isNew
    ? '<div class="new-record-badge"><i class="fa-solid fa-star"></i> New High Score!</div>'
    : '';

  // Trophy emoji based on score
  var trophy = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '💀';

  return (
    '<div class="game-card results-card">' +
      '<div class="results-trophy">' + trophy + '</div>' +
      '<h2 class="results-title">Quiz Complete!</h2>' +
      '<p class="results-score-display">' + this.score + '/' + this.numberOfQuestions + '</p>' +
      '<p class="results-percentage">' + pct + '% Accuracy</p>' +
      newRecordHTML +
      (scores.length > 0 ?
        '<div class="leaderboard">' +
          '<h4 class="leaderboard-title"><i class="fa-solid fa-trophy"></i> Leaderboard</h4>' +
          '<ul class="leaderboard-list">' + leaderboardHTML + '</ul>' +
        '</div>' : '') +
      '<div class="action-buttons">' +
        '<button class="btn-restart" id="playAgainBtn">' +
          '<i class="fa-solid fa-rotate-right"></i> Play Again' +
        '</button>' +
      '</div>' +
    '</div>'
  );
};
