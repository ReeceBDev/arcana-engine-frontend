import './NativetyTimeEntryVertical.css';
import { useState } from "react";
import { BottomNavBarVertical } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import ouroboros from 'url:../../../../assets/images/ouroboros.webp';
import { handleKeyDown, handleTimeInput } from '../../../utilities/dateInputHandler';
import { TopNavBarVertical } from '../../../components/CardSequenceBottomNavBar/TopNavBar';


export default function NativetyTimeEntryVertical({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
        <div className="nativety-time-entry-vertical">
            <CardSequenceBackground />
            <div className="top-wrapper">
                <TopNavBarVertical onHome={onHome} />
                <div className="content">
                    <p className="time-prompt">What time were you born?</p>
                    <input
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
                        <button className="continue-button" onClick={onNext}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={ouroboros} className="bottom-image" />
            </div>
            <BottomNavBarVertical onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}
