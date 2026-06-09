// ============================================================
// AUDIO ENGINE MODULE - Web Audio API (no external files needed)
// ============================================================

var AudioEngine = (function() {
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return ctx;
  }

  function playTone(frequency, type, duration, volume, delay) {
    var c = getCtx();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, c.currentTime + (delay || 0));
    gain.gain.setValueAtTime(volume || 0.3, c.currentTime + (delay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (delay || 0) + duration);
    osc.start(c.currentTime + (delay || 0));
    osc.stop(c.currentTime + (delay || 0) + duration);
  }

  return {
    playCorrect: function() {
      // Happy ascending arpeggio
      playTone(523, 'sine', 0.15, 0.4, 0);
      playTone(659, 'sine', 0.15, 0.4, 0.1);
      playTone(784, 'sine', 0.15, 0.4, 0.2);
      playTone(1047, 'sine', 0.3, 0.5, 0.3);
    },
    playWrong: function() {
      // Sad descending buzz
      playTone(300, 'sawtooth', 0.1, 0.3, 0);
      playTone(200, 'sawtooth', 0.15, 0.3, 0.1);
      playTone(150, 'sawtooth', 0.2, 0.25, 0.2);
    },
    playTimeUp: function() {
      // Alert beeps
      playTone(440, 'square', 0.08, 0.3, 0);
      playTone(440, 'square', 0.08, 0.3, 0.15);
      playTone(330, 'square', 0.2, 0.4, 0.3);
    },
    playTick: function() {
      playTone(800, 'sine', 0.05, 0.1, 0);
    },
    playGameOver: function() {
      // Fanfare
      playTone(523, 'sine', 0.12, 0.4, 0);
      playTone(659, 'sine', 0.12, 0.4, 0.12);
      playTone(784, 'sine', 0.12, 0.4, 0.24);
      playTone(1047, 'sine', 0.12, 0.4, 0.36);
      playTone(1319, 'sine', 0.3, 0.5, 0.48);
    }
  };
})();
