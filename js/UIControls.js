// ============================================================
// UI CONTROLS MODULE - Custom Selects + Number Inputs
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

  // ---- Custom Selects ----
  var selects = document.querySelectorAll('.custom-select');
  for (var s = 0; s < selects.length; s++) {
    (function(select) {
      var trigger = select.querySelector('.custom-select-trigger');
      var options = select.querySelectorAll('.custom-select-option');
      var hiddenInput = select.parentElement.querySelector('input[type="hidden"]');
      var textSpan = trigger.querySelector('.custom-select-text');
      var iconSpan = trigger.querySelector('.custom-select-icon');

      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        var openSelects = document.querySelectorAll('.custom-select.open');
        for (var i = 0; i < openSelects.length; i++) {
          if (openSelects[i] !== select) openSelects[i].classList.remove('open');
        }
        select.classList.toggle('open');
      });

      for (var o = 0; o < options.length; o++) {
        (function(option) {
          option.addEventListener('click', function() {
            var value = option.dataset.value;
            var icon = option.querySelector('i').outerHTML;
            var text = option.textContent.trim();
            select.dataset.value = value;
            if (hiddenInput) hiddenInput.value = value;
            textSpan.textContent = text;
            iconSpan.innerHTML = icon;
            for (var j = 0; j < options.length; j++) options[j].classList.remove('selected');
            option.classList.add('selected');
            select.classList.remove('open');
          });
        })(options[o]);
      }
    })(selects[s]);
  }

  // ---- Click outside to close selects ----
  document.addEventListener('click', function() {
    var openSelects = document.querySelectorAll('.custom-select.open');
    for (var i = 0; i < openSelects.length; i++) {
      openSelects[i].classList.remove('open');
    }
  });

  // ---- Number Input Buttons ----
  var numBtns = document.querySelectorAll('.number-btn');
  for (var n = 0; n < numBtns.length; n++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        var wrapper = btn.closest('.number-input-wrapper');
        var input = wrapper.querySelector('input[type="number"]');
        var min = parseInt(input.min) || 1;
        var max = parseInt(input.max) || 50;
        var value = parseInt(input.value) || min;
        if (btn.dataset.action === 'increment' && value < max) {
          input.value = value + 1;
        } else if (btn.dataset.action === 'decrement' && value > min) {
          input.value = value - 1;
        }
      });
    })(numBtns[n]);
  }

});
