"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortClasses = sortClasses;
// Category priority weights (lower number = earlier position)
const CATEGORY_WEIGHTS = [
    // 1. Layout & Display
    { pattern: /^(container|block|inline-block|inline|flex|inline-flex|grid|inline-grid|table|hidden|contents|flow-root)$/, weight: 10 },
    { pattern: /^(static|fixed|absolute|relative|sticky)$/, weight: 20 },
    { pattern: /^-?(inset|top|right|bottom|left|start|end)(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])?$/, weight: 30 },
    { pattern: /^z-(auto|\d+|\[[^\]]+\])$/, weight: 40 },
    { pattern: /^overflow(-[xy])?-(auto|hidden|clip|visible|scroll)$/, weight: 50 },
    // 2. Sizing & Box Model
    { pattern: /^w-(auto|px|full|screen|min|max|fit|\d+|\d+\/\d+|\[[^\]]+\])$/, weight: 100 },
    { pattern: /^min-w-/, weight: 110 },
    { pattern: /^max-w-/, weight: 120 },
    { pattern: /^h-(auto|px|full|screen|min|max|fit|\d+|\d+\/\d+|\[[^\]]+\])$/, weight: 130 },
    { pattern: /^min-h-/, weight: 140 },
    { pattern: /^max-h-/, weight: 150 },
    // Spacing (Padding before Margin)
    { pattern: /^p(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/, weight: 200 },
    { pattern: /^p[xytrbl](-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/, weight: 210 },
    { pattern: /^-?m(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/, weight: 220 },
    { pattern: /^-?m[xytrbl](-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/, weight: 230 },
    { pattern: /^-?space-[xy]-/, weight: 240 },
    // 3. Flex & Grid Layouts
    { pattern: /^flex-(row|row-reverse|col|col-reverse|wrap|wrap-reverse|nowrap|1|auto|initial|none)$/, weight: 300 },
    { pattern: /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline|auto)/, weight: 310 },
    { pattern: /^gap(-[xy])?(-\d+|-\[[^\]]+\])$/, weight: 320 },
    { pattern: /^(grid-cols|grid-rows|col-|row-)/, weight: 330 },
    { pattern: /^order-/, weight: 340 },
    // 4. Typography
    { pattern: /^font-(sans|serif|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[[^\]]+\])$/, weight: 400 },
    { pattern: /^text-(xs|sm|base|lg|xl|\d+xl|left|center|right|justify|start|end)$/, weight: 410 },
    { pattern: /^text-(?!xs|sm|base|lg|xl|\d+xl|left|center|right)([a-z0-9\-]+|\[[^\]]+\])/, weight: 420 }, // Text color
    { pattern: /^tracking-/, weight: 430 },
    { pattern: /^leading-/, weight: 440 },
    { pattern: /^(uppercase|lowercase|capitalize|normal-case|italic|not-italic|underline|line-through|no-underline)$/, weight: 450 },
    // 5. Backgrounds
    { pattern: /^bg-(?!repeat|no-repeat|auto|cover|contain|bottom|center)([a-z0-9\-]+|\[[^\]]+\])/, weight: 500 },
    { pattern: /^bg-(repeat|no-repeat|auto|cover|contain|bottom|center|fixed|local|scroll)/, weight: 510 },
    { pattern: /^(from|via|to)-/, weight: 520 },
    // 6. Borders & Radius
    { pattern: /^rounded(-[a-z0-9\-]+)?$/, weight: 600 },
    { pattern: /^border(-\d+|-[a-z0-9\-]+|\[[^\]]+\])?$/, weight: 610 },
    { pattern: /^border-(solid|dashed|dotted|double|hidden|none)$/, weight: 620 },
    { pattern: /^(divide|ring|outline)-/, weight: 630 },
    // 7. Effects & Filters
    { pattern: /^shadow(-[a-z0-9\-]+)?$/, weight: 700 },
    { pattern: /^opacity-/, weight: 710 },
    { pattern: /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop-)/, weight: 720 },
    // 8. Transitions & Animations
    { pattern: /^transition(-[a-z0-9\-]+)?$/, weight: 800 },
    { pattern: /^(duration|ease|delay|animate)-/, weight: 810 },
    // 9. Transforms
    { pattern: /^(scale|rotate|translate|skew|origin)-/, weight: 900 },
    // 10. Interactivity & SVG
    { pattern: /^(cursor|select|pointer-events|resize|fill|stroke|sr-only|not-sr-only)-?/, weight: 1000 },
];
const VARIANT_WEIGHTS = {
    sm: 10,
    md: 20,
    lg: 30,
    xl: 40,
    '2xl': 50,
    dark: 100,
    first: 200,
    last: 210,
    odd: 220,
    even: 230,
    hover: 300,
    focus: 310,
    'focus-within': 320,
    'focus-visible': 330,
    active: 340,
    visited: 350,
    target: 360,
    disabled: 370,
    group: 400,
    peer: 410,
};
function calculateClassScore(raw) {
    const parts = raw.split(':');
    const base = parts[parts.length - 1].replace(/^!/, '');
    const variants = parts.slice(0, parts.length - 1);
    let baseWeight = 9999;
    for (const item of CATEGORY_WEIGHTS) {
        if (item.pattern.test(base)) {
            baseWeight = item.weight;
            break;
        }
    }
    let variantWeight = 0;
    for (const v of variants) {
        const cleanVariant = v.replace(/\[.*\]/, '');
        variantWeight += (VARIANT_WEIGHTS[cleanVariant] ?? 500) * 10000;
    }
    return variantWeight + baseWeight;
}
/**
 * Canonical sorting of Tailwind CSS classes matching official prettier-plugin-tailwindcss order.
 */
function sortClasses(classes) {
    const sorted = [...classes].sort((a, b) => {
        const scoreA = calculateClassScore(a);
        const scoreB = calculateClassScore(b);
        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        }
        return a.localeCompare(b);
    });
    const changes = [];
    const originalStr = classes.join(' ');
    const sortedStr = sorted.join(' ');
    if (originalStr !== sortedStr) {
        changes.push({
            type: 'sort',
            original: originalStr,
            replacement: sortedStr,
            reason: 'Sorted classes according to Tailwind official canonical order',
        });
    }
    return { result: sorted, changes };
}
