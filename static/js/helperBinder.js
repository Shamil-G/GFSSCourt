import { showHelperPopover } from './popoverEngine.js';

/////////////////////////////////////////////////
export function addHelperIcon(td) {
  if (td.querySelector('.help-icon')) return;

  const icon = document.createElement('span');
  icon.className = 'help-icon';
  icon.textContent = 'ℹ️';

  icon.addEventListener('click', () => {
    const topic = td.dataset.help;
    fetch(`/help_fragment?topic=${topic}`)
      .then(res => res.text())
      .then(html => {
        const cleaned = html.trim();
        if (!cleaned) {
          showPopover(icon, '<em>Нет информации по этой подсказке</em>');
        } else {
          showPopover(icon, html);
        }
    });
  });

  td.appendChild(icon);
}
////////////////////////////////////////////////
export const HelperBinder = {
  attachAll(zone = document) {
    zone.querySelectorAll('th.has-helper[data-help], td.has-helper[data-help]').forEach(cell => {
      if (cell.querySelector('.help-icon')) return;

      const icon = document.createElement('span');
      icon.className = 'help-icon';
      icon.textContent = 'ℹ️';
      icon.title = 'Нажмите для справки';

      icon.addEventListener('click', () => {
        const topic = cell.dataset.help;
        fetch(`/help_fragment?topic=${topic}`)
          .then(res => res.text())
          .then(html => {
            const cleaned = html.trim();
            showHelperPopover(icon, cleaned || '<em>Нет информации по этой подсказке</em>');
          });
      });

      cell.appendChild(icon);
    });
  }
};
