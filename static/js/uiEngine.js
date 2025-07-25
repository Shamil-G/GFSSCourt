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
function requireAtLeastOne(fields, errorMessage) {
    const hasValue = fields.some(name => document.querySelector(`input[name='${name}']`)?.value.trim());
    if (!hasValue) {
        alert(errorMessage);
        return false;
    }
    return true;
}
////////////////////////////////////////////////////////////////////
function waitForElementInZone(zone, selector, callback) {
    const el = zone.querySelector(selector);
    if (el) return callback(el);

    const observer = new MutationObserver(() => {
        const el = zone.querySelector(selector);
        if (el) {
            observer.disconnect();
            callback(el);
        }
    });

    observer.observe(zone, { childList: true, subtree: true });
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
    document.getElementById("lawForm").addEventListener("submit", function (event) {
        const submissionDate = document.querySelector("input[name='submission_date']").value.trim();
        const decisionDate = document.querySelector("input[name='decision_date']").value.trim();

        console.log("submissionDate " + submissionDate, "decisionDate " + decisionDate);
    //    if (!submissionDate && !decisionDate) {
    //        console.log("submissionDate and decisionDate is empty")
    //        event.preventDefault();

    //        ModalManager.show({
    //            message: '⚠️ Укажите хотя бы одну дату.',
    //            type: 'validation'
    //        });
    //        //showValidationWarning("⚠️ Укажите хотя бы одну дату: 'Дата подачи' или 'Дата решения'.");
    //        console.log("submissionDate and decisionDate is empty")
    //    }
    });
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
          waitForElementInZone(zone, "#lawForm", () => { // промис на появление формы
              initLawLogic(zone);
          });
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
    .then(async response => {
        try {
            const data = await response.json();
            if (!data.success) {
                const rawMessage = Array.isArray(data.messages)
                    ? data.messages.join('\n')
                    : data.message || 'Неизвестная ошибка';

                const formattedText = rawMessage.replace(/\n/g, '<br>');
                ModalManager.show({ message: formattedText, type: 'validation' });
                submitBtn.textContent = '⚠️ Ошибка!';
                return;
            }

            submitBtn.textContent = '✅ Сохранено!';
            API.refreshTab(formType);
            API.toggleForm(formName, formType);
        } catch (jsonErr) {
            console.warn("Не удалось распарсить JSON:", jsonErr);
            ModalManager.show({
                message: '⚠️ Некорректный ответ от сервера. Проверьте формат JSON.',
                type: 'error'
            });
            submitBtn.textContent = '⚠️ Ошибка парсинга!';
        }
    })
    .catch(() => {
        //renderFlashedMessages('modal-container', ['Ошибка сети. Проверьте подключение.']);
        ModalManager.show({ message: 'Поймали CATCH', type: 'validation' });
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
/////////////////////////////////////////////////////
export const ModalManager = {
    show({ message = '', html = '', type = 'info' }) {
        this.hide(); // Очищаем предыдущую модалку

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.classList.add(`type-${type}`);

        // Вставляем контент
        content.innerHTML = html || `
      <div>${message}</div>
      <button class="close-btn">Ок</button>
    `;

        overlay.appendChild(content);

        // Закрытие по кнопке
        content.querySelector(".close-btn")?.addEventListener("click", () => this.hide());

        // Добавляем в глобальный слой
        document.getElementById('global-modal-layer')?.appendChild(overlay);
    },

    hide() {
        document.querySelectorAll('.modal-overlay')?.forEach(el => el.remove());
    }
};