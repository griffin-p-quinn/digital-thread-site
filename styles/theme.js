/* ═══════════════════════════════════════════════════════════
   Digital Fabric — theme toggle
   Builds a floating light/dark switch, persists the choice, and
   follows the OS preference until the user picks explicitly.
   The no-flash bootstrap (setting data-theme before paint) lives
   inline in each page's <head>; this file only builds the control.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var STORAGE_KEY = 'fabric-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      var isLight = theme === 'light';
      /* Pressed means the dark-theme preference is active. */
      btn.setAttribute('aria-pressed', String(!isLight));
      btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      btn.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
    }
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.innerHTML =
    '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>' +
    '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';

  apply(current());

  btn.addEventListener('click', function () {
    var next = current() === 'light' ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });

  function mount() {
    if (document.body.contains(btn)) return;
    var target = document.querySelector('[data-theme-mount]');
    (target || document.body).appendChild(btn);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  /* Follow the OS setting only while the user hasn't chosen explicitly. */
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  var onChange = function (e) {
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) {}
    if (stored !== 'light' && stored !== 'dark') apply(e.matches ? 'light' : 'dark');
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
