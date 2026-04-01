import './DateSelectorHorizontal.css';
import { useState } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import hermesTrismegistus from 'url:../../../../assets/images/hermesTrismegistus.webp';
import { handleDateInput, handleKeyDown } from '../../../utilities/dateInputHandler';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

export default function DateSelectorHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
        <div className="date-selector-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <img src={hermesTrismegistus} className="header-image" />
                <div className="content">

                    <p className="date-prompt">Enter your Date of Birth:</p>
                    <input
                        type="text"
                        className="date-input"
                        inputMode="numeric"
                        onChange={e => handleDateInput(e, setShowConfirmation, setErrorMessage)}
                        onKeyDown={handleKeyDown}
                    />
                    <p className="date-format">DD / MM / YYYY</p>

                    {errorMessage && (
                        <p className="date-error">{errorMessage}</p>
                    )}

                    {showConfirmation && (
                        <button className="continue-button" onClick={onNext}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={hermesTrismegistus} className="header-image" />
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={true} skipLabel="Skip for now..." />
        </div>
    );
}


