import type { ClassFixChange } from './types';
/**
 * Resolves conflicting utility classes within the same variant scope.
 * The rightmost class wins and previous conflicting classes are removed.
 */
export declare function resolveClassConflicts(classes: string[]): {
    result: string[];
    changes: ClassFixChange[];
};
