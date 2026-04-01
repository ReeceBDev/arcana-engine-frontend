import './IntroductionHorizontal.css';
import { useEffect, useRef, useState } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import hermesTrismegistus from 'url:../../../../assets/images/hermesTrismegistus.webp';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

// delays before each block appears after the previous, starting from nothing being visible.
const BLOCK_GAPS_MS = [
    100,   // block 1 - title
    1000,  // block 2
    2700,  // block 3
];

const BLOCK_DELAYS_MS = BLOCK_GAPS_MS.reduce<number[]>((acc, gap, i) => {
    acc.push(i === 0 ? gap : acc[i - 1] + gap);
    return acc;
}, []);

const CONTINUE_DELAY_MS = 1500; // delay before continue button appears after last block
const TOTAL_BLOCKS = 3;



export default function IntroductionHorizontal({ onHome, onNext, onBack = undefined, showNext = false }: {
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
        <div className="introduction-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />

                <img src={hermesTrismegistus} className="header-image" />
                <div className="content">

                    {visibleCount >= 1 && (
                        <div className="content-block block-1">
                            <p className="block-1-heading">What is this? Why does this work?</p>
                        </div>
                    )}

                    {visibleCount >= 1 && <div className="block-spacer" />}

                    {visibleCount >= 2 && (
                        <div className="content-block block-2">
                            <p className="block-2-line-1">The <span className="purple">psychoanalysists</span> of old realised the mind worked in <span className="a">archetypes</span>:</p>
                            <p className="block-2-line-2">Archetypes transmogrify <span className="purple"> complex ideas and reduce them into simple ones</span>,</p>
                            <p className="block-2-line-3">since you'd never know trees had roots if you only looked closely at the leaves.</p>
                        </div>
                    )}

                    {visibleCount >= 2 && <div className="block-spacer" />}

                    {visibleCount >= 3 && (
                        <div className="content-block block-3">
                            <p className="block-3-line-1">We find the <span className="a">archetypes</span> everywhere,</p>
                            <p className="block-3-line-2">the <span className="a">characters</span> of yore: <span className="silver">King Arthur</span> and <span className="silver">The Lady in the Lake</span>,</p>
                            <p className="block-3-line-3">the stories of the gods, <span className="silver">Zeus</span> and <span className="silver">Odin</span>, <span className="silver">Hermes</span> and <span className="silver">Thoth</span>...</p>
                        </div>
                    )}

                    {showSkip && <div className="block-spacer" />}

                    {showSkip && (
                        <button className="continue-button" onClick={onNext}>
                            ~ Click to Continue ~
                        </button>
                    )}

                </div>
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={skip} onNext={onNext} showNext={showNext} showSkip={!showSkip} />
        </div>
    );
}


