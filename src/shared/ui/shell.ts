/**
 * SEED Contents Layout shell — foundations/layout breakpoint margins:
 * base·sm 12px (`x3`), md+ 24px (`x6`).
 */
export const shellInsetClassName = "px-x3 md:px-x6";

/**
 * Centered Main Content region. Max width is `--container-content`
 * (1280px — Contents Layout commerce upper bound). Side Navigation sits outside
 * this shell as its own layout region.
 */
export const shellContentClassName = `mx-auto w-full max-w-content ${shellInsetClassName}`;

/**
 * SEED grid gutters: base·sm 16px (`x4`), md+ 32px (`x8`).
 */
export const shellGutterClassName = "gap-x4 md:gap-x8";
