import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { type ArcanaIdentity } from '../../constants/arcana-identities';
import { StandardFlip } from '../../animations/useCardAnimation';
import type { CardAnimationConfig } from '../../../types/card-animation-config';
import AnimatedCardFace from './AnimatedCardFace';

type FlippableCardProps = {
    arcana: ArcanaIdentity;
    cardWidth?: number;
    cardHeight?: number;
    isBackUp: boolean;
    translateX: number;
    translateY: number;
    rotateDeg: number;
    zIndex: number;
    transitionDurationMs: number;
    transitionDelayMs: number;
    transitionEasing: string;
    onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel?: (e: React.PointerEvent<HTMLDivElement>) => void;
    animationConfig?: CardAnimationConfig;
};

export default function FlippableCard({
    arcana,
    cardWidth,
    cardHeight,
    isBackUp,
    translateX,
    translateY,
    rotateDeg,
    zIndex,
    transitionDurationMs,
    transitionDelayMs,
    transitionEasing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    animationConfig = StandardFlip,
}: FlippableCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const frontFaceRef = useRef<HTMLDivElement | null>(null);
    const backFaceRef = useRef<HTMLDivElement | null>(null);
    const flipTurnsRef = useRef(isBackUp ? (animationConfig.rate || 1) : 0);
    const prevBackUpRef = useRef(isBackUp);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        if (transitionDurationMs <= 0) {
            gsap.killTweensOf(card, 'x,y,rotation');
            gsap.set(card, {
                x: translateX,
                y: translateY,
                rotation: rotateDeg,
                force3D: true,
            });
            return;
        }

        gsap.to(card, {
            x: translateX,
            y: translateY,
            rotation: rotateDeg,
            duration: transitionDurationMs / 1000,
            delay: transitionDelayMs / 1000,
            ease: transitionEasing,
            overwrite: 'auto',
            force3D: true,
        });
    }, [translateX, translateY, rotateDeg, transitionDurationMs, transitionDelayMs, transitionEasing]);

    useEffect(() => {
        const front = frontFaceRef.current;
        const back = backFaceRef.current;
        if (!front || !back) return;

        if (prevBackUpRef.current !== isBackUp) {
            flipTurnsRef.current += (animationConfig.rate || 1);
            prevBackUpRef.current = isBackUp;
        }

        const frontRotationDeg = flipTurnsRef.current * 180;
        const backRotationDeg = 180 + flipTurnsRef.current * 180;

        gsap.to(front, {
            rotationY: frontRotationDeg,
            duration: animationConfig.duration / 1000,
            ease: animationConfig.easing,
            overwrite: 'auto',
            transformPerspective: 1400,
            force3D: true,
        });

        gsap.to(back, {
            rotationY: backRotationDeg,
            duration: animationConfig.duration / 1000,
            ease: animationConfig.easing,
            overwrite: 'auto',
            transformPerspective: 1400,
            force3D: true,
        });
    }, [isBackUp, animationConfig.duration, animationConfig.easing, animationConfig.rate]);

    useEffect(() => {
        const front = frontFaceRef.current;
        const back = backFaceRef.current;
        const card = cardRef.current;
        if (!front || !back || !card) return;

        const initialFront = flipTurnsRef.current * 180;
        const initialBack = 180 + flipTurnsRef.current * 180;

        gsap.set(card, { x: translateX, y: translateY, rotation: rotateDeg });
        gsap.set(front, { rotationY: initialFront, transformPerspective: 1400, force3D: true });
        gsap.set(back, { rotationY: initialBack, transformPerspective: 1400, force3D: true });
    }, []);

    return (
        <div
            ref={cardRef}
            className="flippable-card"
            style={{
                width: cardWidth,
                height: cardHeight,
                zIndex,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
        >
            <div className="flippable-card-3d">
                <AnimatedCardFace
                    arcana={arcana}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    isFront={true}
                    faceRef={frontFaceRef}
                />
                <AnimatedCardFace
                    arcana={'BACK'}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    isFront={false}
                    faceRef={backFaceRef}
                />
            </div>
        </div>
    );
}
