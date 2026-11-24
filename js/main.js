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
      /* Если на странице есть выбор товара — возвращаем сводку заказа в исходное состояние */
      if (typeof updateSummary === 'function') updateSummary();
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

  /* ===== Сводка заказа ===== */
  var orderProduct = document.getElementById('o-product');
  var summaryProduct = document.getElementById('summary-product');
  var summaryPrice = document.getElementById('summary-price');
  var summaryTotal = document.getElementById('summary-total');

  function formatPrice(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function updateSummary() {
    if (!orderProduct || !summaryProduct) return;

    var option = orderProduct.options[orderProduct.selectedIndex];
    if (!option || !option.value) {
      summaryProduct.textContent = 'Товар не выбран';
      summaryPrice.textContent = '—';
      if (summaryTotal) summaryTotal.textContent = '—';
      return;
    }

    var price = Number(option.dataset.price || 0);
    summaryProduct.textContent = option.dataset.title || option.textContent;
    summaryPrice.textContent = formatPrice(price);
    if (summaryTotal) summaryTotal.textContent = formatPrice(price);
  }

  var urlProduct = new URLSearchParams(window.location.search).get('product');

  if (orderProduct && urlProduct && orderProduct.querySelector('option[value="' + urlProduct + '"]')) {
    orderProduct.value = urlProduct;
  }

  if (orderProduct) {
    orderProduct.addEventListener('change', updateSummary);
    updateSummary();
  }

  /* ===== Страница товара ===== */
  var PRODUCTS = {
    phone01: {
      title: 'Смартфон Galaxy A55',
      article: 'EL-001',
      category: 'Смартфоны',
      price: 34990,
      oldPrice: 39990,
      meta: 'Рейтинг: 4.8 из 5 · В наличии',
      description: 'Флагманский смартфон с безрамочным 6.6" AMOLED-дисплеем, процессором Exynos 1480 и тройной камерой 50 МП. Идеален для игр, съёмки и повседневной работы.',
      specs: [
        ['Экран', '6.6" Super AMOLED, 120 Гц'],
        ['Процессор', 'Exynos 1480'],
        ['Память', '8 ГБ ОЗУ / 256 ГБ'],
        ['Основная камера', '50 Мп + 12 Мп + 5 Мп'],
        ['Фронтальная камера', '32 Мп'],
        ['Батарея', '5000 мА·ч, 25 Вт'],
        ['ОС', 'Android 14'],
        ['Гарантия', '12 месяцев']
      ]
    },
    iphone02: {
      title: 'iPhone 15',
      article: 'EL-002',
      category: 'Смартфоны',
      price: 79990,
      oldPrice: null,
      meta: 'Рейтинг: 4.9 из 5 · В наличии',
      description: 'Компактный смартфон с OLED-дисплеем, чипом A16 Bionic, камерой 48 Мп и разъёмом USB-C.',
      specs: [
        ['Экран', '6.1" OLED, 60 Гц'],
        ['Процессор', 'Apple A16 Bionic'],
        ['Память', '6 ГБ ОЗУ / 128 ГБ'],
        ['Основная камера', '48 Мп + 12 Мп'],
        ['Фронтальная камера', '12 Мп'],
        ['Батарея', '3349 мА·ч, 20 Вт'],
        ['ОС', 'iOS 17'],
        ['Гарантия', '12 месяцев']
      ]
    },
    laptop01: {
      title: 'MacBook Air M3',
      article: 'EL-003',
      category: 'Ноутбуки',
      price: 109990,
      oldPrice: 119990,
      meta: 'Рейтинг: 4.9 из 5 · В наличии',
      description: 'Тонкий ноутбук на чипе M3 с дисплеем Liquid Retina, тихим охлаждением и автономностью до 18 часов.',
      specs: [
        ['Экран', '13.6" Liquid Retina'],
        ['Процессор', 'Apple M3'],
        ['Память', '8 ГБ ОЗУ / 256 ГБ SSD'],
        ['Камера', '1080p FaceTime HD'],
        ['Автономность', 'до 18 часов'],
        ['Порты', '2 × USB-C, MagSafe 3, 3.5 мм'],
        ['ОС', 'macOS Sonoma'],
        ['Гарантия', '12 месяцев']
      ]
    },
    headphones01: {
      title: 'AirPods Pro 2',
      article: 'EL-004',
      category: 'Наушники',
      price: 19990,
      oldPrice: null,
      meta: 'Рейтинг: 4.7 из 5 · В наличии',
      description: 'Беспроводные наушники с активным шумоподавлением, адаптивным звуком и кейсом с MagSafe.',
      specs: [
        ['Тип', 'TWS-вкладыши'],
        ['Чип', 'Apple H2'],
        ['Шумоподавление', 'активное'],
        ['Время работы', 'до 6 ч, до 30 ч с кейсом'],
        ['Подключение', 'Bluetooth 5.3'],
        ['Зарядка', 'USB-C, MagSafe, Qi'],
        ['Защита', 'IP54'],
        ['Гарантия', '12 месяцев']
      ]
    },
    tablet01: {
      title: 'iPad Air 11',
      article: 'EL-005',
      category: 'Планшеты',
      price: 64990,
      oldPrice: null,
      meta: 'Рейтинг: 4.8 из 5 · В наличии',
      description: 'Планшет с дисплеем Liquid Retina, чипом M2 и поддержкой Apple Pencil Pro.',
      specs: [
        ['Экран', '11" Liquid Retina'],
        ['Процессор', 'Apple M2'],
        ['Память', '128 ГБ'],
        ['Основная камера', '12 Мп'],
        ['Фронтальная камера', '12 Мп'],
        ['Автономность', 'до 10 часов'],
        ['ОС', 'iPadOS 17'],
        ['Гарантия', '12 месяцев']
      ]
    },
    watch01: {
      title: 'Apple Watch S9',
      article: 'EL-006',
      category: 'Умные часы',
      price: 39990,
      oldPrice: null,
      meta: 'Рейтинг: 4.6 из 5 · Под заказ',
      description: 'Смарт-часы с ярким Always-On дисплеем, чипом S9 и полным набором датчиков здоровья.',
      specs: [
        ['Корпус', '45 мм'],
        ['Экран', 'Always-On Retina'],
        ['Чип', 'Apple S9'],
        ['GPS', 'есть'],
        ['Датчики', 'пульс, ЭКГ, кислород в крови'],
        ['Автономность', 'до 18 часов'],
        ['Влагозащита', '50 м'],
        ['Гарантия', '12 месяцев']
      ]
    }
  };

  var productTitleEl = document.getElementById('product-title');
  var productData = PRODUCTS[urlProduct];

  if (productTitleEl && productData) {
    var key = urlProduct;
    var widths = ['480', '640', '960'];

    document.title = 'TechShop — ' + productData.title;

    var crumbEl = document.getElementById('product-crumb');
    if (crumbEl) crumbEl.textContent = productData.title;

    productTitleEl.textContent = productData.title;

    var metaEl = document.getElementById('product-meta');
    if (metaEl) {
      metaEl.textContent = 'Артикул ' + productData.article + ' · Категория: ' + productData.category;
    }

    var priceEl = document.getElementById('product-price');
    if (priceEl) {
      priceEl.innerHTML = formatPrice(productData.price) +
        (productData.oldPrice ? ' <del>' + formatPrice(productData.oldPrice) + '</del>' : '');
    }

    var productMetaEl = document.querySelector('.product-meta');
    if (productMetaEl && productData.meta) productMetaEl.textContent = productData.meta;

    var descEl = document.getElementById('product-description');
    if (descEl) descEl.textContent = productData.description;

    var imageEl = document.getElementById('product-image');
    if (imageEl) {
      imageEl.src = 'images/' + key + '-640.jpg';
      imageEl.srcset = widths.map(function (w) {
        return 'images/' + key + '-' + w + '.jpg ' + w + 'w';
      }).join(', ');
      imageEl.alt = productData.title;
    }

    var sourceEl = document.getElementById('product-source');
    if (sourceEl) {
      sourceEl.srcset = widths.map(function (w) {
        return 'images/' + key + '-' + w + '.webp ' + w + 'w';
      }).join(', ');
    }

    var captionEl = document.getElementById('product-caption');
    if (captionEl) captionEl.textContent = 'Технические характеристики: ' + productData.title;

    var specsEl = document.getElementById('product-specs');
    if (specsEl) {
      specsEl.innerHTML = productData.specs.map(function (row) {
        return '<tr><th scope="row">' + row[0] + '</th><td>' + row[1] + '</td></tr>';
      }).join('');
    }

    var orderLink = document.getElementById('product-order-link');
    if (orderLink) orderLink.href = 'order.html?product=' + key;
  }
});
