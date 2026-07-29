// ---- i18n helpers ----
function getLng() {
  return new URLSearchParams(window.location.search).get('lng') || 'en_US';
}

// ---- Navigation ----
var STEPS = ['menu', 'install', 'agreement', 'disk', 'progress'];

function go(delta) {
  var step = document.body.dataset.step;
  var idx = STEPS.indexOf(step);
  if (idx === -1) return;
  var next = idx + delta;
  if (next < 0) { window.location.href = '../index.html?lng=' + getLng(); return; }
  if (next >= STEPS.length) return;
  // gate: run save function before forward navigation
  if (delta > 0 && typeof window['save_' + step] === 'function') {
    if (!window['save_' + step]()) return;
  }
  window.location.href = STEPS[next] + '.html?lng=' + getLng();
}

// ---- Language selection ----
function select_language() {
  var e = document.getElementById("ddlViewBy");
  var locale = e.value;
  if (!locale) { alert(i18n.get('menu.selectOption')); return; }
  window.location.href = 'templates/menu.html?lng=' + locale;
}

// ---- Init: wire data-nav buttons + step-specific logic ----
window.addEventListener('load', function() {
  document.querySelectorAll('[data-nav]').forEach(function(el) {
    el.addEventListener('click', function() { go(parseInt(this.dataset.nav, 10)); });
  });

  i18n.load(function() {
    var step = document.body.dataset.step;
    if (step === 'examining') examineRedirect();
    else if (step === 'disk') list_disk();
    else if (step === 'progress') print_disk();
    else if (step === 'menu') initMenuCheckboxes();
    if (step !== 'index') createNavbar();
  });
});

if (document.readyState !== 'loading') {
  document.querySelectorAll('[data-nav]').forEach(function(el) {
    el.addEventListener('click', function() { go(parseInt(this.dataset.nav, 10)); });
  });
}
