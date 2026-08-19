export interface ClassFixOptions {
    dedupe?: boolean;
    resolveConflicts?: boolean;
    migrateVersion?: 'v3' | 'v4' | false;
    sort?: boolean;
    fixTypos?: boolean;
    customDictionary?: string[];
    tailwindVersion?: 'v2' | 'v3' | 'v4';
}
export type ChangeType = 'dedupe' | 'conflict' | 'migration' | 'typo' | 'sort';
export interface ClassFixChange {
    type: ChangeType;
    original: string;
    replacement: string | null;
    reason: string;
}
export interface ClassFixResult {
    original: string;
    fixed: string;
    hasChanges: boolean;
    changes: ClassFixChange[];
}
export interface ExtractedClassRange {
    start: number;
    end: number;
    raw: string;
    delimiter?: string;
    context: 'html' | 'jsx' | 'css' | 'helper' | 'template';
}
export interface DocumentFixOptions extends ClassFixOptions {
    languageId?: string;
    fileName?: string;
}
export interface TextEditChange {
    start: number;
    end: number;
    newText: string;
    originalText: string;
    changes: ClassFixChange[];
}
export interface DocumentFixResult {
    originalText: string;
    fixedText: string;
    hasChanges: boolean;
    edits: TextEditChange[];
}
