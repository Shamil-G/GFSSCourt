import { TableLoader } from '/static/js/core/TableLoad.js';

export const FilterPeriodBinder = {
    role: 'filter-period',
    massive: true,

    attach(dropdown, handler = null) {
        if (dropdown.__menuBound) return;
        dropdown.__menuBound = true;

        const button = dropdown.querySelector('.dropdown-button');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const items = dropdown.querySelectorAll('.dropdown-content a');

        if (!button || !hiddenInput || items.length === 0) return;

        const labelSpan = button.querySelector('.label');
        const url = dropdown.dataset.url;
        const targetId = dropdown.dataset.target;
        const actionName = dropdown.dataset.action;

        // 🔹 Открытие/закрытие меню по кнопке
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // чтобы не закрывалось сразу
            dropdown.classList.toggle('open');
        });

        // 🔹 Закрытие меню при клике вне
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });

        // 🔹 Обработка выбора пункта
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // чтобы не закрывалось раньше времени

                const value = item.dataset.value || item.textContent.trim();
                const label = item.dataset.label || value;

                hiddenInput.value = value;
                if (labelSpan) labelSpan.textContent = label;

                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                dropdown.dispatchEvent(new CustomEvent('menu-changed', {
                    bubbles: true,
                    detail: { value, label }
                }));

                if (dropdown.__lastValue === value) {
                    console.log(`⚠️ FilterPeriodBinder: duplicate value (${value}) — skip`);
                    dropdown.classList.remove('open'); // но всё равно закрываем
                    return;
                }
                dropdown.__lastValue = value;

                if (actionName) {
                    const fn = window[actionName] || API?.[actionName];
                    if (typeof fn === 'function') {
                        fn(value, label, dropdown);
                    }
                }

                if (targetId && url) {
                    TableLoader.load(url, targetId, { value });
                }

                // 🔹 Закрываем меню после выбора
                dropdown.classList.remove('open');
            });
        });
    },

    attachAll(handler = null, zone = document) {
        const dropdowns = zone.querySelectorAll(`[data-role="${this.role}"]`);
        dropdowns.forEach(dropdown => {
            const tag = dropdown.tagName;
            const allowedTags = ['DIV', 'SECTION', 'LABEL', 'BUTTON'];
            if (!allowedTags.includes(tag)) {
                console.warn(`⚠️ FilterPeriodBinder: skipping unsupported tag <${tag}>`, dropdown);
                return;
            }
            this.attach(dropdown);
        });
    }
};
