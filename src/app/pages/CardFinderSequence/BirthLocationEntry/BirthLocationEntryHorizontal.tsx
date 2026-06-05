import './BirthLocationEntryHorizontal.css';
import { useState } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import cerebus from 'url:../../../../assets/images/cerebus.webp';
import { handleDateInput, handleKeyDown } from '../../../utilities/dateInputHandler';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

export default function BirthLocationEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false }: {
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
        <div className="birth-location-entry-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">

                    <p className="input-prompt">Where were you born?</p>
                    <input
                        type="text"
                        className="birth-input"
                        inputMode="numeric"
                        onChange={e => handleDateInput(e, setShowConfirmation, setErrorMessage)}
                        onKeyDown={handleKeyDown}
                    />
                    <p className="instructions">Search for your Birthplace...</p>

                    {errorMessage && (
                        <p className="input-error">{errorMessage}</p>
                    )}

                    {showConfirmation && (
                        <button className="continue-button" onClick={onNext}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={cerebus} className="bottom-image" />
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}
