document.addEventListener('DOMContentLoaded', function () {
  /* ===== Гамбургер ===== */
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ===== Доступная модалка ===== */
  var modal = document.getElementById('callback-modal');
  var openers = document.querySelectorAll('[data-modal-open]');
  var closers = document.querySelectorAll('[data-modal-close]');
  var lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('button, input, select, textarea, a');
    if (first) first.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  openers.forEach(function (b) { b.addEventListener('click', openModal); });
  closers.forEach(function (b) { b.addEventListener('click', closeModal); });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  /* ===== Демо-отправка форм ===== */
  var forms = document.querySelectorAll('form[data-demo-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var alertEl = document.getElementById(form.dataset.successTarget);
      if (alertEl) {
        alertEl.hidden = false;
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alertEl.focus();
      }
      form.reset();
    });
  });

  /* ===== Демо-фильтры каталога ===== */
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
    });
  });
});