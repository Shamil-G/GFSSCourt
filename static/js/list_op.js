let currentTabId = null;

function getOrderNum() {
  return document.getElementById('sharedOrderNum')?.value || '';
}

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

  console.log('filter By Order: ' + orderNum, "TAB: " + currentTabId);
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

  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
    })
    .catch(error => {
      console.error(`Error on loading TAB "${id}":`, error);
    });
}
/////////////////////////////////////////////////////////////////////////////////
// Переходим с одного tab на другой и должны показываться соответствующие панели
// Функция переключения между вкладками с выборкой его содержимого
function showTab(id) {
  console.log("Show Tab:", id);
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

  console.log("toggleForm triggered:", formName, formType);
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

