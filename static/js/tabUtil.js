import { TabRegistry } from './tabRegistry.js';

export const tabCache = {};
const tabCacheOrder = [];

// Предлагаем обновить данные, если прошло 20 минут
// 20 минут = 20 * кол-во секунд * кол-во миллисекунд
const REFRESH_RECOMMENDED_THRESHOLD = 20 * 60 * 1000; 
// Удаляем из кэша принудительно, если прошло 2 часа
const CACHE_LIFETIME = 2 * 60 * 60 * 1000; // 2 часа в мс
// В кэше храним 512 документов
const MAX_CACHE_SIZE = 512;
//////////////////////////////////////////////////////////////////////////////
export function getOrderNum() {
    return document.getElementById('sharedOrderNum')?.value || '';
}
export function setSharedOrderNum(orderNum) {
    const shared = document.getElementById('sharedOrderNum');
    if (shared) {
        console.log("setSharedOrderNum: ", orderNum);
        shared.value = orderNum;
    } else {
        console.warn('⚠️ setOrderNum: элемент sharedOrderNum не найден');
    }
}
export function getCurrentTabId() {
    return document.getElementById('sharedTabId')?.value || 'pretrial';
}
export function getTimestampZone(targetZone, tabName) {
    //const selector = `#${tabName}Timestamp`;
    //const result = targetZone.querySelector(selector);
    //console.log("Selector: ", selector, "\n\t\tresult: ", result, "\n\t\ttargetZone: ", targetZone);
    //return result;
    return targetZone.querySelector(`#${tabName}Timestamp`);
}
export function getCacheKey(id, orderNum) {
    return `${id}_${orderNum}`;
}
export function getTargetZone(id) {
    /*  const config = TabConfig[id];*/
    const config = TabRegistry.get(id);

    if (!config) {
        console.warn(`⛔ Не найдена конфигурация вкладки "${id}"`);
        return;
    }

    const url = typeof config.url === 'function' ? config.url(orderNum) : config.url;
    return document.querySelector(config.zoneSelector);
}
//////////////////////////////////////////////////////////////////////////////
export function formatAge(timestamp) {
    const now = Date.now();
    const delta = now - timestamp;

    const mins = Math.floor(delta / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ч назад`;
}
/////////////////////////////////////////////////////////////////////////////
export function addToCache(key, html) {
    const now = Date.now();

    // Удалим старые
    for (const [k, v] of Object.entries(tabCache)) {
        if (now - v.timestamp > CACHE_LIFETIME) {
            delete tabCache[k];
            const index = tabCacheOrder.indexOf(k);
            if (index !== -1) tabCacheOrder.splice(index, 1);
        }
    }

    // Ограничение по размеру
    if (tabCacheOrder.length >= MAX_CACHE_SIZE) {
        const oldestKey = tabCacheOrder.shift();
        delete tabCache[oldestKey];
    }

    // Добавим свежий
    tabCache[key] = { html, timestamp: now };
    tabCacheOrder.push(key);
}
//////////////////////////////////////////////////////////////////////////////
export function updateRefreshButton(id) {

    const orderNum = getOrderNum();
    if (!orderNum) return;

    const cacheKey = `${id}_${orderNum}`;
    const cached = tabCache[cacheKey];
    if (!cached) return;

    const age = Date.now() - cached.timestamp;

    const refreshTarget = document.getElementById(`${id}RefreshButton`);

    if (!refreshTarget) return;

    if (age > REFRESH_RECOMMENDED_THRESHOLD) {
        refreshTarget.textContent = '🔁 Рекомендуем обновить';
        refreshTarget.classList.add('recommend');
        refreshTarget.title = `Загружено ${formatAge(cached.timestamp)} назад`;
    } else {
        refreshTarget.textContent = '🔄 Обновить';
        refreshTarget.classList.remove('recommend');
        refreshTarget.title = `Обновлено ${formatAge(cached.timestamp)} назад`;
    }
}
export function showLoadedAge(targetZone, tabName) {
    //let timestampZone = document.getElementById(`${tabName}Timestamp`)
    let timestampZone = getTimestampZone(targetZone, tabName);
    if (timestampZone) {
        const key_cache = getCacheKey(tabName, getOrderNum())
        if (key_cache) {
            const cach = tabCache[key_cache];
            timestampZone.textContent = `🕓 Загружено ${formatAge(cach.timestamp)}`;
        }
    }
}
///////////////////////////////////////////////////////////////////////////
export function loadFromCache(tabName, orderNum) {
    // Попробовать вытащить из кэша
    const cacheKey = getCacheKey(tabName, orderNum);
    const cached = tabCache[cacheKey];

    if (cached?.html) {
        const cached = tabCache[cacheKey];

        const targetZone = getTargetZone(tabName);
        targetZone.innerHTML = cached.html;

        updateRefreshButton(tabName);
        showLoadedAge(targetZone, tabName);
        //let timestampZone = document.getElementById(`${tabName}Timestamp`)
        //let timestampZone = getTimestampZone(targetZone, tabName);
        //if (timestampZone) {
        //    timestampZone.textContent = `🕓 Загружено ${formatAge(cached.timestamp)}`;
        //}
        return true;
        console.log("LOADED from CACHE");
    }
    return false;
}
//////////////////////////////////////////////////////////////////////////////
// На случай продолжительной загрузки данных надо выводить снизу сообщение
export function showTabLoader(tableFragment, start) {
    if (!tableFragment) return;

    let tfoot = tableFragment.querySelector('tfoot');
    // Еслиданных еще нет, то фрагмент пустой, без tfoot
    if (tfoot) {
        const centerSpan = tfoot.querySelector(`#footer-center`);
        if (centerSpan) {
            centerSpan.textContent = start === 1 ? 'Загрузка...' : '';
        }
    }
}
////////////////////////////////////////////////////////////
export function showLoadingMessage(tabName) {
    const contentZone = getTargetZone(tabName);
    if (!contentZone) return;

    const footerCenter = contentZone.querySelector('#footer-center');

    if (footerCenter) {
        // Таблица уже загружена — выводим сообщение в центр футера
        footerCenter.textContent = '⏳ Идёт загрузка...';
    } else {
        // Таблицы ещё нет — выводим сообщение на всю зону
        contentZone.innerHTML = `<div class="tab-loading-full" style="text-align: center; padding: 1em; font-style: italic; color: #666;">
            ⏳ Идёт загрузка...</div>`;
    }
}
//////////////////////////////////////////////////
export function serializeParams(params) {
    const isJson = Object.values(params).some(v =>
        typeof v === 'object' && v !== null
    );
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded'
    };
    const body = isJson
        ? JSON.stringify(params)
        : new URLSearchParams(params).toString();

    return { headers, body };
}