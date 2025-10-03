import { showHelperPopover } from '../../popoverEngine.js';

export const HelperBinder = {
    role: 'helper',

    attachAll(zone = document) {
        if (zone.__helperBinder) {
            //console.warn('⚠️ HelperBinder: double bind', zone);
            //console.trace(); // покажет стек вызова
            return;
        }
        zone.__helperBinder = true;

        zone.querySelectorAll('[data-role="helper"][data-help]').forEach(cell => {
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
