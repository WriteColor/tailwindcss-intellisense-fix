"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedupeClasses = dedupeClasses;
/**
 * Deduplicates class names while preserving ordering and variant prefixes.
 */
function dedupeClasses(classes) {
    const seen = new Set();
    const result = [];
    const changes = [];
    for (const cls of classes) {
        const trimmed = cls.trim();
        if (!trimmed)
            continue;
        if (seen.has(trimmed)) {
            changes.push({
                type: 'dedupe',
                original: trimmed,
                replacement: null,
                reason: `Removed duplicate class '${trimmed}'`,
            });
        }
        else {
            seen.add(trimmed);
            result.push(trimmed);
        }
    }
    return { result, changes };
}
