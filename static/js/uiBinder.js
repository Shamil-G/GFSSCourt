
export const UIBinder = {
    register(binder) {
        //console.log("UIBinder. register. role:", binder.role, "binder: ", binder)
        RoleBinderRegistry.register(binder.role, binder);
    },
    init(zone = document) {
        //console.log("UIBinder. init. zone:", zone)
        RoleBinderRegistry.init(zone);
    }
};

UIBinder.register(MenuBinder);
UIBinder.register(HelperBinder);
UIBinder.register(TooltipBinder);
UIBinder.register(editField);
UIBinder.register(FragmentBinder);
