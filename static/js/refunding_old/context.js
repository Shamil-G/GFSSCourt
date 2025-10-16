export const refundingContext = {
    name: 'refunding',
    tabs: ['refunding', 'history', 'summary'],
    binders: ['FragmentBinder', 'MenuBinder'],
    zoneSelector: '#refundingContent',

    bootstrap() {
        TabRegistry.registerAll(this.tabs);
        BinderManager.attachAll(this.binders, this.zoneSelector);
    },

    destroy() {
        BinderManager.detachAll(this.binders);
        TabRegistry.unregisterAll(this.tabs);
    }
};
