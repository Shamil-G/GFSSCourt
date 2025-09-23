import { initFragment, submitFormViaFetch } from './uiEngine.js';
import { UIBinder } from './uiBinder.js';
import { TabConfig } from './tabConfig.js';

let activeTab = null;
const tabCache = {};
const tabCacheOrder = [];

// Предлагаем обновить данные, если прошло 10 минут
const REFRESH_RECOMMENDED_THRESHOLD = 20 * 60 * 1000; // 10 минут
// Удаляем из кэша принудительно, если прошло 2 часа
const CACHE_LIFETIME = 2 * 60 * 60 * 1000; // 2 часа в мс
// В кэше храним 512 документов
const MAX_CACHE_SIZE = 512;
//////////////////////////////////////////////////////////////////////////////
function getOrderNum() {
  return document.getElementById('sharedOrderNum')?.value || '';
}
function getCurrentTabId() {
    return document.getElementById('sharedTabId')?.value || 'pretrial';
}
//////////////////////////////////////////////////////////////////////////////
function fadeInsert(contentZone, fragment, html) {
    // 1. Погасить
    contentZone.classList.add('fade-out');

    setTimeout(() => {
        // 2. Вставка HTML
        contentZone.innerHTML = '';
        contentZone.appendChild(fragment);

        // 3. Показать
        contentZone.classList.remove('fade-out');
    }, 600); // время синхронизировано с CSS
}
//////////////////////////////////////////////////////////////////////////////
function updateFooterRight(id, text) {
    const tsNode = document.getElementById(`${id}Timestamp`);
    if (tsNode) {
        tsNode.textContent = text;
    } else {
        console.warn(`⚠️ Не удалось найти элемент таймера для "${id}"`);
    }
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
function showTableLoader(tabId, start) {
    const contentZone = document.getElementById(`${tabId}Content`);
    if (!contentZone) return;

    const table = contentZone.querySelector('table');
    if (!table) return;

    let tfoot = table.querySelector('tfoot');

    const centerSpan = tfoot.querySelector(`#footer-center`);
    if (centerSpan) {
        centerSpan.textContent = start === 1 ? 'Загрузка...' : '';
    }
}

// Только при ручном обновлении через кнопку Обновить
function refreshTabDirect(tabId) {
  const orderNum = getOrderNum();
  if (!orderNum) return;

  const contentZone = document.getElementById(`${tabId}Content`);
  const timestampZone = document.getElementById(`${tabId}Timestamp`);
  const cacheKey = `${tabId}_${orderNum}`;

  showTableLoader(tabId,1);

  fetch(`/${tabId}_fragment?order_num=${orderNum}`)
    .then(res => res.text())
      .then(html => {

        const fragment = document.createRange().createContextualFragment(html);
      
        const hasTableRows = fragment.querySelectorAll('table tbody tr').length > 0;

        if (hasTableRows) {
            const cacheKey = `${tabId}_${orderNum}`;
            const cached = tabCache[cacheKey];

            if (!cached || html != cached.html) {
                delete tabCache[cacheKey];
                addToCache(cacheKey, html);
                //contentZone.innerHTML = html;
                contentZone.innerHTML = ''; // очистка
                contentZone.appendChild(fragment);
                //fadeInsert(contentZone, fragment, html);
                //
                timestampZone.textContent = `Обновлено: ${new Date().toLocaleTimeString()}`;
                UIBinder.init();
            }
            else {
                console.info('ℹ️ Обновлений нет! ' + cacheKey);
            }
        }
        tabCache[cacheKey].timestamp = Date.now();

        // ✅ Обновить кнопку в любом случае:
        updateRefreshButton(tabId);
        showTableLoader(tabId, 0);
    })
    .catch(err => {
      console.error(`Ошибка загрузки вкладки ${tabId}:`, err);
    });
}
///////////////////////////////////////////////////////////////////////////
// Кнопка Refresh
function refreshTab(id) {
  const orderNum = getOrderNum();
  if (!orderNum) return;

  const cacheKey = `${id}_${orderNum}`;

  delete tabCache[cacheKey];

  loadTabContent(id); // загрузим заново
  updateRefreshButton(id);
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

  const tabId = getCurrentTabId();
  console.log('filterByOrder. sharedTabId: ' + tabId);
  // Синхронизировать ORDER_NUM во все формы
  // Сейчас это делает submitFormViaFetch"
  //syncOrderNumToForms();

  console.log("filterByOrder", "sharedTabId: "+tabId, "orderNum: " + orderNum)
  loadTabContent(tabId || 'pretrial');
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

  const config = TabConfig[id];
  if (!config) {
    console.warn(`⛔ Не найдена конфигурация вкладки "${id}"`);
    return;
  }

  const url = typeof config.url === 'function' ? config.url(orderNum) : config.url;
  const container = document.querySelector(config.zoneSelector);
  if (!container) {
    console.error(`❌ Зона "${config.zoneSelector}" не найдена`);
    return;
  }

  const cacheKey = `${id}_${orderNum}`;

  // ✅ Кэш
  if (tabCache[cacheKey]) {
    const cached = tabCache[cacheKey];
    container.innerHTML = cached.html;

    updateRefreshButton(id);
      let element = document.getElementById(`${id}Timestamp`)
      if (element)
          element.textContent = `🕓 Загружено ${formatAge(cached.timestamp)}`;
      //document.getElementById(`${id}Timestamp`).textContent = `🕓 Загружено ${formatAge(cached.timestamp)}`;
    // После потери фокуса закэшированных Табов, слетают привязки, в том числе helper и их надо ставить по новой
    UIBinder.init(document.getElementById(id));
    return;
  }

  // ⏳ Загрузка...
  container.innerHTML = '<div class="tab-loading">⏳ Идёт загрузка...</div>';

  fetch(url)
    .then(res => res.text())
    .then(html => {
      container.classList.add('fade-out');
      setTimeout(() => {
        container.innerHTML = html;

        initFragment(container, id);
        config.onInit?.(container);

        //document.getElementById(`${id}Timestamp`).textContent = `🕓 Загружено ${formatAge(Date.now())}`;
        // ✅ Ищем таймстамп внутри container
        const tsNode = container.querySelector(`#${id}Timestamp`);
        if (tsNode) {
            tsNode.textContent = `🕓 Загружено ${formatAge(Date.now())}`;
        }

        container.classList.remove('fade-out');
        addToCache(cacheKey, html);
        updateRefreshButton(id);
        UIBinder.init(container);
      }, 150);
    })
    .catch(err => {
      container.innerHTML = `<div class="tab-error">❌ Ошибка: ${err.message}</div>`;
      console.error(`Ошибка загрузки вкладки "${id}":`, err);
    });
}
/////////////////////////////////////////////////////////////////////////////////
// Переходим с одного tab на другой и должны показываться соответствующие панели
// Функция переключения между вкладками с выборкой его содержимого
// Функция привязывается в list_overpayments.html 
function showTab(id) {
  console.log("showTab. ID: " + id);
  const sharedTab = document.getElementById('sharedTabId');
  if (sharedTab) sharedTab.value = id;

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

  loadTabContent(id);
}

// End ShowTab
//////////////////////////////////////////////////////////////////////////////////
// Переключаем область видимости на кнопке "Добавить" в области TAB
function toggleForm(formName,formType) {
    const container = document.getElementById(`${formName}Container`);
    const form = document.getElementById(formName);

    // Найдем  panel, в которой находится container и кнопка Добавить
    const panel = container.closest('.tab-panel');
    const addBtn = panel?.querySelector('.add-btn');

  if (form) {
    // Если форма уже загружена — удалим
      container.innerHTML = '';
      // Изменим название кнопки на Добавить
      if (addBtn) {
          addBtn.textContent = addBtn.dataset.labelAdd;
      }
  } else {
    // Загружаем HTML по fetch
    fetch(`/form_fragment?form=${formType}&order_num=${getOrderNum()}`)
      .then(response => response.text())
      .then(html => {
          container.innerHTML = html;
          UIBinder.init();

          console.log("toggleForm " + formName, "FormType " + formType);

        // привязываем к Форме вызов функции submitFormViaFetch(formName, formType)
        // при событии submit
        const form = document.getElementById(formName);
        if (form) {
          form.addEventListener('submit', event => {
            event.preventDefault(); // ❗ Не даём браузеру перезагрузить страницу
            submitFormViaFetch(formName, formType, getOrderNum()); // 🔄 Отправляем асинхронно
          });
        }
        
        const formZone = container; // или document.getElementById(formName)
        initFragment(formZone, formType);  // ⬅️ логика конкретной вкладки
        // Синхронизировать ORDER_NUM во все формы
        // Сейчас это делает submitFormViaFetch"
        // syncOrderNumToForms(); // вставить значение в форму

        // В конце загрузки изменим название кнопки Добавить на Закрыть
        if (addBtn) {
            addBtn.textContent = addBtn.dataset.labelClose;
        }

      })
      .catch(error => console.error('Error load fragment form: ${formType}:', error));
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// При первоначальной загрузке страницы должна получить первый order_num
window.addEventListener('DOMContentLoaded', () => {
  const firstRow = document.querySelector('table tbody tr[data-order]');
  let orderNum = null;

  if (firstRow) {
    orderNum = firstRow.dataset.order;
    console.log("First Load Page. orderNum: " + orderNum);

    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const sharedTab = document.getElementById('sharedTabId');
    const tabFromField = sharedTab?.value;

    activeTab = tabFromUrl || tabFromField || 'pretrial';

    // 💡 Установим всё в правильной последовательности:
    filterByOrder(orderNum);
    console.log("DOMContentLoaded. ActiveTab: "+activeTab)
    showTab(activeTab);
  }

  // 🔘 Кнопки форм
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const formName = btn.dataset.form;
      const formType = btn.dataset.type;
      API.toggleForm(formName, formType);
    });
  });

  //document.querySelectorAll('.clickable-row').forEach(row => {
  //  row.addEventListener('click', () => {
  //    const orderNum = row.dataset.order;
  //    API.filterByOrder(orderNum); // возможно, без tabId — если уже сохранён currentTab
  //  });
  //});

  // 🔁 Кнопки "Обновить"
  const tabsZone = document.querySelector('.tabs');
  if (tabsZone) {
    tabsZone.addEventListener('click', e => {
      const btn = e.target;
      if (btn.classList.contains('refresh-btn') && btn.dataset.tab) {
        const tabId = btn.dataset.tab;
        API.refreshTabDirect(tabId);
      }
    });
  }

  // 🧩 Общая инициализация UI
    UIBinder.init();

    //// 📦 Клики по строкам. Привязываем к таблице
    document.getElementById('tableBody').addEventListener('click', event => {
        const row = event.target.closest('.clickable-row');
        if (row) {
            const orderNum = row.dataset.order;
            API.filterByOrder(orderNum);
        }
    });

    function handleMenuChanged(event) {
        const dropdown = event.target;
        // Фильтрация по вашему атрибуту
        if (dropdown.getAttribute('data-track') === 'true') {
            const { value } = event.detail;
            const url = dropdown.getAttribute('data-url')

            if (!url) {
                console.log('handleMenuItemDropDown without URL: ', dropdown)
                return
            }
            updateTable(url, value);
        }
    }

    document.addEventListener('menu-changed', handleMenuChanged);
});
///////////////////////////////////////////////////////////////////////
function updateTable(url, period) {
    fetch(`${url}?period=${encodeURIComponent(period)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error on request: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const tbody = document.getElementById('tableBody');
            if (!tbody) {
                console.warn('tableBody not found');
                return;
            }
            // Remove all rows with data-order (data)
            const rowsToRemove = tbody.querySelectorAll('tr[data-order]');
            rowsToRemove.forEach(row => row.remove());

            // Append new string
            const tempContainer = document.createElement('tbody');
            tempContainer.innerHTML = html;

            const newRows = tempContainer.querySelectorAll('tr');
            newRows.forEach(row => tbody.appendChild(row));

            // 🔁 Повторная привязка событий
            // rebindTableEvents();
        })
        .catch(error => {
            console.error('Error on update table:', error);
        });
}



const globalAPI = {
  filterByOrder,
  toggleForm,
  refreshTab,
  refreshTabDirect,
  showTab,
  loadTabContent,
  syncOrderNumToForms,
  formatAge,
  updateRefreshButton,
  // добавляй по мере необходимости
  submitFormViaFetch
};

window.API = globalAPI;
