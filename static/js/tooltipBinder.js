import { showTooltipPopover } from './popoverEngine.js';

export const TooltipBinder = {
  attach(el) {
    if (!el?.dataset?.tooltip || el.dataset.tooltipBound === 'true') return;
    el.dataset.tooltipBound = 'true';

    el.addEventListener('mouseenter', () => {
      showTooltipPopover(el, el.dataset.tooltip);
    });
  },

  attachAll(zone = document) {
    zone.querySelectorAll('[data-tooltip]').forEach(el => this.attach(el));
  }
};