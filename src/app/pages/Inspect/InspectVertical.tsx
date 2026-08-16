import './InspectVertical.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import CardFace from '../../components/ArcanaCard/CardFace';
import CorrespondenceGrid from '../../components/CorrespondenceGrid/CorrespondenceGrid';
import { getArcanaByNumber } from '../../constants/data/arcana-numbers';
import { ARCANA_CORRESPONDENCES } from '../../constants/data/arcana-correspondences';
import { getArcanaDescription } from '../../constants/data/arcana-descriptions';
import { stepArcanaId } from '../../constants/data/arcana-elements';
import { useAdjacentCardPreload } from './useAdjacentCardPreload';
import arrow from 'url:../../../assets/images/arrow.webp';

export default function InspectVertical({ cardId, onClose, onHome, onCardChange }: {
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

    // Size the portrait to fill its region vertically at a 2:3 aspect.
    const portraitRegionRef = useRef<HTMLDivElement>(null);
    const [cardSize, setCardSize] = useState<{ width: number; height: number }>({ width: 200, height: 300 });

    useLayoutEffect(() => {
        const region = portraitRegionRef.current;
        if (!region) return;
        const recompute = () => {
            const availHeight = region.clientHeight;
            const availWidth = region.clientWidth;
            const width = Math.max(0, Math.min(availWidth, availHeight / 1.5));
            setCardSize({ width: Math.round(width), height: Math.round(width * 1.5) });
        };
        recompute();
        const ro = new ResizeObserver(recompute);
        ro.observe(region);
        return () => ro.disconnect();
    }, []);

    // Keep the cards either side of this one warm (the exact proxied URLs
    // CardFace requests) so the prev/next arrows swap instantly.
    useAdjacentCardPreload(cardId, cardSize.width, cardSize.height);

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
        <div className="inspect-vertical">
            <CardSequenceBackground />

            <div className="inspect-top-bar">
                <button className="back-button" onClick={onClose} aria-label="Close">
                    <img src={arrow} alt="Back" />
                </button>
                <button className="home-link" onClick={onHome}>Go Home</button>
            </div>

            <div className="portrait-region">
                <button
                    className="prev-card-button"
                    onClick={() => onCardChange(stepArcanaId(cardId, -1))}
                    aria-label="Previous card"
                >
                    <img src={arrow} alt="" />
                </button>
                <div className="portrait-slot" ref={portraitRegionRef}>
                    <button
                        className="portrait-card"
                        style={{ width: cardSize.width, height: cardSize.height }}
                        onClick={() => setIsFullscreen(f => !f)}
                        aria-label={isFullscreen ? 'Shrink card' : 'Expand card'}
                    >
                        <CardFace cardId={cardId} cardWidth={cardSize.width} cardHeight={cardSize.height} isOptimised />
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

            <div className="correspondences-region">
                <CorrespondenceGrid correspondences={correspondences} />
            </div>

            <div className="description-region">
                <h2 className="inspect-title">{description.title}</h2>
                <div className="description-scroll">
                    <p className="description-body">{description.body}</p>
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
