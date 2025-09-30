import { FragmentBinder } from '../fragmentBinder.js';

// В первой строке мастер-таблицы есть поля-фильтры
// изменение которых приводит к мзменению содержания
// мастер-таблицы и ассоциироанных slave таблиц
// Здесь мы привязываемся ко всем INPUT-BUTTON элементам
// вложенным в помеченные зоны и в обработчике событий
// вызываем загрузку фрагментов:
// FragmentBinder.load(url, targetId, { value: node_value });

// Фильтруем по ИИН

export const FragmentTriggerBinder = {
    role: 'fragment-trigger',

    attach(el) {
        if (el.__fragmentTriggerBound) {
            //console.warn('⚠️ FragmentTriggerBinder: double bind', el);
            //console.trace(); // покажет стек вызова
            return;
        }
        //console.log('FragmentTriggerBinder: FIRST bind', el);
        //console.trace(); // покажет стек вызова
        el.__fragmentTriggerBound = true;

        const url = el.dataset.url;
        const targetId = el.dataset.target;

        if (!url || !targetId) {
            console.warn('❌ FragmentTriggerBinder: missing URL or targetId', el);
            return;
        }

        const keydownTags = ['INPUT'];
        const clickTags = ['BUTTON', 'A'];

        const bindKeydown = (node) => {
            if (!node.__fragmentKeydownBound) {
                node.__fragmentKeydownBound = true;
                node.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();

                        const node_value = node.value;
                        if (node.__lastValue === node_value) {
                            console.log(`⚠️ FragmentTriggerBinder: повторное значение (${node_value}) — вызов пропущен`);
                            return;
                        }
                        node.__lastValue = node_value;
                        FragmentBinder.load(url, targetId, { value: node_value });
                        //console.log("FragmentTriggerBinder. KEYDOWN_VALUE: ", node.value);
                    }
                });
            }
        };

        const bindClick = (node) => {
            if (!node.__fragmentClickBound) {
                node.__fragmentClickBound = true;
                node.addEventListener('click', (event) => {
                    event.preventDefault();

                    const input = el.querySelector('input');
                    const click_value = input?.value ?? null;

                    if (input && input.__lastValue === click_value) {
                        console.log(`⚠️ FragmentTriggerBinder: повторное значение (${click_value}) — вызов пропущен`);
                        return;
                    }

                    if (input) input.__lastValue = click_value;
                    FragmentBinder.load(url, targetId, { value: click_value });
                    //console.log("FragmentTriggerBinder. CLICK_VALUE: ", click_value);
                });
            }
        };


        // Привязка к самому el
        const tag = el.tagName;
        if (keydownTags.includes(tag)) bindKeydown(el);
        if (clickTags.includes(tag)) bindClick(el);

        // Привязка ко вложенным элементам
        const all = el.querySelectorAll('*');
        all.forEach(child => {
            const childTag = child.tagName;
            if (keydownTags.includes(childTag)) bindKeydown(child);
            if (clickTags.includes(childTag)) bindClick(child);
        });
    }
    ,

    attachAll(zone = document) {
        const triggers = zone.querySelectorAll('[data-role="fragment-trigger"]');
        triggers.forEach(el => this.attach(el));
    }
};
