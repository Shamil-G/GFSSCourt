export const tabTree = {
    'court._context': () => import('./context.js'),
    'crime': () => import('./crime/context.js'),
    'civ': () => import('./civ/context.js'),
    'appeal': () => import('./appeal/context.js'),
    'execution': () => import('./execution/context.js'),
    'refunding': () => import('./refunding/context.js'),
    'law': () => import('./law/context.js'),
    'scammer': () => import('./scammer/context.js'),
    'pretrial': () => import('./pretrial/context.js')
};
