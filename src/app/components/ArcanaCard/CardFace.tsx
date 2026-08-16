import { useEffect, useState } from "react";
import { ARCANA_IMAGE_URI } from "../../constants/arcana-images";
import { ArcanaIdentities } from "../../constants/arcana-identities";
import { proxyImageUrl } from '../../utilities/proxy-image-url';

export default function CardFace({ cardId, cardWidth, cardHeight, isOptimised = false }: 
    { cardId: keyof typeof ARCANA_IMAGE_URI, cardWidth?: number, cardHeight?: number, isOptimised?: boolean }) {
    const THELEMA_FALLBACK_CARD_ID = ArcanaIdentities.THELEMA as keyof typeof ARCANA_IMAGE_URI;

    const [activeCardId, setActiveCardId] = useState<keyof typeof ARCANA_IMAGE_URI>(cardId);
    const [index, setIndex] = useState(0);
    // One-way latch per card: once every optimised (proxied) candidate has
    // failed, flip this to retry the SAME candidate list RAW (un-proxied)
    // before bailing to the THELEMA placeholder. Partial success > placeholder.
    const [deoptimised, setDeoptimised] = useState(false);
    const uriCandidates = ARCANA_IMAGE_URI[activeCardId] ?? [];
    const config = uriCandidates[index];

    useEffect(() => {
        setActiveCardId(cardId);
        setIndex(0);
        setDeoptimised(false);
    }, [cardId]);

    if (!config) {
    console.error('CardFace: no config found for cardId:', activeCardId, ' and URI list: ', uriCandidates, ' at index:', index);
    return null;
}

    let isFluid = cardWidth === undefined && cardHeight === undefined;
    let src = config.uri;

    // Optimise when required, UNLESS we've already exhausted the optimised
    // candidate list (deoptimised retry) — then render the raw URI directly.
    // At least one dimension must be provided in order to optimise.
    if (isOptimised && !isFluid && !deoptimised)
    {
        // Resolve both dimensions
        cardWidth ??= Math.round(cardHeight! / 1.5);
        cardHeight ??= Math.round(cardWidth * 1.5);

        src = proxyImageUrl(config.uri, cardWidth * 2, cardHeight * 2, 90);
    }
    else if (isOptimised && isFluid) {
        console.warn('CardFace: isOptimised is true but both cardWidth and cardHeight are undefined. Cannot optimise image without at least one dimension. Rendering non-optimised image for cardId:', cardId);
    }

    return (
        <div style={{
            width: isFluid ? 'auto' : cardWidth,
            height: isFluid ? '100%' : cardHeight,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: isFluid ? '2 / 3' : undefined,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img
                src={src}
                alt="Arcana card"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    marginLeft: config.offsetX ?? 0,
                    marginTop: config.offsetY ?? 0,
                    transform: `scaleX(${config.scaleX ?? 1}) scaleY(${config.scaleY ?? 1})`,
                }}
                onError={() => {
                    const nextIndex = index + 1;

                    // Tier A — try the next optimised/raw candidate.
                    if (nextIndex < uriCandidates.length) {
                        console.warn('CardFace: uri failure on cardId', activeCardId, 'and URI:', config.uri, 'moving to candidate index:', nextIndex);
                        setIndex(nextIndex);
                        return;
                    }

                    // Tier B — exhausted the candidate list. If we were optimised
                    // and haven't retried raw yet, re-walk the whole list un-proxied.
                    if (isOptimised && !isFluid && !deoptimised) {
                        console.warn('CardFace: all optimised URIs failed for cardId', activeCardId, '- retrying candidates un-optimised');
                        setDeoptimised(true);
                        setIndex(0);
                        return;
                    }

                    // Tier C — bailing to the THELEMA placeholder. Reset the
                    // latch so THELEMA gets its own fresh optimised→raw cycle.
                    if (activeCardId !== THELEMA_FALLBACK_CARD_ID) {
                        console.warn('CardFace: all URIs failed (incl. un-optimised) for cardId', activeCardId, '- falling back to THELEMA URIs');
                        setActiveCardId(THELEMA_FALLBACK_CARD_ID);
                        setIndex(0);
                        setDeoptimised(false);
                        return;
                    }

                    // Tier D — THELEMA itself failed; nothing left.
                    console.error('CardFace: all URIs failed, including THELEMA fallback, for original cardId', cardId);
                }}
            />
        </div>
    );
}