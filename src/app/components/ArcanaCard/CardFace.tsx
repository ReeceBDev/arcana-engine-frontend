import { useState } from "react";
import { ARCANA_IMAGE_URI } from "../../constants/arcana-images";

export default function CardFace({ cardId, cardWidth, cardHeight }: { cardId: keyof typeof ARCANA_IMAGE_URI, cardWidth?: number, cardHeight?: number }) {
    const [index, setIndex] = useState(0);
    const config = ARCANA_IMAGE_URI[cardId][index];
    const isFluid = cardWidth === undefined && cardHeight === undefined;

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
                src={config.uri}
                alt="Arcana card"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    marginLeft: config.offsetX ?? 0,
                    marginTop: config.offsetY ?? 0,
                    transform: `scaleX(${config.scaleX ?? 1}) scaleY(${config.scaleY ?? 1})`,
                }}
                onError={() => setIndex(index + 1)}
            />
        </div>
    );
}