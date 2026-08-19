"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixClassString = fixClassString;
exports.fixDocument = fixDocument;
const dedupe_1 = require("./dedupe");
const conflicts_1 = require("./conflicts");
const migrations_1 = require("./migrations");
const sorter_1 = require("./sorter");
const typo_fixer_1 = require("./typo-fixer");
const universal_parser_1 = require("./universal-parser");
__exportStar(require("./types"), exports);
__exportStar(require("./dedupe"), exports);
__exportStar(require("./conflicts"), exports);
__exportStar(require("./migrations"), exports);
__exportStar(require("./sorter"), exports);
__exportStar(require("./typo-fixer"), exports);
__exportStar(require("./universal-parser"), exports);
const DEFAULT_OPTIONS = {
    dedupe: true,
    resolveConflicts: true,
    migrateVersion: 'v4',
    sort: true,
    fixTypos: true,
};
/**
 * Optimizes, cleans, migrates and sorts a single Tailwind CSS class string.
 */
function fixClassString(input, userOptions) {
    const options = { ...DEFAULT_OPTIONS, ...userOptions };
    const changes = [];
    let classes = input.trim().split(/\s+/).filter(Boolean);
    if (classes.length === 0) {
        return {
            original: input,
            fixed: input,
            hasChanges: false,
            changes: [],
        };
    }
    // 1. Migrations (e.g. deprecated utilities to modern v3/v4)
    if (options.migrateVersion) {
        const migResult = (0, migrations_1.migrateClasses)(classes, options.migrateVersion);
        classes = migResult.result;
        changes.push(...migResult.changes);
    }
    // 2. Deduplication
    if (options.dedupe) {
        const dedupeResult = (0, dedupe_1.dedupeClasses)(classes);
        classes = dedupeResult.result;
        changes.push(...dedupeResult.changes);
    }
    // 3. Conflict Resolution
    if (options.resolveConflicts) {
        const conflictResult = (0, conflicts_1.resolveClassConflicts)(classes);
        classes = conflictResult.result;
        changes.push(...conflictResult.changes);
    }
    // 4. Typo corrections
    if (options.fixTypos) {
        const typoResult = (0, typo_fixer_1.fixTypos)(classes, options.customDictionary);
        classes = typoResult.result;
        changes.push(...typoResult.changes);
    }
    // 5. Canonical sorting
    if (options.sort) {
        const sortResult = (0, sorter_1.sortClasses)(classes);
        classes = sortResult.result;
        changes.push(...sortResult.changes);
    }
    const fixed = classes.join(' ');
    const hasChanges = fixed !== input.trim() || changes.length > 0;
    return {
        original: input,
        fixed,
        hasChanges,
        changes,
    };
}
/**
 * Parses and fixes all Tailwind classes in any code/template document across any language.
 */
function fixDocument(content, options) {
    const ranges = (0, universal_parser_1.extractClassRanges)(content, options?.fileName);
    const edits = [];
    let fixedText = content;
    let offsetShift = 0;
    for (const range of ranges) {
        const fixResult = fixClassString(range.raw, options);
        if (fixResult.hasChanges && fixResult.fixed !== range.raw) {
            edits.push({
                start: range.start,
                end: range.end,
                originalText: range.raw,
                newText: fixResult.fixed,
                changes: fixResult.changes,
            });
        }
    }
    // Apply edits from end to start to avoid offset misalignment
    const sortedEdits = [...edits].sort((a, b) => b.start - a.start);
    for (const edit of sortedEdits) {
        fixedText =
            fixedText.slice(0, edit.start) + edit.newText + fixedText.slice(edit.end);
    }
    return {
        originalText: content,
        fixedText,
        hasChanges: edits.length > 0,
        edits,
    };
}
