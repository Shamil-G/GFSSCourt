import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { MutualExclusiveBinder } from '/static/js/binders/standart/mutualExclusiveBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const pretrialTabContext = {
    zones: {
        content: '#pretrialContent',
        form: '#pretrialFormContainer',
        refreshBtn: '#pretrialRefreshButton',
        visibleBtn: '#pretrialVisibleButton'
    },
    binders: {
        content: [HelperBinder],
        form: [MutualExclusiveBinder, HelperBinder],
        refreshBtn: [RefreshDirectContentTabBinder],
        visibleBtn: [ToggleVisibleFormBinder ]
    },
    request: {
        content: {
            method: 'POST',
            url: '/pretrial_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // искать только в загруженном фрагменте
        visibleBtn: 'local',
        form: 'manual'
    },
    loadStrategy: {
        content: 'lazy',
        visibleBtn: 'lazy',
        form: 'manual'
    }
};

export default pretrialTabContext;