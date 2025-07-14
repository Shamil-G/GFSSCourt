let currentTabId = null;

function getOrderNum() {
  return document.getElementById('sharedOrderNum')?.value || '';
}

// ������� ������� �������� � LIST_OVERPAYMENTS.HTML
// ����� ������� ������ �� ������� TR ���� ������ ������ orderNum ��� TABS
function filterByOrder(orderNum) {
  // ����� ����� ������ - ������ ��������� ��������� ������
  const rows = document.querySelectorAll('table tbody tr[data-order]');
  rows.forEach(row => {
      row.classList.toggle('active-row', row.dataset.order === orderNum);
  });

  // ���������� ����� ����
  const shared = document.getElementById('sharedOrderNum');
  if (shared) shared.value = orderNum;

  console.log('filter By Order: ' + orderNum, "TAB: " + currentTabId);
  // ���������������� ORDER_NUM �� ��� �����
  syncOrderNumToForms();

  loadTabContent(currentTabId);
}
/////////////////////////////////////////////////////////////////////////////////////
function syncOrderNumToForms() {
  const shared = document.getElementById('sharedOrderNum');
  if (!shared) return;

  const value = shared.value;

  // ����� ��� input[name="order_num"] � ��������� form
  document.querySelectorAll('input[name="order_num"][form]').forEach(input => {
    input.value = value;
  });
}
////////////////////////////////////////////////////////////////////////////////////
// �� ���������� TAB ��������� ��� ����������
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
// ��������� � ������ tab �� ������ � ������ ������������ ��������������� ������
// ������� ������������ ����� ��������� � �������� ��� �����������
function showTab(id) {
  console.log("Show Tab:", id);
  currentTabId = id;
  // ������ ��� ������
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // �������� ������ ������
  const targetPanel = document.getElementById(id);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // ������ ���������� �� ���� ������
  document.querySelectorAll('.tab-buttons .tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // ������������ ��������������� ������
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
// ����������� ������� ��������� �� ������ "��������" � ������� TAB
function toggleForm(formName,formType) {
  const container = document.getElementById(`${formName}Container`);
  const form = document.getElementById(formName);

  console.log("toggleForm triggered:", formName, formType);
  if (form) {
    // ���� ����� ��� ��������� � ������
    container.innerHTML = '';
  } else {
    // ��������� HTML �� fetch
    fetch(`/form_fragment?form=${formType}&order_num=${getOrderNum()}`)
      .then(response => response.text())
      .then(html => {
        container.innerHTML = html;
        syncOrderNumToForms(); // �������� �������� � �����
      })
      .catch(error => console.error('Error load fragment form: ${formType}:', error));
  }
}

// ��� �������������� �������� �������� ������ �������� ������ order_num
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
    showTab('pretrial'); // �� ���������
  }
});

