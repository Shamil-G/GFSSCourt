//import { submitFormViaFetch } from './uiEngine.js';
//import { TabConfig } from './tabConfig.js';

//import  * as TabUtil from './tabUtil.js';

//import { TabRegistry, defaultTabInit } from './tabRegistry.js';
//import { FragmentBinder } from './fragmentBinder.js';
//import { BinderRegistry } from './binderRegistry.js';
//import { bootstrapBinders } from './bootstrapBinders.js';


let activeTab = null;

///////////////////////////////////////////////////////////////
// По выбранному TAB загружаем его содержимое
// id - это имя зоны - Таб, например, "pretrial"
function loadTabContent(tabName, orderNum) {
    if (!orderNum) return;

    const contentZone = TabUtil.getTargetZone(tabName);

    if (!contentZone) {
        console.error(`❌ Зона "${config.zoneSelector}" не найдена`);
        return;
    }

    // ⏳ Загрузка...
    TabUtil.showLoadingMessage(tabName);

    //TabUtil.showTabLoader(contentZone, 1);
    TabRegistry.load(tabName, orderNum).then(() => {
        TabUtil.showTabLoader(contentZone, 0);
        TabUtil.showLoadedAge(contentZone, tabName);
    });
}
///////////////////////////////////////////////////////////////
// Главная таблица переплат в LIST_OVERPAYMENTS.HTML
// Когда щелкаем мышкой по записям TR надо менять фильтр orderNum для TABS
function filterByOrder(orderNum) {
    // Установить общее поле
    const shared = document.getElementById('sharedOrderNum');

    if (!shared || shared.value === orderNum) return;

    shared.value = orderNum;

    // После клика мышкой - делаем подсветку выбранной строки
    const rows = document.querySelectorAll('table tbody tr[data-order]');
    rows.forEach(row => {
        row.classList.toggle('active-row', row.dataset.order === orderNum);
    });

    const tabName = TabUtil.getCurrentTabId();
    if (!TabUtil.loadFromCache(tabName, orderNum)) {
        loadTabContent(tabName, orderNum);
    }
}
///////////////////////////////////////////////////////////////
// Обновляем таблицу в ТАБ (фрагменте) 
// нажатием кнопки "Обновить" в ТАБ-ах
function refreshTabDirect(tabName) {
    const orderNum = TabUtil.getOrderNum();
    if (!orderNum) return;

    const contentZone = TabUtil.getTargetZone(tabName);
    const cacheKey = TabUtil.getCacheKey(tabName, orderNum);

    delete TabUtil.tabCache[cacheKey];

    loadTabContent(tabName, orderNum);
}
/////////////////////////////////////////////////////////////////////////////////
// Переходим с одного tab на другой и должны показываться соответствующие панели
// Функция переключения между вкладками с выборкой его содержимого
// Функция привязывается в list_overpayments.html 
function showTab(tabName) {
    const sharedTab = document.getElementById('sharedTabId');
    if (sharedTab) sharedTab.value = tabName;

    // Скрыть все панели
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    // Показать нужную панель
    const targetPanel = document.getElementById(tabName);
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
        if (btn.getAttribute('onclick')?.includes(tabName)) {
        btn.classList.add('active');
    }
    });
    if (!TabUtil.loadFromCache(tabName, TabUtil.getOrderNum()))
        loadTabContent(tabName, TabUtil.getOrderNum());
}
// End ShowTab

//////////////////////////////////////////////////////////////////////
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
    }
    else {
    // Загружаем HTML по fetch
    fetch(`/form_fragment?form=${formType}&order_num=${TabUtil.getOrderNum()}`)
      .then(response => response.text())
      .then(html => {
        container.innerHTML = html;

        const form = document.getElementById(formName);
          if (form) {
            //console.log("BinderRegistry. init form:", form)
            BinderRegistry.init(form);

            form.addEventListener('submit', event => {
                event.preventDefault(); // ❗ Не даём браузеру перезагрузить страницу
                submitFormViaFetch(formName, formType, TabUtil.getOrderNum()); // 🔄 Отправляем асинхронно
            });
        }
        
        //const formZone = container; // или document.getElementById(formName)
        //initFragment(formZone, formType);  // ⬅️ логика конкретной вкладки

        if (addBtn) {
            addBtn.textContent = addBtn.dataset.labelClose;
        }

      })
      .catch(error => console.error('Error load fragment form: ${formType}:', error));
  }
}
//////////////////////////////////////////////////////////////////////////////////////

export function filterByPeriod(period_value, label, dropdown) {
    // Фильтрация по вашему атрибуту
    if (dropdown.getAttribute('data-track') === 'true') {
        const url = dropdown.getAttribute('data-url')
        if (!url) {
            console.log('handleMenuItemDropDown without URL: ', dropdown)
            return
        }
        FragmentBinder.load(url, 'tableBody', { value: period_value });
    }
}

/////////////////////////////////////////////////////////////////////////////////////

// При первоначальной загрузке страницы должна получить первый order_num
window.addEventListener('DOMContentLoaded', () => {
    // 🔘 Кнопки ADD на ТАБ-ах открывают или сворачивают форму
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const formName = btn.dataset.form;
            const formType = btn.dataset.type;
            API.toggleForm(formName, formType);
        });
    });

    // 🔁 Кнопки "Обновить" на Таб-ах обновляют таблицы с историей
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
    //    bootstrapBinders();
    //    BinderRegistry.init(document);
//    import { bootstrapBinders } from './bootstrapBinders.js';
//    bootstrapBinders();
});


const globalAPI = {
  filterByOrder,
  toggleForm,
  //refreshTab,
  refreshTabDirect,
  showTab,
  loadTabContent,
  //syncOrderNumToForms,
  //updateRefreshButton,
  filterByPeriod
  // добавляй по мере необходимости
  //,submitFormViaFetch
};

window.API = globalAPI;
