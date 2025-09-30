// Редактируем значения ячеек в каждой записи
export const EditRowTableBinder = {
    role: 'edit-row',

    attach(row) {
        if (row.__EditRowTableBinder) {
            //console.warn('⚠️ EditRowTableBinder: double bind start', row);
            //console.trace();
            return;
        }
        row.__EditRowTableBinder = true;

        row.querySelectorAll('.edit-btn').forEach(btn => {
            if (btn.__boundEdit) return;
            btn.__boundEdit = true;
            btn.addEventListener('click', () =>
                this.startEdit(btn.dataset.id, btn.dataset.field)
            );
        });

        row.querySelectorAll('.cancel-btn').forEach(btn => {
            if (btn.__boundCancel) return;
            btn.__boundCancel = true;
            btn.addEventListener('click', () =>
                this.cancelEdit(btn.dataset.id, btn.dataset.field)
            );
        });

        row.querySelectorAll('.save-btn').forEach(btn => {
            if (btn.__boundSave) return;
            btn.__boundSave = true;
            btn.addEventListener('click', () =>
                this.save(btn.dataset.id, btn.dataset.field)
            );
        });
    },

    attachAll(zone = document) {
        const rows = zone.querySelectorAll('tr');
        rows.forEach(row => this.attach(row));
    },

    startEdit(id, field) {
        const row = document.querySelector(`tr[data-order="${id}"]`);
        const input = row?.querySelector(`input[name="${field}"]`);
        console.log('EditField. startEdit. id:', id, 'field:', field, 'row:', row, 'input:', input);
        if (!input) return;

        input.removeAttribute('readonly');
        input.classList.add('editing');

        row.querySelector(`.edit-btn[data-field="${field}"]`)?.style.setProperty('display', 'none');
        row.querySelector(`.save-btn[data-field="${field}"]`)?.style.setProperty('display', 'inline-block');
        row.querySelector(`.cancel-btn[data-field="${field}"]`)?.style.setProperty('display', 'inline-block');
    },

    cancelEdit(id, field) {
        console.log('EditField. cancelEdit. id:', id, 'field:', field);
        const row = document.querySelector(`tr[data-order="${id}"]`);
        const input = row?.querySelector(`input[name="${field}"]`);
        if (!input) return;

        input.setAttribute('readonly', true);
        input.classList.remove('editing');

        row.querySelector(`.edit-btn[data-field="${field}"]`)?.style.setProperty('display', 'inline-block');
        row.querySelector(`.save-btn[data-field="${field}"]`)?.style.setProperty('display', 'none');
        row.querySelector(`.cancel-btn[data-field="${field}"]`)?.style.setProperty('display', 'none');
    },

    async save(id, field) {
        console.log('EditField. save. id:', id, 'field:', field);
        const row = document.querySelector(`tr[data-order="${id}"]`);
        const input = row?.querySelector(`input[name="${field}"]`);
        if (!input) return;

        const value = input.value;

        if (input.__lastValue === value) {
            console.log(`⚠️ EditField. save skipped — значение не изменилось: ${value}`);
            return;
        }

        input.__lastValue = value;

        try {
            const res = await fetch(`/update-field`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, field, value })
            });
            const result = await res.json();
            console.log(`✅ ${field} saved for ${id}:`, result);
            this.cancelEdit(id, field);
        } catch (err) {
            console.error(`❌ Failed to save ${field} for ${id}:`, err);
            alert('Ошибка при сохранении поля ' + field);
        }
    }
};
