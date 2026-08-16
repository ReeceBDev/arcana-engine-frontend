import './InspectHorizontal.css';
import { useEffect, useMemo, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import CardFace from '../../components/ArcanaCard/CardFace';
import CorrespondenceGrid from '../../components/CorrespondenceGrid/CorrespondenceGrid';
import { getArcanaByNumber } from '../../constants/data/arcana-numbers';
import { ARCANA_CORRESPONDENCES } from '../../constants/data/arcana-correspondences';
import { getArcanaDescription } from '../../constants/data/arcana-descriptions';
import { stepArcanaId } from '../../constants/data/arcana-elements';
import { useAdjacentCardPreload } from './useAdjacentCardPreload';
import arrow from 'url:../../../assets/images/arrow.webp';

export default function InspectHorizontal({ cardId, onClose, onHome, onCardChange }: {
    /** Numeric identity of the card to inspect. */
    cardId: number;
    onClose: () => void;
    onHome: () => void;
    /** Move to another card in the deck chain (prev/next arrows). */
    onCardChange: (cardId: number) => void;
}) {
    const identity = getArcanaByNumber(cardId as never);
    const description = getArcanaDescription(identity ?? 'THELEMA');
    const correspondences = identity ? ARCANA_CORRESPONDENCES[identity] ?? [] : [];

    const [isFullscreen, setIsFullscreen] = useState(false);

    const cardWidth = useMemo(() => Math.min(window.innerHeight * 0.26, 300), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

    // Keep the cards either side of this one warm (the exact proxied URLs
    // CardFace requests) so the prev/next arrows swap instantly.
    useAdjacentCardPreload(cardId, cardWidth, cardHeight);

    // Keyboard: Escape closes the fullscreen overlay; left/right walk the chain.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
                return;
            }
            if (isFullscreen) return;
            if (e.key === 'ArrowLeft') onCardChange(stepArcanaId(cardId, -1));
            else if (e.key === 'ArrowRight') onCardChange(stepArcanaId(cardId, 1));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen, cardId, onCardChange]);

    return (
        <div className="inspect-horizontal">
            <CardSequenceBackground objectPosition="center" />

            <div className="inspect-top-bar">
                <button className="back-button" onClick={onClose} aria-label="Close">
                    <img src={arrow} alt="Back" />
                </button>
                <button className="home-link" onClick={onHome}>Go Home</button>
            </div>

            <div className="content">
                <div className="portrait-column">
                    <button
                        className="prev-card-button"
                        onClick={() => onCardChange(stepArcanaId(cardId, -1))}
                        aria-label="Previous card"
                    >
                        <img src={arrow} alt="" />
                    </button>
                    <div className="portrait-slot">
                        <button
                            className="portrait-card"
                            style={{ width: cardWidth, height: cardHeight }}
                            onClick={() => setIsFullscreen(f => !f)}
                            aria-label={isFullscreen ? 'Shrink card' : 'Expand card'}
                        >
                            <CardFace cardId={cardId} cardWidth={cardWidth} cardHeight={cardHeight} isOptimised />
                        </button>
                    </div>
                    <button
                        className="next-card-button"
                        onClick={() => onCardChange(stepArcanaId(cardId, 1))}
                        aria-label="Next card"
                    >
                        <img src={arrow} alt="" />
                    </button>
                </div>

                <div className="info-column">
                    <h2 className="inspect-title">{description.title}</h2>

                    <div className="correspondences-region">
                        <CorrespondenceGrid correspondences={correspondences} />
                    </div>

                    <div className="description-scroll">
                        <p className="description-body">{description.body}</p>
                    </div>
                </div>
            </div>

            {isFullscreen && (
                <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
                    <div className="fullscreen-card">
                        <CardFace cardId={cardId} isOptimised />
                    </div>
                </div>
            )}
        </div>
    );
}
