import './ArcanaPill.css';
import type { Ref } from 'react';

/**
 * Pill-shaped toggle button (extracted from the CardStack "Archetype" pill).
 * The ring border is a masked ::before; `is-active` spins a conic gradient
 * around it, `is-open` tints it purple to signal the expanded state.
 * Purely presentational — the caller owns opacity/reveal animations (CardStack
 * drives them with GSAP through the forwarded ref) and placement (via className).
 */
export function ArcanaPill({ label, isActive = true, isOpen = false, onClick, className = '', ref }: {
    label: string;
    /** Spinning conic ring. CardStack gates this on the card flip. */
    isActive?: boolean;
    /** Purple tint while the pill's content is open. */
    isOpen?: boolean;
    onClick?: () => void;
    /** Consumer class for placement (e.g. absolute positioning). */
    className?: string;
    /** Forwarded so GSAP consumers can animate the button. */
    ref?: Ref<HTMLButtonElement>;
}) {
    return (
        <button
            type="button"
            className={`arcana-pill${isActive ? ' is-active' : ''}${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
            onClick={onClick}
            ref={ref}
        >
            {label}
        </button>
    );
}
