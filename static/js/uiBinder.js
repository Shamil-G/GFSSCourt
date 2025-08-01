import { MenuBinder } from './menuBinder.js';
import { HelperBinder } from './helperBinder.js';
import { TooltipBinder } from './tooltipBinder.js';
import { editTable } from './editTable.js';

const _binders = []

export const UIBinder = {
  register(binder) {
    console.log("uiBinder: "+binder)
    _binders.push(binder);
  },
  init(zone = document) {
    _binders.forEach(b => b.attachAll?.(zone));
  }
};

UIBinder.register(MenuBinder);
UIBinder.register(HelperBinder);
UIBinder.register(TooltipBinder);
UIBinder.register(editTable);
