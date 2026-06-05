import { useEffect, useRef, useState } from 'react';
import type { CardAnimationConfig } from '../../types/card-animation-config';

export const StandardFlip: CardAnimationConfig = {
    duration: 700,
    easing: 'linear',
    rate: 1,
};

export const FastSpin: CardAnimationConfig = {
    duration: 220,
    easing: 'ease',
    rate: 1,
};

export const SlowCurve: CardAnimationConfig = {
    duration: 1400,
    easing: 'cubic-bezier(0.2, 0.9, 0.6, 0.05)',
    rate: 1,
};

export const DramaticPause: CardAnimationConfig = {
    duration: 1300,
    easing: 'cubic-bezier(0.15, 0.79, 0.45, 0.875)',
    rate: 1,
};

export const QuickReveal: CardAnimationConfig = {
    duration: 700,
    easing: 'cubic-bezier(0.55, 0.125, 0.85, 0.225)',
    rate: 1,
};

export const FlickSnap: CardAnimationConfig = {
    duration: 460,
    easing: 'cubic-bezier(0.85, 0, 0.3, 1)',
    rate: 1,
};

export function useCardAnimation({ isFlipped, config }: { isFlipped: boolean; config: CardAnimationConfig }) {
    const [rotationTurns, setRotationTurns] = useState(isFlipped ? (config.rate || 1) : 0);
    const flipCount = useRef(isFlipped ? 1 : 0);
    const prevFlipped = useRef(isFlipped);

    useEffect(() => {
        if (prevFlipped.current === isFlipped) {
            return;
        }

        prevFlipped.current = isFlipped;
        flipCount.current += 1;
        const targetTurns = flipCount.current * (config.rate || 1);
        setRotationTurns(targetTurns);
    }, [isFlipped, config.rate]);

    return {
        frontRotationDeg: rotationTurns * 180,
        backRotationDeg: 180 + rotationTurns * 180,
    };
}
