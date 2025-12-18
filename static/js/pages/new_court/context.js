import { MenuBinder } from '/static/js/pages/new_court/binders/menuBinder.js';
import { HelperBinder } from '/static/js/binders/standart/helperBinder.js';

export const courtTabContext = {
    // Значения zone определяют id=""
    zones: {
        mainTableHelper: '#court_mainHelper',
        menu: '#court_MenuZone'
    },

    binders: {
        mainTableHelper: [HelperBinder],
        menu: [MenuBinder],
    },

    request: {
        fragment: {
            method: 'POST',
            url: orderNum => `/filter-period-overpayments`
        },
        filters: {
            method: 'POST',
            url: '/court_filters',
            params: () => ({}) // 👈 пустой объект, если нет orderNum
        }
    },

    bindScope: {
        filters: 'global'    // искать в document, независимо от fragment
    },

    loadStrategy: {
        filters: 'eager'
    }
};

export default courtTabContext;