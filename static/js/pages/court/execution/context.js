import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const executionTabContext = {
    zones: {
        content: '#executionContent',
        form: '#executionFormContainer',
        refreshBtn: '#executionRefreshButton',
        visibleBtn: '#executionVisibleButton'
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
            url: '/execution_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // искать только в загруженном фрагменте
        form: 'manual'
    },
    loadStrategy: {
        content: 'lazy',
        form: 'manual'
    }
};

export default executionTabContext;