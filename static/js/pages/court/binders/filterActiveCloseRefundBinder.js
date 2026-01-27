import { TableLoader } from '/static/js/core/TableLoad.js';

// В первой строке мастер-таблицы есть поля-фильтры
// изменение которых приводит к мзменению содержания
// мастер-таблицы и ассоциироанных slave таблиц
// Здесь мы привязываемся ко всем INPUT-BUTTON элементам
// вложенным в помеченные зоны и в обработчике событий
// вызываем загрузку фрагментов:
//
// TableLoader.load(url, targetId, { value: node_value });
//
// Закрытые долги и не закрытые долги

export const FilterActiveCloseRefundBinder = {
    role: 'filter-active-close',
    massive: true,

    attach(el) {
        if (!el) return; // Передана пустая зона ?!
        if (el.__filter_active_close) return;
        el.__filter_active_close = true;

        //console.log('FragmentToggleBinder: double bind', el);
        //console.trace(); // покажет стек вызова

        const tag = el.tagName;
        //console.log(`${this.role}: tag =`, el.tagName);

        const url = el.dataset.url;
        const targetId = el.dataset.target;

        if (!url || !targetId) {
            console.warn('❌ filter-active-close: missing URL or targetId. URL: ', url);
            console.warn('❌ filter-active-close: missing URL or targetId. targetId: ', targetId);
            console.warn('❌ filter-active-close: missing URL or targetId. el: ', el);
            return;
        }

        const show = el.querySelector('span[data-show="show"]') || el.closest('DIV')?.querySelector('span[data-show="show"]');
        const icon = el.querySelector('#activeIcon'); // || el.querySelector('span') || el;

        const iconActive = el.dataset.iconActive || '🟡';
        const iconClosed = el.dataset.iconClosed || '✅';

        if (!icon) {
            console.warn('❌ filter-active-close: missing icon', el);
            return;
        }

        if (!show) {
            console.warn('❌ filter-active-close: missing span show', '\n\tel: ', el);
            return;
        }

        if (el.__fragmentToggleBound) return;
        el.__fragmentToggleBound = true;

        el.addEventListener('click', (event) => {
            event.preventDefault();

            const current = icon.dataset.value;
            const next = current === 'active' ? 'closed' : 'active';

            console.log('current: ', current, );
            //input.value = next;
            icon.dataset.value = next;
            show.textContent = next === 'active' ? 'К завершенным делам' : 'К незавершенным делам';
            icon.textContent = current === 'active' ? iconActive : iconClosed;

            console.log("NOW WILL BE TableLoader. URL: ", url, 'targetId: ', targetId, 'value: ', next);
            TableLoader.load(url, targetId, { value: next });
            console.log("ADDED CLICK LISTENER. TOGGLE →", next);
        });
    },

    attachAll(zone = document) {
        const toggles = zone.querySelectorAll(`[data-role="${this.role}"]`);
        toggles.forEach(el => this.attach(el));
    }
};
