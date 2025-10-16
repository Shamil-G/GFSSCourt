import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';


export const scammerTabContext = {
    zones: {
        content: '#scammerContent',
        form: '#scammerFormContainer',
        refreshBtn: '#scammerRefreshButton',
        visibleBtn: '#scammerVisibleButton'
    },
    binders: {
        content: [HelperBinder],
        form: [HelperBinder],
        refreshBtn: [RefreshDirectContentTabBinder],
        visibleBtn: [ToggleVisibleFormBinder]
    },
    request: {
        content: {
            method: 'POST',
            url: '/scammer_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // искать только в загруженном фрагменте
        refreshBtn: 'local',
        form: 'manual'
    },
    loadStrategy: {
        content: 'lazy',
        form: 'manual',
        refreshBtn: 'lazy'
    }
};

export default scammerTabContext;