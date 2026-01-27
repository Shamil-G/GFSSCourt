export const MenuRegionEditBinder = {
    role: 'menu-region-edit',

    attachAll(zone = document) {
        // Один делегированный обработчик на всю зону
        zone.addEventListener('click', (e) => {
            const container = e.target.closest(`[data-role="${this.role}"]`);
            const target = e.target;

            // Клик вне — закрываем все меню
            if (!container) {
                zone.querySelectorAll(`[data-role="${this.role}"].open`)
                    .forEach(dd => dd.classList.remove('open'));
                return;
            }

            // --- EDIT ---
            if (target.closest('.region-edit')) {
                e.stopPropagation();
                this.openEditor(container);
                return;
            }

            // --- SAVE ---
            if (target.closest('.region-save')) {
                e.stopPropagation();
                this.save(container, target.closest('.region-save'));
                return;
            }

            // --- CANCEL ---
            if (target.closest('.region-cancel')) {
                e.stopPropagation();
                this.cancel(container);
                return;
            }

            // --- DROPDOWN BUTTON ---
            if (target.closest('.dropdown-button')) {
                e.stopPropagation();
                container.classList.toggle('open');
                return;
            }

            // --- ITEM SELECT ---
            const item = target.closest('.dropdown-content a');
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                this.selectItem(container, item);
                return;
            }
        });
    },

    // -----------------------------
    //  ЛОГИКА
    // -----------------------------

    openEditor(container) {
        const tpl = document.querySelector('#region-template');
        const slot = container.querySelector('.dropdown-content');

        if (tpl && slot && slot.children.length === 0) {
            slot.innerHTML = tpl.innerHTML; // надёжнее, чем cloneNode
        }

        container.querySelector('.region-edit').style.display = 'none';
        container.querySelector('.region-save').style.display = 'inline-flex';
        container.querySelector('.region-cancel').style.display = 'inline-flex';
        container.querySelector('.dropdown-button').style.display = 'inline-flex';
    },

    save(container, btn) {
        const id = btn.dataset.id;
        const field = btn.dataset.field;
        const url = btn.dataset.url;

        const hiddenInput = container.querySelector('input[type="hidden"]');
        const value = hiddenInput?.value;

        const slot = container.querySelector('.dropdown-content');
        if (slot) slot.innerHTML = '';

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, field, value })
        })
            .then(resp => resp.json())
            .then(data => {
                console.log("Ответ сервера:", data);
                this.resetUI(container);
            })
            .catch(err => console.error("Ошибка сохранения:", err));

        this.resetUI(container);
    },

    cancel(container) {
        const slot = container.querySelector('.dropdown-content');
        if (slot) slot.innerHTML = '';

        const hiddenInput = container.querySelector('input[type="hidden"]');
        if (hiddenInput) hiddenInput.value = '';

        this.resetUI(container);
    },

    selectItem(container, item) {
        const hiddenInput = container.querySelector('input[type="hidden"]');
        const regionName = container.querySelector('#region_name');

        const value = item.dataset.value || item.textContent.trim();
        const label = item.dataset.label || value;

        if (hiddenInput) hiddenInput.value = value;
        if (regionName) regionName.textContent = label;

        container.querySelectorAll('.dropdown-content a')
            .forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        container.classList.remove('open');
    },

    resetUI(container) {
        container.classList.remove('open');

        container.querySelector('.region-edit').style.display = 'inline-flex';
        container.querySelector('.region-save').style.display = 'none';
        container.querySelector('.region-cancel').style.display = 'none';
        container.querySelector('.dropdown-button').style.display = 'none';
    }
};
