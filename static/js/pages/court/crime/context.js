import { MenuBinder } from '/static/js/binders/standart/menuBinder.js';
import { RefreshDirectContentTabBinder } from '/static/js/binders/standart/refreshDirectContentTabBinder.js';
import { ToggleVisibleFormBinder } from '/static/js/binders/standart/toggleVisibleFormBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const courtCrimeTabContext = {
    zones: {
        content: '#crimeContent',
        form: '#crimeFormContainer',
        refreshBtn: '#crimeRefreshButton',
        visibleBtn: '#crimeVisibleButton'
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
            url: '/court_crime_fragment',
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

export default courtCrimeTabContext;