export const BinderRegistry = {
    binders: {},
    register(role, binder) {
        if (!role || typeof role !== 'string') {
            console.warn('❗️ Miss role on registering:', role);
            return;
        }
        if (!binder || typeof binder !== 'object') {
            console.warn('❗️ Miss BINDER for role:', role);
            return;
        }
        this.binders[role] = binder
        console.log(`✅ Binder registered for role: ${role}`);
    },
    // documetn - this is default value
    init(target = document) {
        //if (target.__binderRegistry) {
            //console.warn('⚠️ BinderRegistry: double bind target', target);
            //console.trace(); // покажет стек вызова
            //return;
        //}
        //console.log('BinderRegistry: target', target);
        //console.trace(); // покажет стек вызова
        //target.__binderRegistry = true;

        if (!(target instanceof Element || target instanceof Document)) {
            console.warn('❌ BinderRegistry.init: target is not a DOM Element', target);
            return;
        }

        const root = target instanceof Document ? target.body : target;

        Object.entries(this.binders).forEach(([role, binder]) => {
            if (role === 'fragment') return; // ❌ исключаем фрагмент-биндер
            if (typeof binder.attachAll === 'function') {
                binder.attachAll(root);
            }
        });
    },

    get(role) {
        return binders[role];
    },

    listRoles() {
        return Object.keys(binders);
    }
};

