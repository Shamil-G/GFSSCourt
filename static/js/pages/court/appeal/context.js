import { MenuBinder } from '/static/js/binders/standart/menuBinder.js';
import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const appealTabContext = {
    zones: {
        content: '#appealContent',
        form: '#appealFormContainer',
        refreshBtn: '#appealRefreshButton',
        visibleBtn: '#appealVisibleButton'
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
            url: '/pretrial_fragment',
            params: orderNum => ({ order_num: orderNum })
        }
    },
    bindScope: {
        content: 'local',     // ������ ������ � ����������� ���������
        form: 'manual'
    },
    loadStrategy: {
        content: 'lazy',
        form: 'manual'
    }
};

export default appealTabContext;