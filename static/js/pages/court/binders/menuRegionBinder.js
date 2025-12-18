import { TableLoader } from '/static/js/core/TableLoad.js';

export const MenuRegionBinder = {
    role: 'menu-region',

attach(container) {
    if (container.__MenuRegionBinder) return;
    container.__MenuRegionBinder = true;

    container.addEventListener('click', (e) => {
        // клик по кнопке
        const button = e.target.closest('.dropdown-button');
        console.log('MENU-REGION. CLICK CONTANER. e: ', e, '\n\tbutton: ', button);
        if (button) {
            e.stopPropagation();
            const dropdownContent = button
                .closest('[data-role~="menu-region"]')
                ?.querySelector('.dropdown-content');
            console.log('MENU-REGION. CLICK CONTANER. dropdownContent: ', dropdownContent);

            if (dropdownContent) dropdownContent.classList.toggle('show');
            return;
        }

        // клик по пункту меню
        const item = e.target.closest('.dropdown-content a');
        if (item) {
            e.preventDefault();
            e.stopPropagation();

            const containerRegion = item.closest('[data-role~="menu-region"]');
            const hiddenInput = containerRegion?.querySelector('input[type="hidden"]');
            const regionName = containerRegion?.querySelector('#region_name');

            const value = item.dataset.value || item.textContent.trim();
            const label = item.dataset.label || value;

            if (hiddenInput) hiddenInput.value = value;
            if (regionName) regionName.textContent = label;

            containerRegion.dispatchEvent(new CustomEvent('menu-changed', {
                bubbles: true,
                detail: { value, label }
            }));

            containerRegion.querySelectorAll('.dropdown-content a')
                .forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const dropdownContent = containerRegion?.querySelector('.dropdown-content');
            if (dropdownContent) dropdownContent.classList.remove('show');
        }
    });
}

,

    attachAll(zone = document) {
        const containers = zone.matches?.(`[data-role~="${this.role}"]`)
            ? [zone]
            : Array.from(zone.querySelectorAll(`[data-role~="${this.role}"]`));

        console.log("Menu-Region. AttachAll. containers: ", containers);

        containers.forEach(container => this.attach(container));
    }
};
