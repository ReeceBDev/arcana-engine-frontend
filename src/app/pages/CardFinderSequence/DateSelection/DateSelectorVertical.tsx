import './DateSelectorVertical.css';
import { useState, useRef } from "react";
import { BottomNavBarVertical } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import adam from 'url:../../../../assets/images/adam.webp';
import { handleDateInput, handleKeyDown } from '../../../utilities/dateInputHandler';
import { TopNavBarVertical } from '../../../components/CardSequenceBottomNavBar/TopNavBar';


export default function DateSelectorVertical({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit}: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (date: string) => void;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const raw = inputRef.current?.value.replace(/\D/g, '') ?? '';
        if (raw.length === 8) {
            const iso = `${raw.slice(4)}-${raw.slice(2, 4)}-${raw.slice(0, 2)}`;
            onSubmit?.(iso);
        } else {
            onNext();
        }
    };

    return (
        <div className="date-selector-vertical">
            <CardSequenceBackground />
            <div className="top-wrapper">
                <TopNavBarVertical onHome={onHome} />
                <div className="content">

                    <p className="date-prompt">Enter your Date of Birth:</p>
                    <input
                        ref={inputRef}
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
                        <button className="continue-button" onClick={handleSubmit}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={adam} className="bottom-image" />
            </div>
            <BottomNavBarVertical onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}


