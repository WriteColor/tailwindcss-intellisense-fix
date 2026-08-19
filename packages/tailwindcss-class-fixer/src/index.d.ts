import type { ClassFixOptions, ClassFixResult, DocumentFixOptions, DocumentFixResult } from './types';
export * from './types';
export * from './dedupe';
export * from './conflicts';
export * from './migrations';
export * from './sorter';
export * from './typo-fixer';
export * from './universal-parser';
/**
 * Optimizes, cleans, migrates and sorts a single Tailwind CSS class string.
 */
export declare function fixClassString(input: string, userOptions?: ClassFixOptions): ClassFixResult;
/**
 * Parses and fixes all Tailwind classes in any code/template document across any language.
 */
export declare function fixDocument(content: string, options?: DocumentFixOptions): DocumentFixResult;
