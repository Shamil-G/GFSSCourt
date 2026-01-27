import { TableLoader } from '/static/js/core/TableLoad.js';

export const MenuBinder = {
    role: 'menu',
    massive: true,

    attachAll(zone = document) {
        if (zone.__menuAppealBound) return;
        zone.__menuAppealBound = true;

        console.log('MenuBinder: делегирование на зоне:', zone);

        zone.addEventListener('click', (e) => {
            // 1) Клик по кнопке — открыть/закрыть меню
            const btn = e.target.closest('.dropdown-button');
            if (btn) {
                const dropdown = btn.closest('[data-role="menu"]');
                if (!dropdown) return;

                dropdown.classList.toggle('open');
                return;
            }

            // 2) Клик по пункту меню
            const item = e.target.closest('.dropdown-content a');
            if (item) {
                const dropdown = item.closest('[data-role="menu"]');
                if (!dropdown) return;

                this.handleSelect(dropdown, item);
                //console.log("REMOVE OPEN", dropdown);
                dropdown.classList.remove('open');   // ← закрываем меню
                return;
            }
        });

        // 3) Клик вне — закрыть все меню
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-role="menu"]')) return;

            zone.querySelectorAll('[data-role="menu"].open')
                .forEach(dd => dd.classList.remove('open'));
        });
    },

    handleSelect(dropdown, item) {
        const button = dropdown.querySelector('.dropdown-button');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const labelSpan = button?.querySelector('.label');

        const url = dropdown.dataset.url;
        const targetId = dropdown.dataset.target;
        const actionName = dropdown.dataset.action;

        const value = item.dataset.value || item.textContent.trim();
        const label = item.dataset.label || value;

        if (hiddenInput) hiddenInput.value = value;
        if (labelSpan) labelSpan.textContent = label;

        dropdown.querySelectorAll('.dropdown-content a')
            .forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        // 🔹 Закрываем меню
        dropdown.classList.remove('open');

        dropdown.dispatchEvent(new CustomEvent('menu-changed', {
            bubbles: true,
            detail: { value, label }
        }));

        if (dropdown.__lastValue === value) return;
        dropdown.__lastValue = value;
    }
};
