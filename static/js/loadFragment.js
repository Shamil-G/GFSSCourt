export function loadFragment(url, targetId, params = {}) {
    console.log('function loadFragment. Params:', params);

    const target = document.getElementById(targetId);
    if (!target) {
        console.warn(`Element #${targetId} not found`);
        return;
    }

    const isEmptyParams = Object.keys(params).length === 0;
    const isJson = Object.values(params).some(v => typeof v === 'object');

    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded'
    };

    const body = isEmptyParams ? null : (
        isJson ? JSON.stringify(params) : new URLSearchParams(params).toString()
    );
    console.log("loadFragment. body:", body)
    fetch(url, {
        method: 'POST',
        headers,
        body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Loading ERROR: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log("Получили: ", html)
            const temp = document.createElement('div');
            temp.innerHTML = html;

            //target.querySelectorAll('tr[data-order]').forEach(row => row.remove());
            target.querySelectorAll('tr:not([data-persistent])').forEach(row => row.remove());

            // Вставить новые строки
            temp.querySelectorAll('tr').forEach(row => target.appendChild(row));

            // 🔁 Инициализация по ролям
            RoleBinderRegistry.init(target);
        })
        .catch(error => {
            console.error('Error loading fragment:', error);
        });
}

//export const FragmentBinder = {
//    role: 'fragment',

//    clear(target) {
//        // Удалить всё, кроме элементов с data-persistent
//        target.querySelectorAll(':scope > *:not([data-persistent])').forEach(el => el.remove());
//    },

//    insert(target, html) {
//        const temp = document.createElement('div');
//        temp.innerHTML = html;

//        // Вставить все элементы
//        Array.from(temp.children).forEach(el => target.appendChild(el));
//    },

//    init(target) {
//        RoleBinderRegistry.init(target);
//    },

//    bindEvents(target) {
//        // Пример: слушать кастомное событие
//        target.addEventListener('fragment-reload', e => {
//            const url = target.dataset.url;
//            const params = e.detail?.params || {};
//            FragmentBinder.load(url, target.id, params);
//        });
//    },

//    load(url, targetId, params = {}) {
//        const target = document.getElementById(targetId);
//        if (!target) return;

//        const isJson = Object.values(params).some(v => typeof v === 'object');
//        const headers = {
//            'X-Requested-With': 'XMLHttpRequest',
//            'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded'
//        };
//        const body = isJson ? JSON.stringify(params) : new URLSearchParams(params).toString();

//        fetch(url, { method: 'POST', headers, body })
//            .then(res => res.text())
//            .then(html => {
//                FragmentBinder.clear(target);
//                FragmentBinder.insert(target, html);
//                FragmentBinder.init(target);
//                FragmentBinder.bindEvents(target);
//            })
//            .catch(err => console.error('FragmentBinder.load error:', err));
//    }
//};
