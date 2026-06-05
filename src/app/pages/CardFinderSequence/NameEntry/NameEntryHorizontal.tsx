import './NameEntryHorizontal.css';
import { useState, useRef } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import mercury from 'url:../../../../assets/images/mercury.webp';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

export default function NameEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (name: string) => void;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const name = inputRef.current?.value.trim() ?? '';
        if (name.length > 0) {
            onSubmit?.(name);
        } else {
            onNext();
        }
    };

    return (
        <div className="name-entry-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">
                    <p className="name-prompt">Enter your Full Name.</p>
                    <input
                        ref={inputRef}
                        type="text"
                        className="name-input"
                        autoComplete="name"
                        onChange={e => {
                            setErrorMessage(null);
                            setShowConfirmation(e.target.value.trim().length > 0);
                        }}
                    />
                    <p className="name-format">First, Middle, etc. Last ~ Exclude titles.</p>

                    {errorMessage && (
                        <p className="name-error">{errorMessage}</p>
                    )}

                    {showConfirmation && (
                        <button className="continue-button" onClick={handleSubmit}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={mercury} className="bottom-image" />
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}
