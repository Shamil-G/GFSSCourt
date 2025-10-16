import * as binders from './binders/index.js';
import { BinderRegistry } from './core/BinderRegistry.js';

export function bootstrapBinders() {
    Object.values(binders).forEach(binder => {
        if (binder?.role && typeof binder === 'object') {
            const { role, massive } = binder;
            BinderRegistry.register(binder.role, binder, { massive });
        } else {
            console.warn('❗️ Binder without role or invalid binder:', binder);
        }
    });

    console.log('✅ Registered binders:', BinderRegistry.listRoles());
}


