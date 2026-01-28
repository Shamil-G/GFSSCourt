//import { BinderRegistry } from './TabContext.js';
// Загрузка фрагмента/Таба - при иерархической структуре проекта

//  Метод	        Назначение	                                Источник URL	        Привязка биндеров
//  loadCustomZone	Ручная загрузка конкретной зоны по URL	    передаётся напрямую	    attachZoneBinders(tabName, zoneKey)
//  loadZone	    Загрузка зоны по конфигу request	        из getRequest(...)	    attachBinders(tabName)(можно фильтровать)
//  load	        Загрузка основной зоны fragment	            из getRequest(...)	    attachBinders(tabName)
import { getCacheKey, loadFromCache, addToCache, fadeInsert, getZoneData } from '/static/js/_aux/tabUtil.js';

export class TabLoader {
    constructor(tabContext) {
        this.tabContext = tabContext;
    }

    async loadZone(tabName, zoneKey, orderNum, use_cache = true) {
        const zone = this.tabContext.getZone(tabName, zoneKey);
        if (!zone) {
            console.warn(`TabLoader: zone "${zoneKey}" for "${tabName}" not found`);
            return;
        }
        if (use_cache && loadFromCache(tabName, orderNum, zoneKey)) return;

        const req = this.tabContext.getRequest(tabName, zoneKey, orderNum);

        //console.log("TabLoader: load_zone, REQ: ", req, '\n\ttabName: ', tabName, '\n\tzoneKey: ', zoneKey, '\n\torderKey: ', orderNum);
        
        if (!req || !req.url) {
            console.warn(`TabLoader load_zone: invalid request config for "${tabName}" zone "${zoneKey}"`);
            return;
        }
        
        const params = { fragment: tabName, order_num: orderNum }
        const html = await getZoneData(tabName, zoneKey, params);

        await fadeInsert(zone, html);

        const cacheKey = getCacheKey(tabName, orderNum, zoneKey);
        addToCache(cacheKey, html);
        //this.tabContext.attachBinders(tabName); // можно фильтровать по zoneKey, если нужно
    }
}
