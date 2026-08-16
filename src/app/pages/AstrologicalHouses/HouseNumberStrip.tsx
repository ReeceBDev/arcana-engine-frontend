import './HouseNumberStrip.css';
import { useCallback, useRef } from 'react';

/**
 * Fixed 1–12 navigator for the Astrological Houses page.
 *
 * The strip itself never moves — it is a row of twelve numerals with a gold
 * selector on the currently selected house. Tapping a numeral selects it, and
 * sweeping a finger (or dragging a mouse) across the strip selects each
 * numeral it passes in sequence, flipping the carousel accordingly.
 */
export default function HouseNumberStrip({ selected, onSelect }: {
    /** 0-based index of the selected house. */
    selected: number;
    onSelect: (index: number) => void;
}) {
    const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const draggingRef = useRef(false);
    const lastIndexRef = useRef(-1);

    /** Nearest cell to a client X position (hit-test by centre distance). */
    const hitTest = useCallback((clientX: number): number => {
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < cellRefs.current.length; i++) {
            const el = cellRefs.current[i];
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(clientX - (rect.left + rect.width / 2));
            if (dist < bestDist) {
                bestDist = dist;
                best = i;
            }
        }
        return best;
    }, []);

    const selectAt = useCallback((clientX: number) => {
        const index = hitTest(clientX);
        if (index >= 0 && index !== lastIndexRef.current) {
            lastIndexRef.current = index;
            onSelect(index);
        }
    }, [hitTest, onSelect]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        draggingRef.current = true;
        lastIndexRef.current = -1;
        e.currentTarget.setPointerCapture(e.pointerId);
        selectAt(e.clientX);
    }, [selectAt]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;
        selectAt(e.clientX);
    }, [selectAt]);

    const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        lastIndexRef.current = -1;
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }, []);

    return (
        <div
            className="house-number-strip"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            {Array.from({ length: 12 }, (_, i) => (
                <button
                    key={i}
                    ref={el => { cellRefs.current[i] = el; }}
                    className={`house-number-cell${i === selected ? ' selected' : ''}`}
                    onClick={() => onSelect(i)}
                    aria-label={`House ${i + 1}`}
                >
                    <span className="house-number-glyph">{i + 1}</span>
                </button>
            ))}
        </div>
    );
}
