import { useEffect, useState } from "react";
import { ARCANA_IMAGE_URI } from "../../constants/arcana-images";
import { ArcanaIdentities } from "../../constants/arcana-identities";
import { proxyImageUrl } from '../../utilities/proxy-image-url';

export default function CardFace({ cardId, cardWidth, cardHeight, isOptimised = false }: 
    { cardId: keyof typeof ARCANA_IMAGE_URI, cardWidth?: number, cardHeight?: number, isOptimised?: boolean }) {
    const THELEMA_FALLBACK_CARD_ID = ArcanaIdentities.THELEMA as keyof typeof ARCANA_IMAGE_URI;

    const [activeCardId, setActiveCardId] = useState<keyof typeof ARCANA_IMAGE_URI>(cardId);
    const [index, setIndex] = useState(0);
    const uriCandidates = ARCANA_IMAGE_URI[activeCardId] ?? [];
    const config = uriCandidates[index];

    useEffect(() => {
        setActiveCardId(cardId);
        setIndex(0);
    }, [cardId]);

    if (!config) {
    console.error('CardFace: no config found for cardId:', activeCardId, ' and URI list: ', uriCandidates, ' at index:', index);
    return null;
}

    let isFluid = cardWidth === undefined && cardHeight === undefined;
    let src = config.uri;

    // Optimise when required. At least one dimension must be provided in order to optimise.
    if (isOptimised && !isFluid)
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

                    if (nextIndex < uriCandidates.length) {
                        console.warn('CardFace: uri failure on cardId', activeCardId, 'and URI:', config.uri, 'moving to candidate index:', nextIndex);
                        setIndex(nextIndex);
                        return;
                    }

                    if (activeCardId !== THELEMA_FALLBACK_CARD_ID) {
                        console.warn('CardFace: all URIs failed for cardId', activeCardId, '- falling back to THELEMA URIs');
                        setActiveCardId(THELEMA_FALLBACK_CARD_ID);
                        setIndex(0);
                        return;
                    }

                    console.error('CardFace: all URIs failed, including THELEMA fallback, for original cardId', cardId);
                }}
            />
        </div>
    );
}