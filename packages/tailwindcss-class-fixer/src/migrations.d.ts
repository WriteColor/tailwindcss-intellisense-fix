import type { ClassFixChange } from './types';
/**
 * Migrates deprecated or legacy Tailwind CSS class names to modern (v3/v4) equivalents.
 */
export declare function migrateClasses(classes: string[], targetVersion?: 'v3' | 'v4'): {
    result: string[];
    changes: ClassFixChange[];
};
