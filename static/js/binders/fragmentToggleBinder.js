import { FragmentBinder } from '../fragmentBinder.js';

// В первой строке мастер-таблицы есть поля-фильтры
// изменение которых приводит к мзменению содержания
// мастер-таблицы и ассоциироанных slave таблиц
// Здесь мы привязываемся ко всем INPUT-BUTTON элементам
// вложенным в помеченные зоны и в обработчике событий
// вызываем загрузку фрагментов:
// FragmentBinder.load(url, targetId, { value: node_value });

// Закрытые долги и не закрытые долги

export const FragmentToggleBinder = {
    role: 'fragment-toggle',

    attach(el) {
        if (el.__fragmentToggleBinder) {
            //console.warn('⚠️ FragmentToggleBinder: double bind', el);
            //console.trace(); // покажет стек вызова
            return;
        }
        //console.log('FragmentToggleBinder: double bind', el);
        //console.trace(); // покажет стек вызова
        el.__fragmentToggleBinder = true;

        const url = el.dataset.url;
        const targetId = el.dataset.target;

        if (!url || !targetId) {
            console.warn('❌ FragmentToggleBinder: missing URL or targetId', el);
            return;
        }

        const input = el.querySelector('input[type="hidden"]') || el.closest('td')?.querySelector('input[type="hidden"]');
        const icon = el.querySelector('.icon') || el.querySelector('span') || el;

        const iconActive = el.dataset.iconActive || '🟡';
        const iconClosed = el.dataset.iconClosed || '✅';

        if (!input || !icon) {
            console.warn('❌ FragmentToggleBinder: missing input or icon', el);
            return;
        }

        if (el.__fragmentToggleBound) return;
        el.__fragmentToggleBound = true;

        el.addEventListener('click', (event) => {
            event.preventDefault();

            const current = input.value;
            const next = current === 'active' ? 'closed' : 'active';

            input.value = next;
            icon.textContent = next === 'active' ? iconActive : iconClosed;

            FragmentBinder.load(url, targetId, { value: next });
            console.log("TOGGLE →", next);
        });
    },

    attachAll(zone = document) {
        const toggles = zone.querySelectorAll('[data-role="fragment-toggle"]');
        toggles.forEach(el => this.attach(el));
    }
};
