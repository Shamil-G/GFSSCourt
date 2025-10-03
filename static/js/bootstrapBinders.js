import * as binders from './binders/index.js';
import { BinderRegistry } from './binderRegistry.js';

import { TabConfigList } from './core/tabConfigList.js'
import { TabRegistry } from './tabRegistry.js'

export function bootstrapBinders() {
    TabConfigList.forEach(({ id, url, zoneSelector, onInit }) => {
        TabRegistry.register(id, { url, zoneSelector, onInit });
    });
    console.log('List Tabs: ', TabRegistry.list());

    Object.values(binders).forEach(binder => {
        if (binder?.role) {
            //console.log("bootstrapBinders. Registering: ", binder.role, "Binder: ", binder)
            BinderRegistry.register(binder.role, binder);
        } else {
            console.warn('❗️ Binder without role:', binder);
        }
    });
}

