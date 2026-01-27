import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const refundingTabContext = {
    zones: {
        content: '#refundingContent',
        refreshBtn: '#refundingRefreshButton'
    },
    binders: {
        content: [HelperBinder],
        refreshBtn: [RefreshDirectContentTabBinder]
    },
    request: {
        content: {
            method: 'POST',
            url: '/get_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // искать только в загруженном фрагменте
    },
    loadStrategy: {
        content: 'lazy'
    }
};

export default refundingTabContext;
