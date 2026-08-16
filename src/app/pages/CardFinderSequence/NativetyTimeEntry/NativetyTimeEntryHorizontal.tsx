import './NativetyTimeEntryHorizontal.css';
import { useState, useRef } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import ouroboros from 'url:../../../../assets/images/ouroboros.webp';
import { handleKeyDown, handleTimeInput } from '../../../utilities/dateInputHandler';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

export default function NativetyTimeEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (time: string) => void;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        onSubmit?.(inputRef.current?.value ?? '');
        onNext();
    };

    return (
        <div className="nativety-time-entry-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">

                    <p className="time-prompt">What time were you born?</p>
                    <input
                        ref={inputRef}
                        type="text"
                        className="time-input"
                        inputMode="numeric"
                        onChange={e => handleTimeInput(e, setShowConfirmation, setErrorMessage)}
                        onKeyDown={handleKeyDown}
                    />
                    <p className="time-format">HH : MM</p>

                    {errorMessage && (
                        <p className="time-error">{errorMessage}</p>
                    )}

                    {showConfirmation && (
                        <button className="continue-button" onClick={handleSubmit}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={ouroboros} className="bottom-image" />
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}
