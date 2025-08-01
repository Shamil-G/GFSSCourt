export const editTable = {
    attachAll(zone = document) {
        zone.querySelectorAll('.edit-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.startEdit(btn.dataset.id, btn.dataset.field)
            )
        );

        zone.querySelectorAll('.cancel-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.cancelEdit(btn.dataset.id, btn.dataset.field)
            )
        );

        zone.querySelectorAll('.save-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.save(btn.dataset.id, btn.dataset.field)
            )
        );
    },

    startEdit(id, field) {
        const row = document.querySelector(`tr[data-order="${id}"]`);
        const input = row?.querySelector(`input[name="${field}"]`);
        if (!input) return;

        input.removeAttribute('readonly');
        input.classList.add('editing');

        row.querySelector(`.edit-btn[data-field="${field}"]`)?.style.setProperty('display', 'none');
        row.querySelector(`.save-btn[data-field="${field}"]`)?.style.setProperty('display', 'inline-block');
        row.querySelector(`.cancel-btn[data-field="${field}"]`)?.style.setProperty('display', 'inline-block');
    },

    cancelEdit(id, field) {
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
        const row = document.querySelector(`tr[data-order="${id}"]`);
        const input = row?.querySelector(`input[name="${field}"]`);
        if (!input) return;

        const value = input.value;

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
    },

    initEvents() {
        console.log('editTable. initEvents')
        document.querySelectorAll('.edit-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.startEdit(btn.dataset.id, btn.dataset.field)
            )
        );

        document.querySelectorAll('.cancel-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.cancelEdit(btn.dataset.id, btn.dataset.field)
            )
        );

        document.querySelectorAll('.save-btn').forEach(btn =>
            btn.addEventListener('click', () =>
                this.save(btn.dataset.id, btn.dataset.field)
            )
        );
    }
};

