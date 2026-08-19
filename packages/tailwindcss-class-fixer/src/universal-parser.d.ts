import type { ExtractedClassRange } from './types';
/**
 * Extracts class strings and exact byte ranges from any source code or template file.
 */
export declare function extractClassRanges(content: string, fileName?: string): ExtractedClassRange[];
