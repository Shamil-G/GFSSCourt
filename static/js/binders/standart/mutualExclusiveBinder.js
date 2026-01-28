import { showTooltipPopover } from '/static/js/_aux/popoverEngine.js';

export const MutualExclusiveBinder = {
    role: 'mutual-exclusive',

    attach(wrapper) {
        if (!wrapper || wrapper.__mutualExclusiveBinder) return;
        wrapper.__mutualExclusiveBinder = true;

        //console.log('**** MUTUAL-EXCLUSIVE. attach');
        const inputA = wrapper.querySelector('[data-role="inputA"]');
        const inputB = wrapper.querySelector('[data-role="inputB"]');

        const infoA = wrapper.getAttribute('data-info-a') || '';
        const infoB = wrapper.getAttribute('data-info-b') || '';

        //console.log('***** MUTUAL-EXCLUSIVE. attach. inputA: ', inputA, ', inputB: ', inputB);

        if (!inputA || !inputB) return;

        inputA.addEventListener('input', () => {
            const hasValue = !!inputA.value;
            inputB.disabled = hasValue;
            if (hasValue) inputB.value = '';
            if (hasValue && infoA) showTooltipPopover(inputA, infoA);
        });

        // Для date — только change
        inputB.addEventListener('change', () => {
            const hasValue = !!inputB.value;
            inputA.disabled = hasValue;
            if (hasValue) inputA.value = '';
            if (hasValue && infoB) showTooltipPopover(inputB, infoB);
        });

    },

    attachAll(zone = document) {
        const wrappers = zone.querySelectorAll('[data-mutual-exclusive]');
        //console.log(`*** MUTUAL-EXCLUSIVE. [MutualExclusiveBinder] attachAll: zone =`, zone, `\n\twrappers =`, wrappers);

        wrappers.forEach(wrapper => this.attach(wrapper));
    }
};

