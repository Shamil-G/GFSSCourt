import { showTooltipPopover } from '../../popoverEngine.js';

export const MutualExclusiveBinder = {
    role: 'mutual-exclusive',

    attachAll(zone = document) {
        if (zone.__mutualExclusiveBinder) {
            //console.warn('⚠️ MutualExclusiveBinder: double bind', zone);
            //console.trace();
            return;
        }
        zone.__mutualExclusiveBinder = true;

        const pairs = zone.querySelectorAll('[data-mutual-exclusive]');

        pairs.forEach(wrapper => {
            const inputA = wrapper.querySelector('[data-role="inputA"]');
            const inputB = wrapper.querySelector('[data-role="inputB"]');

            const infoA = wrapper.getAttribute('data-info-a') || '';
            const infoB = wrapper.getAttribute('data-info-b') || '';

            if (!inputA || !inputB) return;

            inputA.addEventListener('input', () => {
                inputB.disabled = !!inputA.value;
                if (inputA.value) inputB.value = '';
                if (infoA) showTooltipPopover(inputA, infoA);
            });

            inputB.addEventListener('input', () => {
                inputA.disabled = !!inputB.value;
                if (inputB.value) inputA.value = '';
                if (infoB) showTooltipPopover(inputB, infoB);
            });
        });
    }
};
