import type { ClassFixChange } from './types';
export declare function levenshteinDistance(a: string, b: string): number;
/**
 * Finds closest matching valid utility for a suspected typo.
 */
export declare function suggestTypoFix(className: string, dictionary?: string[]): string | null;
/**
 * Detects and corrects typos in a class list.
 */
export declare function fixTypos(classes: string[], dictionary?: string[]): {
    result: string[];
    changes: ClassFixChange[];
};
