/**
 * Shrinks the font-size of an element's children until all of the content
 * fits inside the element's content box (width AND height).
 *
 * Vanilla-TypeScript port of the classic jQuery `textfill` pattern, adapted
 * to work on a container holding one or more text children (e.g. several
 * <p> lines inside a .astro-text-block).
 *
 * @param container  The element whose children should be resized to fit.
 * @param options
 *   - maxFontSize: starting size (px) to try before shrinking. Default 500.
 *   - minFontSize: never shrink below this. Default 3.
 *   - step:        how many px to subtract per iteration. Default 1.
 * @returns the font-size (px) that the container settled on, or `null`
 *          if the container could not be measured.
 */
export function textfill(
    container: HTMLElement | null,
    options: { maxFontSize?: number; minFontSize?: number; step?: number } = {},
): number | null {
    if (!container) return null;

    const maxFontSize = options.maxFontSize ?? 500;
    const minFontSize = options.minFontSize ?? 3;
    const step = options.step ?? 1;

    // Cache the available content box. We read it once because changing
    // font-size doesn't change the container's size (it's fixed by CSS).
    const maxHeight = container.clientHeight;
    const maxWidth = container.clientWidth;
    if (maxHeight <= 0 || maxWidth <= 0) return null;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return null;

    let fontSize = maxFontSize;

    const fits = () => {
        // scrollHeight/scrollWidth reflect the total rendered content,
        // including line-wrapping caused by the current font-size.
        return container.scrollHeight <= maxHeight && container.scrollWidth <= maxWidth;
    };

    while (!fits() && fontSize > minFontSize) {
        for (const child of children) {
            child.style.fontSize = `${fontSize}px`;
        }
        fontSize -= step;
    }

    return fontSize + step; // last value that was actually applied
}
