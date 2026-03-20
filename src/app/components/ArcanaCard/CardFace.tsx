import { useState } from "react";
import { ARCANA_IMAGE_URI } from "../../constants/arcana-images";
import { proxyImageUrl } from '../../utilities/proxy-image-url';

export default function CardFace({ cardId, cardWidth, cardHeight, isOptimised = false }: 
    { cardId: keyof typeof ARCANA_IMAGE_URI, cardWidth?: number, cardHeight?: number, isOptimised?: boolean }) {
    const [index, setIndex] = useState(0);
    const config = ARCANA_IMAGE_URI[cardId][index];
    if (!config) {
    console.error('CardFace: no config found for cardId:', cardId);
    return null;
}

    const isFluid = cardWidth === undefined && cardHeight === undefined;
    const src = (!isOptimised && isFluid) ? config.uri : proxyImageUrl(config.uri, cardWidth! * 2, cardHeight! * 2, 90);
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
                onError={() => {console.warn('CardFace: uri failure on cardId', cardId, ' and index:', index);setIndex(index + 1);} }
            />
        </div>
    );
}