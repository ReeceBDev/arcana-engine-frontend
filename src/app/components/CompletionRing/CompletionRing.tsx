import './CompletionRing.css';
import type { CSSProperties } from 'react';

/**
 * Full-screen "reading complete" indicator. A pure-white ring draws itself
 * closed — quick take-off, glide-in landing — over the untouched page (no
 * dimming or scrim). Purely presentational: the caller owns the navigation
 * timing and switches screens once the ring has played.
 */
export function CompletionRing({ durationMs = 1200, className = '' }: {
    durationMs?: number;
    className?: string;
}) {
    return (
        <div
            className={`completion-ring-overlay${className ? ` ${className}` : ''}`}
            style={{ '--ring-duration': `${durationMs}ms` } as CSSProperties}
            role="status"
            aria-label="Completing reading"
        >
            <svg className="completion-ring" viewBox="0 0 100 100">
                <circle className="completion-ring-path" cx="50" cy="50" r="45" />
            </svg>
        </div>
    );
}
