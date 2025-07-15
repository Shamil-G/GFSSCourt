let currentTabId = null;
const tabCache = {};
const tabCacheOrder = [];

// Предлагаем обновить данные, если прошло 10 минут
const REFRESH_RECOMMENDED_THRESHOLD = 10 * 60 * 1000; // 10 минут
// Удаляем из кэша принудительно, если прошло 2 часа
const CACHE_LIFETIME = 2 * 60 * 60 * 1000; // 2 часа в мс
// В кэше храним 512 документов
const MAX_CACHE_SIZE = 512;
//////////////////////////////////////////////////////////////////////////////
function getOrderNum() {
  return document.getElementById('sharedOrderNum')?.value || '';
}
//////////////////////////////////////////////////////////////////////////////
function updateRefreshButton(id){
  const orderNum = getOrderNum();
  if (!orderNum) return;

  const cacheKey = `${id}_${orderNum}`;
  const cached = tabCache[cacheKey];
  if (!cached) return;

  const age = Date.now() - cached.timestamp;

  const refreshTarget = document.getElementById(`${id}RefreshButton`);
  if (!refreshTarget) return;

  if (age > REFRESH_RECOMMENDED_THRESHOLD) {
    refreshTarget.textContent = '🔁 Рекомендуем обновить';
    refreshTarget.classList.add('recommend');
    refreshTarget.title = `Загружено ${formatAge(cached.timestamp)} назад`;
  } else {
    refreshTarget.textContent = '🔄 Обновить';
    refreshTarget.classList.remove('recommend');
    refreshTarget.title = `Обновлено ${formatAge(cached.timestamp)} назад`;
  }
}
//////////////////////////////////////////////////////////////////////////////
function formatAge(timestamp) {
  const now = Date.now();
  const delta = now - timestamp;

  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ч назад`;
}
/////////////////////////////////////////////////////////////////////////////
function addToCache(key, html) {
  const now = Date.now();

  // Удалим старые
  for (const [k, v] of Object.entries(tabCache)) {
    if (now - v.timestamp > CACHE_LIFETIME) {
      delete tabCache[k];
      const index = tabCacheOrder.indexOf(k);
      if (index !== -1) tabCacheOrder.splice(index, 1);
    }
  }

  // Ограничение по размеру
  if (tabCacheOrder.length >= MAX_CACHE_SIZE) {
    const oldestKey = tabCacheOrder.shift();
    delete tabCache[oldestKey];
  }

  // Добавим свежий
  tabCache[key] = { html, timestamp: now };
  tabCacheOrder.push(key);
}
///////////////////////////////////////////////////////////////////////////
// Кнопка Refresh
function refreshTab(id) {
  const orderNum = getOrderNum();
  if (!orderNum) return;

  const cacheKey = `${id}_${orderNum}`;

  delete tabCache[cacheKey];

  loadTabContent(id); // загрузим заново
}
///////////////////////////////////////////////////////////////////////////
// Главная таблица переплат в LIST_OVERPAYMENTS.HTML
// Когда щелкаем мышкой по записям TR надо менять фильтр orderNum для TABS
function filterByOrder(orderNum) {
  // После клика мышкой - делаем подсветку выбранной строки
  const rows = document.querySelectorAll('table tbody tr[data-order]');
  rows.forEach(row => {
      row.classList.toggle('active-row', row.dataset.order === orderNum);
  });

  // Установить общее поле
  const shared = document.getElementById('sharedOrderNum');
  if (shared) shared.value = orderNum;

  // Синхронизировать ORDER_NUM во все формы
  syncOrderNumToForms();

  loadTabContent(currentTabId);
}
/////////////////////////////////////////////////////////////////////////////////////
function syncOrderNumToForms() {
  const shared = document.getElementById('sharedOrderNum');
  if (!shared) return;

  const value = shared.value;

  // Найти все input[name="order_num"] с атрибутом form
  document.querySelectorAll('input[name="order_num"][form]').forEach(input => {
    input.value = value;
  });
}
////////////////////////////////////////////////////////////////////////////////////
// По выбранному TAB загружаем его содержимое
function loadTabContent(id) {
  const orderNum = getOrderNum();
  if (!orderNum) return;

  let url = '';
  let containerId = '';

  switch (id) {
    case 'pretrial':
      url = `/pretrial_fragment?order_num=${orderNum}`;
      containerId = 'pretrialContent';
      break;
    case 'law':
      url = `/law_fragment?order_num=${orderNum}`;
      containerId = 'lawContent';
      break;
    case 'court':
      url = `/court_fragment?order_num=${orderNum}`;
      containerId = 'courtContent';
      break;
    case 'appeal':
      url = `/appeal_fragment?order_num=${orderNum}`;
      containerId = 'appealContent';
      break;
    case 'execution':
      url = `/execution_fragment?order_num=${orderNum}`;
      containerId = 'executionContent';
      break;
    default:
      console.warn(` Unknown TABS: ${id}`);
      return;
  }

  const cacheKey = `${id}_${orderNum}`;
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container "${containerId}" not found`);
    return;
  }

  // ✅ Если есть в кэше — сразу вставляем
  if (tabCache[cacheKey]) {
    const cached = tabCache[cacheKey];
    container.innerHTML = cached.html;
    updateRefreshButton(id);

    document.getElementById(`${id}Timestamp`).textContent = `🕓 Загружено ${formatAge(cached.timestamp)}`;
    return;
  }

  // 🔹 Показ сообщения "Загрузка..."
  container.innerHTML = '<div class="tab-loading">⏳ Идёт загрузка...</div>';

  fetch(url)
    .then(response => response.text())
    .then(html => {
      container.classList.add('fade-out');
      setTimeout(() => {
        container.innerHTML = html;
        document.getElementById(`${id}Timestamp`).textContent = `🕓 Загружено ${formatAge(Date.now())}`;
        container.classList.remove('fade-out');
        // tabCache[cacheKey] = html; // Сохраняем фрагмент
        addToCache(cacheKey, html);
        updateRefreshButton(id);
      }, 150);
    })
    .catch(error => {
      container.innerHTML = `<div class="tab-error">❌ Error: ${error.message}</div>`;
      console.error(`Error on loadTabContent "${id}":`, error);
    });


}
/////////////////////////////////////////////////////////////////////////////////
// Переходим с одного tab на другой и должны показываться соответствующие панели
// Функция переключения между вкладками с выборкой его содержимого
function showTab(id) {
  currentTabId = id;
  // Скрыть все панели
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Показать нужную панель
  const targetPanel = document.getElementById(id);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Убрать активность со всех кнопок
  document.querySelectorAll('.tab-buttons .tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Активировать соответствующую кнопку
  const tabButtons = document.querySelectorAll('.tab-buttons .tab');
  tabButtons.forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(id)) {
      btn.classList.add('active');
    }
  });
  loadTabContent(currentTabId);
}

// End ShowTab
//////////////////////////////////////////////////////////////////////////////////
// Переключаем область видимости на кнопке "Добавить" в области TAB
function toggleForm(formName,formType) {
  const container = document.getElementById(`${formName}Container`);
  const form = document.getElementById(formName);

  if (form) {
    // Если форма уже загружена — удалим
    container.innerHTML = '';
  } else {
    // Загружаем HTML по fetch
    fetch(`/form_fragment?form=${formType}&order_num=${getOrderNum()}`)
      .then(response => response.text())
      .then(html => {
        container.innerHTML = html;
        syncOrderNumToForms(); // вставить значение в форму
      })
      .catch(error => console.error('Error load fragment form: ${formType}:', error));
  }
}

// При первоначальной загрузке страницы должна получить первый order_num
window.addEventListener('DOMContentLoaded', () => {
  const firstRow = document.querySelector('table tbody tr[data-order]');
  if (firstRow) {
    const orderNum = firstRow.dataset.order;
    console.log("First Load Page. orderNum: "+orderNum)
    filterByOrder(orderNum);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (tab) {
    showTab(tab);
  } else {
    showTab('pretrial'); // по умолчанию
  }
});

