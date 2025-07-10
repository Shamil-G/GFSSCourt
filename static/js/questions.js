let currentQuestionId = null;

function updateAnswers(answers) {
    const container = document.getElementById('answers-container');
    container.innerHTML = '';

    answers.forEach(answer => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('answer-item');
        wrapper.dataset.answerNum = answer.num_answer;

        const circle = document.createElement('div');
        circle.classList.add('circle');
        if (answer.selected == 'Y') {
            circle.classList.add('active');
            console.log('Answer selected. num_answer:', answer.num_answer);
        }

        console.log('NUM_ANSWER: ' + answer.num_answer, 'SELECTED: ' + answer.selected);

        const label = document.createElement('span');
        label.textContent = answer.answer;

        wrapper.appendChild(circle);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        wrapper.addEventListener('click', () => {
            console.log('Send answer selected. num_answer:', answer.num_answer);
            sendAnswer(answer.num_answer);
            markSelected(answer.num_answer);
        });

    });
}
function markSelected(num_answer) {
    document.querySelectorAll('.circle').forEach(circle => {
        circle.classList.remove('active');
    });

    const newSelected = document.querySelector(`[data-answer-num="${num_answer}"] .circle`);
    if (newSelected) {
        newSelected.classList.add('active');
    }
    else {
        console.warn('Element with data-answer-num=' + num_answer + ' not found');
    }
}
function sendAnswer(numAnswer) {
    fetch('/anketa/save_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_answer: numAnswer })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Answer saved: ' + numAnswer, data.status);
        })
        .catch(error => console.error('Error on saved answer:', error));
}
// 🧭 Обновляет отображение навигационных кнопок
function updateNavButtons(currentNum, cntQuestion) {
    const toggle = (id, show) => {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? 'inline-block' : 'none';
    };

    console.log('updateNavButton', 'currentNum: ', currentNum, 'cntQuestion :', cntQuestion);

    toggle('to_left', currentNum > 1);
    toggle('to_first', currentNum > 1);
    toggle('to_next', currentNum < cntQuestion);
    toggle('to_last', currentNum < cntQuestion);
    toggle('to_finish', currentNum >= cntQuestion);
}
function initQuestion(data) {
    document.getElementById('question').textContent = data.question;
    document.getElementById('num_question').textContent = data.current_num_question + ':';
    document.getElementById('timer').textContent = data.remain_time;
    currentQuestionId = data.current_num_question;

    console.log('INITQuestion', data.cnt_question)
    updateNavButtons(data.current_num_question, data.cnt_question);
    updateAnswers(data.answers);
}

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function () {
        const action = this.dataset.action;
        console.log('Action:', action);

        fetch('/anketa/goto_question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ action })
        })
            .then(response => response.json())
            .then(data => {
                initQuestion(data);
            })
            .catch(error => console.error('Ошибка при переключении вопроса:', error));
    });
});