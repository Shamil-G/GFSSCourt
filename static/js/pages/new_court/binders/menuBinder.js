import { TableLoader } from '/static/js/core/TableLoad.js';

export const MenuBinder = {
    role: 'menu',
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
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // 🔹 Закрытие меню при клике вне dropdown
        document.addEventListener('click', (e) => {
            // Если клик был не внутри dropdown — закрываем
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        console.log("button: ", button, 'items: ', items, 'dropdown: ', dropdown);

        // 🔹 Обработка кликов по пунктам меню
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value || item.textContent.trim();
                const label = item.dataset.label || value;

                hiddenInput.value = value;
                if (labelSpan) labelSpan.textContent = label;

                console.log("item: ", item, 'value: ', value, 'label: ', label);

                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                dropdown.dispatchEvent(new CustomEvent('menu-changed', {
                    bubbles: true,
                    detail: { value, label }
                }));

                if (dropdown.__lastValue === value) {
                    console.log(`⚠️ MenuBinder: duplicate value (${value}) — handler call skipped`);
                    dropdown.classList.remove('open');
                    return;
                }
                dropdown.__lastValue = value;

                console.log(`MenuBinder. Dropdown: ${value}`);

                if (actionName) {
                    const fn = window[actionName] || API?.[actionName];
                    if (typeof fn === 'function') {
                        fn(value, label, dropdown);
                    } else {
                        console.warn(`❌ MenuBinder: handler '${actionName}' not found`);
                    }
                }

                if (targetId && url) {
                    TableLoader.load(url, targetId, { value });
                }

                // Закрываем меню после выбора
                dropdown.classList.remove('open');
            });
        });
    },

    attachAll(handler = null, zone = document) {
        const dropdowns = zone.querySelectorAll(`[data-role="${this.role}"]`);
        dropdowns.forEach(dropdown => {
            const tag = dropdown.tagName;
            const allowedTags = ['DIV', 'SECTION', 'LABEL'];
            if (!allowedTags.includes(tag)) {
                console.warn(`⚠️ MenuBinder. for role ${this.role} skipping non-DIV, SECTION, LABEL element <${tag}>`, dropdown);
                return;
            }
            this.attach(dropdown);
        });
    }
};
