import type { ClassFixChange } from './types';
/**
 * Canonical sorting of Tailwind CSS classes matching official prettier-plugin-tailwindcss order.
 */
export declare function sortClasses(classes: string[]): {
    result: string[];
    changes: ClassFixChange[];
};
