import * as binders from './binders/index.js';
import { BinderRegistry } from './binderRegistry.js';

export function bootstrapBinders() {
    Object.values(binders).forEach(binder => {
        if (binder?.role) {
            //console.log("bootstrapBinders. Registering: ", binder.role, "Binder: ", binder)
            BinderRegistry.register(binder.role, binder);
        } else {
            console.warn('❗️ Binder without role:', binder);
        }
    });
}

