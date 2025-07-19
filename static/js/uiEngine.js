function showTooltip(target, message) {
  const tooltip = document.createElement('div');
  tooltip.className = 'input-tooltip';
  tooltip.textContent = message;

  const rect = target.getBoundingClientRect();
  tooltip.style.position = 'absolute';
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltip);

  // 🕓 Автоматическое удаление
  setTimeout(() => {
    tooltip.remove();
  }, 3500);
}
////////////////////////////////////////////////////////////////////
function bindMutualExclusive(zone, nameA, nameB) {
  const inputA = zone.querySelector(`[name="${nameA}"]`);
  const inputB = zone.querySelector(`[name="${nameB}"]`);
  
  if (!inputA || !inputB) return;

  inputA.addEventListener('input', () => {
    inputB.disabled = !!inputA.value;
    if (inputA.value) inputB.value = '';
    showTooltip(inputA, 'Поле <📆 Дата погашения> будет недоступно, пока указано значение дня');
  });

  inputB.addEventListener('input', () => {
    inputA.disabled = !!inputB.value;
    if (inputB.value) inputA.value = '';
    showTooltip(inputB, 'Поле <Каждый месяц до> будет недоступно, пока указана дата <📆 Дата погашения>');
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
    initHelpForMarkedCells();
}
function initRefundingLogic(zone) {
    console.log("initRefundingLogic")
}
/////////////////////////////////////////////////
export function addHelperIcon(td) {
  if (td.querySelector('.help-icon')) return;

  const icon = document.createElement('span');
  icon.className = 'help-icon';
  icon.textContent = 'ℹ️';

  icon.addEventListener('click', () => {
    const topic = td.dataset.help;
    fetch(`/help_fragment?topic=${topic}`)
      .then(res => res.text())
      .then(html => {
        const cleaned = html.trim();
        if (!cleaned) {
          showPopover(icon, '<em>Нет информации по этой подсказке</em>');
        } else {
          showPopover(icon, html);
        }
    });
  });

  td.appendChild(icon);
}
////////////////////////////////////////////////
////////////////////////////////////////////////
export function initHelpForMarkedCells() {
    document.querySelectorAll('td.has-helper[data-help]').forEach(td => {
        if (td.querySelector('.help-icon')) return; // защита от повторного добавления

        const icon = document.createElement('span');
        icon.className = 'help-icon';
        icon.textContent = 'ℹ️';

        icon.addEventListener('click', () => {
            const topic = td.dataset.help;
            fetch(`/help_fragment?topic=${topic}`)
                .then(res => res.text())
                .then(html => showPopover(icon, html));
        });

        td.appendChild(icon);
    });
}
////////////////////////////////////////////////
export function showPopover(target, html) {
  const old = document.querySelector('.popover');
  if (old) old.remove();

  const pop = document.createElement('div');
  pop.className = 'popover';

  const close = document.createElement('span');
  close.className = 'popover-close';
  close.textContent = '×';
  close.title = 'Закрыть';
  close.onclick = () => {
    pop.remove();
    document.removeEventListener('click', outsideClick);
  };
  pop.appendChild(close);

  const content = document.createElement('div');
  content.className = 'popover-content';
  content.innerHTML = html;
  pop.appendChild(content);

  document.body.appendChild(pop);

  const rect = target.getBoundingClientRect();
  pop.style.top = `${rect.bottom + window.scrollY + 6}px`;
  pop.style.left = `${rect.left + window.scrollX}px`;

  function outsideClick(e) {
    if (!pop.contains(e.target) && e.target !== target) {
      pop.remove();
      document.removeEventListener('click', outsideClick);
    }
  }

  setTimeout(() => document.addEventListener('click', outsideClick), 0);
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