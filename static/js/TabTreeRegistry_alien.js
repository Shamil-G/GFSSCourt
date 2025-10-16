// Функция перенесена в PageContext.js
export const TabTreeRegistry = {
    async resolve(pageName) {
        try {
            const module = await import(`./pages/${pageName}/tabTree.js`);
            console.log('TabTreeRegistry:', module);
            return module.tabTree;
        } catch (err) {
            console.error(`❌ TabTreeRegistry: failed to load tabTree for "${pageName}"`, err);
            return {};
        }
    }
};
