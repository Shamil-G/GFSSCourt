///*import { TableLoader } from '/static/js/core/TableLoad.js';*/

export const MenuRegionBinder = {
    role: 'menu-region',
    _activeDropdown: null,

    attach(container) {
        if (container.__MenuRegionBinder) return;
        container.__MenuRegionBinder = true;

        container.addEventListener('click', (e) => {
            const button = e.target.closest('.dropdown-button');
            if (button) {
                e.stopPropagation();
                this.openDropdown(container, button);
                return;
            }

            const item = e.target.closest('.global-dropdown a');
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                this.selectItem(container, item);
            }
        });
    },

    openDropdown(container, button) {
        this.closeDropdown();

        const dropdown = container.querySelector('.dropdown-content');
        if (!dropdown) return;

        const rect = button.getBoundingClientRect();

        const clone = dropdown.cloneNode(true);
        clone.classList.add('global-dropdown');
        clone.style.position = 'absolute';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.bottom + 'px';
        clone.style.zIndex = 99999;
        clone.style.display = 'block';

        document.body.appendChild(clone);
        this._activeDropdown = clone;

        setTimeout(() => {
            document.addEventListener('click', this._outsideClick);
        }, 0);
    },

    _outsideClick: (e) => {
        if (!MenuRegionBinder._activeDropdown) return;
        if (!MenuRegionBinder._activeDropdown.contains(e.target)) {
            MenuRegionBinder.closeDropdown();
        }
    },

    closeDropdown() {
        if (this._activeDropdown) {
            this._activeDropdown.remove();
            this._activeDropdown = null;
            document.removeEventListener('click', this._outsideClick);
        }
    },

    selectItem(container, item) {
        const hiddenInput = container.querySelector('input[type="hidden"]');
        const regionName = container.querySelector('#region_name');

        const value = item.dataset.value || item.textContent.trim();
        const label = item.dataset.label || value;

        if (hiddenInput) hiddenInput.value = value;
        if (regionName) regionName.textContent = label;

        container.dispatchEvent(new CustomEvent('menu-changed', {
            bubbles: true,
            detail: { value, label }
        }));

        this.closeDropdown();
    },

    attachAll(zone = document) {
        const containers = zone.matches?.(`[data-role~="${this.role}"]`)
            ? [zone]
            : Array.from(zone.querySelectorAll(`[data-role~="${this.role}"]`));

        containers.forEach(container => this.attach(container));
    }
};


//export const MenuRegionBinder = {
//    role: 'menu-region',

//attach(container) {
//    if (container.__MenuRegionBinder) return;
//    container.__MenuRegionBinder = true;

//    container.addEventListener('click', (e) => {
//        // клик по кнопке
//        const button = e.target.closest('.dropdown-button');
//        console.log('MENU-REGION. CLICK CONTANER. e: ', e, '\n\tbutton: ', button);
//        if (button) {
//            e.stopPropagation();
//            const dropdownContent = button
//                .closest('[data-role~="menu-region"]')
//                ?.querySelector('.dropdown-content');
//            console.log('MENU-REGION. CLICK CONTANER. dropdownContent: ', dropdownContent);

//            if (dropdownContent) dropdownContent.classList.toggle('show');
//            return;
//        }

//        // клик по пункту меню
//        const item = e.target.closest('.dropdown-content a');
//        if (item) {
//            e.preventDefault();
//            e.stopPropagation();

//            const containerRegion = item.closest('[data-role~="menu-region"]');
//            const hiddenInput = containerRegion?.querySelector('input[type="hidden"]');
//            const regionName = containerRegion?.querySelector('#region_name');

//            const value = item.dataset.value || item.textContent.trim();
//            const label = item.dataset.label || value;

//            if (hiddenInput) hiddenInput.value = value;
//            if (regionName) regionName.textContent = label;

//            containerRegion.dispatchEvent(new CustomEvent('menu-changed', {
//                bubbles: true,
//                detail: { value, label }
//            }));

//            containerRegion.querySelectorAll('.dropdown-content a')
//                .forEach(i => i.classList.remove('selected'));
//            item.classList.add('selected');

//            const dropdownContent = containerRegion?.querySelector('.dropdown-content');
//            if (dropdownContent) dropdownContent.classList.remove('show');
//        }
//    });
//}

//,

//    attachAll(zone = document) {
//        const containers = zone.matches?.(`[data-role~="${this.role}"]`)
//            ? [zone]
//            : Array.from(zone.querySelectorAll(`[data-role~="${this.role}"]`));

//        console.log("Menu-Region. AttachAll. containers: ", containers);

//        containers.forEach(container => this.attach(container));
//    }
//};
