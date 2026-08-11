import type { CSSProperties } from 'react';
import './CardSplay.css';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities } from '../../constants/arcana-identities';

/**
 * Renders a fan of face-down card backs peeking out from behind a preview card.
 *
 * The fan geometry (spread angle + lift) is driven entirely by CSS custom
 * properties (`--splay-spread`, `--splay-lift`) declared on the ancestor
 * `.card-preview-wrap`. This keeps the component markup-only and lets each
 * consuming view style its own fan (e.g. horizontal hovers to widen it) without
 * colliding CSS — per the repo's orientation-split convention.
 *
 * Each splay card receives `--t` in [-1, 1] (its normalised position across the
 * fan); the transform math lives in CardSplay.css.
 */
const MAX_SPLAY = 4;

export default function CardSplay({
    count,
    cardWidth,
    cardHeight,
}: {
    count: number;
    cardWidth: number;
    cardHeight: number;
}) {
    const visible = Math.max(0, Math.min(count, MAX_SPLAY));
    if (visible === 0) return null;

    return (
        <div className="card-splay" aria-hidden="true">
            {Array.from({ length: visible }, (_, i) => {
                // Normalised angular offset across the fan. A lone card peeks
                // off to one side instead of vanishing directly behind the top.
                const t = visible === 1 ? 0.85 : (i / (visible - 1)) * 2 - 1;
                return (
                    <div
                        className="splay-card"
                        key={i}
                        style={{
                            '--t': t,
                            width: cardWidth,
                            height: cardHeight,
                            zIndex: visible - i,
                        } as CSSProperties}
                    >
                        <CardFace
                            cardId={ArcanaIdentities.BACK}
                            cardWidth={cardWidth}
                            cardHeight={cardHeight}
                            isOptimised
                        />
                    </div>
                );
            })}
        </div>
    );
}
