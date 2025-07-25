﻿const _tabs = {};

export const TabRegistry = {
  register(tabId, { url, zone, onInit }) {
    _tabs[tabId] = { url, zone, onInit };
  },

  get(tabId) {
    return _tabs[tabId];
  },

  load(tabId) {
    const entry = _tabs[tabId];
    if (!entry) {
      console.warn(`Нет регистрации вкладки "${tabId}"`);
      return;
    }

    const targetZone = entry.zone || document.querySelector('.fragment-zone');
    fetch(entry.url)
      .then(res => res.text())
      .then(html => {
        targetZone.innerHTML = html;
        sharedTabId = tabId;
        UIBinder.init(targetZone);
        entry.onInit?.(targetZone);  // если указан доп. инициализатор

        targetZone.dispatchEvent(new CustomEvent('tab-loaded', {
          detail: { tabId, url: entry.url }
        }));
      })
      .catch(err => {
        targetZone.innerHTML = `<div class="error">Ошибка загрузки: ${err.message}</div>`;
        console.error('🟥 Ошибка загрузки вкладки:', err);
      });
  }
};
