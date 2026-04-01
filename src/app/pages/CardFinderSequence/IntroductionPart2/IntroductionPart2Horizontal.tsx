import './IntroductionPart2Horizontal.css';
import { useEffect, useRef, useState } from "react";
import { proxyImageUrl } from "../../../utilities/proxy-image-url";
import arrow from 'url:../../../../assets/images/arrow.webp';
import sophia from 'url:../../../../assets/images/sophia.webp';

// delays before each block appears after the previous, starting from nothing being visible.
const BLOCK_GAPS_MS = [
    400,   // block 1 - title
    1600,  // block 2
    2400,  // block 3
    1600,  // block 4
    1200,  // block 5    
];

const BLOCK_DELAYS_MS = BLOCK_GAPS_MS.reduce<number[]>((acc, gap, i) => {
    acc.push(i === 0 ? gap : acc[i - 1] + gap);
    return acc;
}, []);

const CONTINUE_DELAY_MS = 1200; // delay before continue button appears after last block
const TOTAL_BLOCKS = 5;



export default function IntroductionPart2Horizontal({ onHome, onNext, onBack = undefined, showNext = false }: {
    onHome: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
}) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [showSkip, setShowContinue] = useState(false);

    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const continueTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const skip = () => {
        timersRef.current.forEach(clearTimeout);
        clearTimeout(continueTimerRef.current);
        setVisibleCount(TOTAL_BLOCKS);
        setShowContinue(true);
    };

    useEffect(() => {
        timersRef.current = BLOCK_DELAYS_MS.map((delay, i) =>
            setTimeout(() => setVisibleCount(i + 1), delay)
        );
        continueTimerRef.current = setTimeout(() =>
            setShowContinue(true),
            BLOCK_DELAYS_MS[BLOCK_DELAYS_MS.length - 1] + CONTINUE_DELAY_MS
        );
        return () => {
            timersRef.current.forEach(clearTimeout);
            clearTimeout(continueTimerRef.current);
        };
    }, []);

    return (
        <div className="introduction-part2-horizontal">
            <img
                src={proxyImageUrl(
                    'https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png',
                    window.innerWidth,
                    window.innerHeight
                )}
                className="background-image"
            />
            <div className="top-wrapper">
                <TopNavBar onHome={onHome} />

                <img src={sophia} className="header-image" />
                <div className="content">

                    {visibleCount >= 1 && <div className="block-spacer" />}

                    {visibleCount >= 1 && (
                        <div className="content-block block-1">
                            <p className="block-1-line-1">I present to you a pantheon of archetypes,</p>
                            <p className="block-1-line-2">The universe in its many forms.</p>
                        </div>
                    )}

                    {visibleCount >= 1 && <div className="block-spacer" />}

                    {visibleCount >= 2 && (
                        <div className="content-block block-2">
                            <p className="block-2-line-1">Allow me to place the universe into a deck of cards.</p>
                            <p className="block-2-line-2">Behold this deck of cards, and ask it <span className="purple">"What is the colour of my soul?"</span></p>
                        </div>
                    )}

                    {visibleCount >= 2 && <div className="block-spacer" />}

                    {visibleCount >= 3 && (
                        <div className="content-block block-3">
                            <p className="block-3-line-1">Listen to the symphony of the spheres and see:</p>
                            <p className="block-3-line-2">Ask, and it shall answer.</p>
                        </div>
                    )}

                    {visibleCount >= 4 && (
                        <div className="content-block block-4">
                            <p className="block-4-line-1"><span className="gold">That love is the law.</span></p>
                        </div>
                    )}

                    {visibleCount >= 5 && (
                        <div className="content-block block-5">
                            <p className="block-5-line-1"><span className="gold">Love under will.</span></p>
                        </div>
                    )}

                    {showSkip && (
                        <button className="continue-button" onClick={onNext}>
                            ~ Click to Continue ~
                        </button>
                    )}

                </div>
            </div>
            <BottomNavBar onBack={onBack} onSkip={skip} onNext={onNext} showNext={showNext} showSkip={!showSkip} />
        </div>
    );
}

function TopNavBar({ onHome }: { onHome: () => void }) {
    return (
        <div className="top-nav-bar">
            <button className="home-button" onClick={onHome}>
                <p className="home-title">Go Home</p>
            </button>
        </div>
    );
}

function BottomNavBar({ onBack, onSkip, showSkip, onNext, showNext }:
    { onBack?: () => void; onSkip: () => void; showSkip: boolean; onNext: () => void; showNext: boolean }) {
    return (
        <div className="bottom-nav-bar">
            {!showSkip && onBack && (
                <button className="back-button" onClick={onBack}>
                    <img src={arrow} style={{ transform: 'rotate(180deg)' }} />
                </button>
            )}
            {showSkip && (
                <button className="skip-button" onClick={onSkip}>
                    Skip
                </button>
            )}
            {!showSkip && showNext && (
                <button className="next-button" onClick={onNext}>
                    <img src={arrow} />
                </button>
            )}
        </div>
    );
}