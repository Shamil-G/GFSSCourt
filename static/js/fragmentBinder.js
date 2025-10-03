import { BinderRegistry } from './binderRegistry.js';
import * as TabUtil from './tabUtil.js';

// Задумка !!! =>
// Загрузка фрагментов, зон, табов (slave table)
// при смене numOrder в мастер таблице
// Для этого принимается
// URL - куда обращаемся за данными
// TARGET - куда положим выбранные данные
// PARAMS - данные, которые передаются по адресу URL

// По факту сейчас фрагменты скачиваютя через TabRegistry !!!
// Здесь только мастер - таблица

export const FragmentBinder = {
    role: 'fragment',

    clear(target) {
        target.querySelectorAll(':scope > *:not([data-persistent])').forEach(el => el.remove());
        //console.log("FragmentBinder. Очистка фрагмента выполнена", target);
    },

    insert(target, html) {
        const temp = document.createElement('table');
        temp.innerHTML = html;

        const rows = temp.querySelectorAll('tr');
        if (rows.length === 0) {
            console.log('❗️FragmentBinder. Attempt to insert empty fragment');
            return;
        }

        const persistent = target.querySelector('tr[data-persistent]');
        const anchor = persistent?.nextSibling || target.firstChild?.nextSibling;

        rows.forEach(row => {
            if (anchor) {
                target.insertBefore(row, anchor);
            } else {
                target.appendChild(row);
            }
        });
    },

    init(target) {
        BinderRegistry.init(target);
    },

    async load(url, targetId, params = {}) {
        const target = document.getElementById(targetId);

        if (!target) return null;

        const { headers, body } = TabUtil.serializeParams(params);
        console.log("1. FragmentBinder. load.  headers: ", headers);

        //const isJson = Object.values(params).some(v => typeof v === 'object');
        //const headers = {
        //    'X-Requested-With': 'XMLHttpRequest',
        //    'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded'
        //};
        //const body = isJson ? JSON.stringify(params) : new URLSearchParams(params).toString();

        try {
            const res = await fetch(url, { method: 'POST', headers, body });
            const html = await res.text();

            FragmentBinder.clear(target);
            FragmentBinder.insert(target, html);
            FragmentBinder.init(target);

            console.log("2. FragmentBinder. LOAD.  target: ", targetId, ", URL: ", url, ", params: ", params);

            return html; // ✅ теперь можно кэшировать
        } catch (err) {
            console.error('FragmentBinder.load error:', err);
            return null;
        }
    }
};
