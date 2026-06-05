import CardFace from '../ArcanaCard/CardFace';
import type { ArcanaIdentity } from '../../constants/arcana-identities';
import { ArcanaIdentities } from '../../constants/arcana-identities';

type AnimatedCardFaceProps = {
    arcana: ArcanaIdentity;
    cardWidth?: number;
    cardHeight?: number;
    isFront: boolean;
    faceRef?: React.RefObject<HTMLDivElement | null>;
};

export default function AnimatedCardFace({
    arcana,
    cardWidth,
    cardHeight,
    isFront,
    faceRef,
}: AnimatedCardFaceProps) {
    return (
        <div
            ref={faceRef}
            className="animated-card-face"
            style={{
                backfaceVisibility: 'hidden',
                position: isFront ? 'relative' : 'absolute',
                inset: 0,
            }}
        >
            <CardFace cardId={ArcanaIdentities[arcana]} cardWidth={cardWidth} cardHeight={cardHeight} />
        </div>
    );
}
