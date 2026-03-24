import { useState } from "react";
import { ARCANA_IMAGE_URI } from "../../constants/arcana-images";
import { proxyImageUrl } from '../../utilities/proxy-image-url';

export default function CardFace({ cardId, cardWidth, cardHeight, isOptimised = false }: 
    { cardId: keyof typeof ARCANA_IMAGE_URI, cardWidth?: number, cardHeight?: number, isOptimised?: boolean }) {
    const [index, setIndex] = useState(0);
    const config = ARCANA_IMAGE_URI[cardId][index];
    if (!config) {
    console.error('CardFace: no config found for cardId:', cardId, ' and URI: ', ARCANA_IMAGE_URI[cardId], ' at index:', index);
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
                onError={() => {console.warn('CardFace: uri failure on cardId', cardId, 'and URI: ', config.uri, ' and index:', index);setIndex(index + 1);} }
            />
        </div>
    );
}