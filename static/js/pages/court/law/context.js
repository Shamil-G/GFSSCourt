import { MenuBinder } from '/static/js/binders/standart/menuBinder.js';
import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const lawTabContext = {
    zones: {
        content: '#lawContent',
        form: '#lawFormContainer',
        refreshBtn: '#lawRefreshButton',
        visibleBtn: '#lawVisibleButton'
    },
    binders: {
        content: [HelperBinder],
        form: [MenuBinder, HelperBinder],
        refreshBtn: [RefreshDirectContentTabBinder],
        visibleBtn: [ToggleVisibleFormBinder]
    },
    request: {
        content: {
            method: 'POST',
            url: '/law_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // искать только в загруженном фрагменте
        form: 'manual'
    },
    loadStrategy: {
        content: 'lazy',
        visibleBtn: 'lazy',
        form: 'lazy'
    }
};

export default lawTabContext;