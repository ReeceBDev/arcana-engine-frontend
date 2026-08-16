import { useEffect, useRef } from 'react';
import { ARCANA_IMAGE_URI } from '../../constants/arcana-images';
import { stepArcanaId } from '../../constants/data/arcana-elements';
import { proxyImageUrl } from '../../utilities/proxy-image-url';

/** A single warmed image plus the proxied URL it was requested under. */
type PreloadHandle = { img: HTMLImageElement; url: string };

/**
 * Keeps the cards adjacent to `cardId` (±1 in the deck chain) warm so the
 * Inspect screen's prev/next arrows swap cards instantly.
 *
 * The portrait renders through CardFace with isOptimised + explicit dimensions,
 * i.e. `proxyImageUrl(uri, width * 2, height * 2, 90)` — so we warm exactly the
 * same proxied URL, otherwise the browser cache would miss. Handles outside
 * the ±1 window are dropped (`src = ''`) so the WebView can reclaim the
 * decoded bitmaps; the window never grows as the user steps through the deck.
 */
export function useAdjacentCardPreload(cardId: number, width: number, height: number) {
    /** Proxied URL -> handle for the images currently kept warm. */
    const liveRef = useRef<Map<string, PreloadHandle>>(new Map());

    useEffect(() => {
        if (width <= 0 || height <= 0) return;

        // Debounce: resize churn (and rapid arrow taps) would otherwise retire
        // and re-warm the window for every intermediate size.
        const timer = window.setTimeout(() => {
            const wantedUrls = new Set<string>();

            const warm = (adjacentId: number, candidateIndex: number) => {
                const candidates = ARCANA_IMAGE_URI[adjacentId as keyof typeof ARCANA_IMAGE_URI] ?? [];
                const uri = candidates[candidateIndex]?.uri;
                // Exhausted the candidate list — let CardFace run its own
                // fallback ladder when (if) the card is actually shown.
                if (!uri) return;
                const url = proxyImageUrl(uri, width * 2, height * 2, 90);
                wantedUrls.add(url);
                if (liveRef.current.has(url)) return; // already warm
                const handle: PreloadHandle = { img: new Image(), url };
                liveRef.current.set(url, handle);
                // Mirror CardFace's Tier A: on failure advance to the next
                // candidate URI for this card.
                handle.img.onerror = () => {
                    liveRef.current.delete(url);
                    warm(adjacentId, candidateIndex + 1);
                };
                handle.img.src = url;
            };

            warm(stepArcanaId(cardId, -1), 0);
            warm(stepArcanaId(cardId, 1), 0);

            // Unload: drop everything outside the current ±1 window.
            for (const [url, handle] of liveRef.current) {
                if (wantedUrls.has(url)) continue;
                handle.img.onerror = null;
                handle.img.src = '';
                liveRef.current.delete(url);
            }
        }, 150);

        return () => window.clearTimeout(timer);
    }, [cardId, width, height]);

    // Full teardown on unmount (leaving the Inspect screen).
    useEffect(() => () => {
        for (const [, handle] of liveRef.current) {
            handle.img.onerror = null;
            handle.img.src = '';
        }
        liveRef.current.clear();
    }, []);
}
