document.addEventListener('DOMContentLoaded', function () {
  /* ===== Мобильная навигация ===== */
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(!navMenu.classList.contains('is-open'));
    });

    /* После выбора пункта меню на мобильном закрываем панель */
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ===== Доступное модальное окно ===== */
  var modal = document.getElementById('callback-modal');
  var openers = document.querySelectorAll('[data-modal-open]');
  var closers = document.querySelectorAll('[data-modal-close]');
  var lastFocused = null;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function modalFocusables() {
    if (!modal) return [];
    return Array.prototype.filter.call(modal.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  function openModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var field = modal.querySelector('input, select, textarea');
    var items = modalFocusables();
    if (field) field.focus();
    else if (items.length) items[0].focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
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

    /* Удержание фокуса внутри диалога */
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = modalFocusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;

      if (!modal.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
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
        if (alertEl.scrollIntoView) {
          alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alertEl.focus();
      }
      form.reset();
    });
  });

  /* ===== Фильтрация каталога ===== */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var catalogCards = document.querySelectorAll('.catalog-main .card');
  var catalogStatus = document.getElementById('catalog-status');

  function plural(n, one, few, many) {
    var n10 = n % 10;
    var n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  function applyFilter(filter) {
    var shown = 0;
    catalogCards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.category === filter;
      card.hidden = !match;
      if (match) shown++;
    });

    filterBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    });

    if (catalogStatus) {
      catalogStatus.textContent = shown
        ? 'Показано: ' + shown + ' ' + plural(shown, 'товар', 'товара', 'товаров') + ' из ' + catalogCards.length
        : 'Товаров в этой категории нет';
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.dataset.filter);
    });
  });
});
