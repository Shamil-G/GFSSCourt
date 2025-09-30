export const MenuBinder = {
    role: 'menu',

    attach(dropdown, handler = null) {
        if (dropdown.__menuBound) {
            //console.warn('⚠️ MenuBinder: double bind', dropdown);
            //console.trace(); // покажет стек вызова
            return;
        }
        //console.log('MenuBinder: FIRST CALL', dropdown);
        //console.trace(); // покажет стек вызова
        dropdown.__menuBound = true;

        const button = dropdown.querySelector('.dropdown-button');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const items = dropdown.querySelectorAll('.dropdown-content a');

        if (!button || !hiddenInput || items.length === 0) return;

        const labelSpan = button.querySelector('.label');
        const actionName = dropdown.dataset.action;

        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value || item.textContent.trim();
                const label = item.dataset.label || value;

                // 🔹 Стандартное поведение
                hiddenInput.value = value;
                if (labelSpan) labelSpan.textContent = label;

                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                dropdown.dispatchEvent(new CustomEvent('menu-changed', {
                    bubbles: true,
                    detail: { value, label }
                }));

                // 🔹 Проверка на повторное значение
                if (dropdown.__lastValue === value) {
                    console.log(`⚠️ MenuBinder: duplicate value (${value}) — handler call skipped`);
                    return;
                }
                dropdown.__lastValue = value;

                // 🔹 Приоритет: handler → data-action
                if (typeof handler === 'function') {
                    handler(value, label, dropdown);
                } else if (actionName) {
                    const fn = window[actionName] || API?.[actionName];
                    if (typeof fn === 'function') {
                        fn(value, label, dropdown);
                    } else {
                        console.warn(`❌ MenuBinder: handler '${actionName}' not found`);
                    }
                }
            });
        });
    },

    attachAll(handler = null, zone = document) {
        const dropdowns = zone.querySelectorAll('[data-role="menu"]');
        dropdowns.forEach(dropdown => this.attach(dropdown, handler));
    }
};
