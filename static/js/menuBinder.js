export const MenuBinder = {
  attach(dropdown) {
    const button = dropdown.querySelector('.dropdown-button');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const items = dropdown.querySelectorAll('.dropdown-content a');

    if (!button || !hiddenInput || items.length === 0) return;

    items.forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value || item.textContent.trim();
        const label = item.dataset.label || value;

        hiddenInput.value = value;
        button.textContent = label;

        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        dropdown.dispatchEvent(new CustomEvent('menu-changed', {
          detail: { value, label }
        }));
      });
    });
  },

  attachAll(zone = document) {
    zone.querySelectorAll('.dropdown').forEach(dropdown => this.attach(dropdown));
  }
};
