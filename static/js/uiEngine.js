import { showTooltipPopover } from './popoverEngine.js';

////////////////////////////////////////////////////////////////////
function bindMutualExclusive(zone, nameA, nameB) {
  const inputA = zone.querySelector(`[name="${nameA}"]`);
  const inputB = zone.querySelector(`[name="${nameB}"]`);
  
  if (!inputA || !inputB) return;

  inputA.addEventListener('input', () => {
    inputB.disabled = !!inputA.value;
    if (inputA.value) inputB.value = '';
    showTooltipPopover(inputA, 'Поле <📆 Дата погашения> будет недоступно, пока указано значение дня');
  });

  inputB.addEventListener('input', () => {
    inputA.disabled = !!inputB.value;
    if (inputB.value) inputA.value = '';
    showTooltipPopover(inputB, 'Поле <Каждый месяц до> будет недоступно, пока указана дата <📆 Дата погашения>');
  });
}
////////////////////////////////////////////////////////////////////
function initPretrialLogic(zone) {
  console.log("initPretrialLogic");

  bindMutualExclusive(zone, 'until_day', 'execution_date');
}

function initScammerLogic(zone) {
    console.log("initScammerLogic")
}

function initLawLogic(zone) {
    console.log("initLawLogic")
}

function initCourtCrimeLogic(zone) {
    console.log("initCourtCrimeLogic")
}
function initCourtCivLogic(zone) {
    console.log("initCourtCivLogic")
}
function initAppealLogic(zone) {
    console.log("initAppealLogic")
}
function initExecutionLogic(zone) {
    console.log("initExecutionLogic");
}
function initRefundingLogic(zone) {
    console.log("initRefundingLogic")
}
// Добавляем хелперы для основной таблицы
// Вызываем настройку логики для фрагментов форм, 
// встраеваемых через вызов javascript loadTabContent
export function initFragment(zone, tabId) {
  switch (tabId) {
    case 'pretrial':
      initPretrialLogic(zone);
      break;
    case 'scammer':
      initScammerLogic(zone);
      break;
    case 'law':
      initLawLogic(zone);
      break;
    case 'court_crime':
      initCourtCrimeLogic(zone);
      break;
    case 'court_civ':
      initCourtCivLogic(zone);
      break;
    case 'appeal':
      initAppealLogic(zone);
      break;
    case 'execution':
      initExecutionLogic(zone);
      break;
    case 'refunding':
      initRefundingLogic(zone);
      break;
  }
}
/////////////////////////////////////////////////////
let formSubmitting = false;

export function submitFormViaFetch(formName, formType, order_num) {
  if (formSubmitting) return;

  console.log("submitFormViaFetch. order_num: " + order_num)
  const form = document.getElementById(formName);
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Сохраняем...';
  formSubmitting = true;

  const formData = new FormData(form);
  formData.append('order_num', order_num);
  
  const endpoint = `/add_${formType}`;

  fetch(endpoint, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.text(); // или .json()
    })
    .then(() => {
      submitBtn.textContent = '✅ Сохранено!';
      API.refreshTab(formType);
      API.toggleForm(formName, formType);
    })
    .catch(() => {
      submitBtn.textContent = '⚠️ Ошибка сети!';
    })
    .finally(() => {
      formSubmitting = false;
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 2000);
    });
}
