import { PageManager } from '/static/js/core/PageContext.js';

export const TabSwitchBinder = {
    role: 'tab-switch',
    massive: true,

    attach(button) {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            if (!tabName) return;

            //console.log('TabSwitchBinder. ������ ������:\t', tabName);
            PageManager.get()?.onTabSwitch(tabName);
        });
    }
,

    attachAll(tabsZone = document) {
        if (!tabsZone) {
            console.warn('TabSwitchBinder: tabsZone �� �������');
            return;
        }
        //console.log("tabsZone: ", tabsZone)
        const buttons = Array.from(tabsZone.querySelectorAll('button[data-tab]'));
        buttons.forEach(btn => this.attach(btn));
    }

};
