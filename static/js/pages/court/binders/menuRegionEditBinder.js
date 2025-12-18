export const MenuRegionEditBinder = {
    role: 'menu-region-edit',

    attachAll(zone = document) {
        // Вешаем один делегированный обработчик на всю зону
        zone.addEventListener('click', (e) => {
            const container = e.target.closest('div[data-role~="menu-region-edit"]');
            if (!container) return; // клик вне нужного блока

            const target = e.target;
            // --- EDIT ---
            if (target.closest('.region-edit')) {
                e.stopPropagation();

                // клонируем шаблон
                const tpl = document.querySelector('#region-template');
                if (tpl) {
                    const slot = container.querySelector('.dropdown-content');
                    if (slot && slot.children.length === 0) {
                        slot.append(...tpl.cloneNode(true).children);
                    }
                }
                else console.warn('#region-template NOT FOUND');

                container.querySelector('.region-edit').style.display = 'none';
                container.querySelector('.region-save').style.display = 'inline-flex';
                container.querySelector('.region-cancel').style.display = 'inline-flex';
                container.querySelector('.dropdown-button').style.display = 'inline-flex';
                return;
            }

            // --- SAVE ---
            if (target.closest('.region-save')) {
                e.stopPropagation();

                const btn = target; // сама кнопка save
                const id = btn.dataset.id;
                const field = btn.dataset.field;
                const url = btn.dataset.url;

                const hiddenInput = container.querySelector('input[type="hidden"]');
                const value = hiddenInput?.value;

                //console.log('region-save. Target: ', target, ', url: ', url, ', id: ', id, ', field: ', field);

                //console.log("Сохраняем регион:", value, hiddenInput, " для id: ", target.dataset.id);

                // очищаем слот
                const slot = container.querySelector('.dropdown-content');
                if (slot) {
                    slot.innerHTML = ''; // убираем все <a>
                    slot.classList.remove('show'); // на всякий случай скрываем
                }

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
                    .catch(err => {
                        console.error("Ошибка сохранения:", err);
                    });

                this.resetUI(container);
                return;
            }

            // --- CANCEL ---
            if (target.closest('.region-cancel')) {
                e.stopPropagation();
                // очищаем слот
                const slot = container.querySelector('.dropdown-content');
                if (slot) {
                    slot.innerHTML = ''; // убираем все <a>
                    slot.classList.remove('show'); // на всякий случай скрываем
                }

                const hiddenInput = container.querySelector('input[type="hidden"]');
                if (hiddenInput) hiddenInput.value = '';

                console.log("Отмена редактирования региона для id:", target.dataset.id);

                this.resetUI(container);
                return;
            }

            // --- DROPDOWN BUTTON ---
            if (target.closest('.dropdown-button')) {
                e.stopPropagation();
                container.querySelector('.dropdown-content')?.classList.toggle('show');
                return;
            }

            // --- ITEM SELECT ---
            const item = target.closest('.dropdown-content a');
            if (item) {
                e.preventDefault();
                e.stopPropagation();

                const hiddenInput = container.querySelector('input[type="hidden"]');
                const regionName = container.querySelector('#region_name');
                const value = item.dataset.value || item.textContent.trim();
                const label = item.dataset.label || value;

                if (hiddenInput) hiddenInput.value = value;
                if (regionName) regionName.textContent = label;

                container.querySelectorAll('.dropdown-content a')
                    .forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                container.querySelector('.dropdown-content')?.classList.remove('show');
            }
        });
    },

    resetUI(container) {
        container.querySelector('.region-edit').style.display = 'inline-flex';
        container.querySelector('.region-save').style.display = 'none';
        container.querySelector('.region-cancel').style.display = 'none';
        container.querySelector('.dropdown-button').style.display = 'none';
        container.querySelector('.dropdown-content')?.classList.remove('show');
    }
};
