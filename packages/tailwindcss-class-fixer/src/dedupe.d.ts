import type { ClassFixChange } from './types';
/**
 * Deduplicates class names while preserving ordering and variant prefixes.
 */
export declare function dedupeClasses(classes: string[]): {
    result: string[];
    changes: ClassFixChange[];
};
