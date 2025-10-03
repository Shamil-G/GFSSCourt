// Вешается на таблицу ?!
export const RowClickBinder = {
    role: 'row-click',

    attach(el) {
        if (el.__RowClickBinder) {
            //console.warn('⚠️ RowClickBinder: double bind', el);
            //console.trace(); // покажет стек вызова
            return;
        }
        el.__RowClickBinder = true;

        if (!el || el.__rowClickBound) return;
        el.__rowClickBound = true;

        const actionName = el.dataset.action;

        el.addEventListener('click', event => {
            const tag = event.target.tagName;
            const ignoreTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'LABEL']

            if (ignoreTags.includes(tag)) {
                return;
            }

            const row = event.target.closest('.clickable-row');
            if (!row || !el.contains(row)) return;

            const orderNum = row.dataset.order;
            if (!orderNum || !actionName) return;

            const handler = window[actionName] || API?.[actionName];
            if (typeof handler === 'function') {
                handler(orderNum, row);
                //console.log('ROW_CLICK →', actionName, orderNum);
            } else {
                console.warn(`❌ RowClickBinder: handler '${actionName}' not found`);
            }
        });
    },

    attachAll(zone = document) {
        const containers = zone.querySelectorAll(`[data-role="${this.role}"]`);
        containers.forEach(el => this.attach(el));
    }
};
