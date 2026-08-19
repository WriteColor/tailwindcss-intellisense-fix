"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractClassRanges = extractClassRanges;
// Regex for standard HTML / JSX / Template class attributes
const ATTR_REGEX = /(?:class|className|ngClass|class:list|\[class\]|\[ngClass\])\s*=\s*(["'`{])([\s\S]*?)\1/gi;
// Regex for helper function calls: clsx, cva, twMerge, cn, classNames, tw`...`
const HELPER_REGEX = /\b(?:clsx|cva|twMerge|cn|classnames|tw)\s*(?:\(\s*|\`)([\s\S]*?)(?:\)|\`)/gi;
// Regex for string literals inside code or helpers
const STRING_LITERAL_REGEX = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
// Regex for @apply directives in CSS/SCSS/Sass/PostCSS
const APPLY_REGEX = /@apply\s+([^;}]+?)(?:\s*!important)?\s*[;}]/gi;
// Regex for Rust leptos/yew classes!("...") / class! { "..." }
const RUST_CLASSES_REGEX = /(?:classes!|class!)\s*[\(\{]\s*["']([^"']+)["']\s*[\)\}]/gi;
/**
 * Extracts class strings and exact byte ranges from any source code or template file.
 */
function extractClassRanges(content, fileName) {
    const results = [];
    const seenRanges = new Set();
    function addRange(range) {
        const key = `${range.start}-${range.end}`;
        if (!seenRanges.has(key) && range.raw.trim().length > 0) {
            seenRanges.add(key);
            results.push(range);
        }
    }
    // 1. Check CSS @apply directives
    let applyMatch;
    while ((applyMatch = APPLY_REGEX.exec(content)) !== null) {
        const raw = applyMatch[1];
        const start = applyMatch.index + applyMatch[0].indexOf(raw);
        const end = start + raw.length;
        addRange({
            start,
            end,
            raw,
            context: 'css',
        });
    }
    // 2. Check HTML / JSX / Template class attributes
    let attrMatch;
    while ((attrMatch = ATTR_REGEX.exec(content)) !== null) {
        const rawAttrValue = attrMatch[2];
        const delimiter = attrMatch[1];
        const valueStart = attrMatch.index + attrMatch[0].indexOf(rawAttrValue);
        // If it's a simple quote string literal
        if (delimiter === '"' || delimiter === "'" || delimiter === '`') {
            addRange({
                start: valueStart,
                end: valueStart + rawAttrValue.length,
                raw: rawAttrValue,
                delimiter,
                context: 'html',
            });
        }
        else {
            // Dynamic expression like class={clsx("p-4", "p-2")}
            let strMatch;
            while ((strMatch = STRING_LITERAL_REGEX.exec(rawAttrValue)) !== null) {
                const subRaw = strMatch[2];
                const subStart = valueStart + strMatch.index + 1;
                const subEnd = subStart + subRaw.length;
                addRange({
                    start: subStart,
                    end: subEnd,
                    raw: subRaw,
                    delimiter: strMatch[1],
                    context: 'jsx',
                });
            }
        }
    }
    // 3. Check Helper Functions (clsx, cva, twMerge, cn, tw`...`)
    let helperMatch;
    while ((helperMatch = HELPER_REGEX.exec(content)) !== null) {
        const helperArgs = helperMatch[1];
        const argsStart = helperMatch.index + helperMatch[0].indexOf(helperArgs);
        if (helperMatch[0].includes('`')) {
            // Tagged template literal: tw`p-4 text-white`
            addRange({
                start: argsStart,
                end: argsStart + helperArgs.length,
                raw: helperArgs,
                delimiter: '`',
                context: 'helper',
            });
        }
        else {
            // Function call arguments: cn('p-4', 'text-white')
            let strMatch;
            while ((strMatch = STRING_LITERAL_REGEX.exec(helperArgs)) !== null) {
                const subRaw = strMatch[2];
                const subStart = argsStart + strMatch.index + 1;
                const subEnd = subStart + subRaw.length;
                addRange({
                    start: subStart,
                    end: subEnd,
                    raw: subRaw,
                    delimiter: strMatch[1],
                    context: 'helper',
                });
            }
        }
    }
    // 4. Check Rust / Leptos / Yew / Dioxus macros
    let rustMatch;
    while ((rustMatch = RUST_CLASSES_REGEX.exec(content)) !== null) {
        const raw = rustMatch[1];
        const start = rustMatch.index + rustMatch[0].indexOf(raw);
        const end = start + raw.length;
        addRange({
            start,
            end,
            raw,
            context: 'template',
        });
    }
    // Sort ranges in ascending order of start position
    return results.sort((a, b) => a.start - b.start);
}
