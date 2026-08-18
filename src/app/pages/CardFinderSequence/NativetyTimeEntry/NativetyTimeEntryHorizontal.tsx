import './NativetyTimeEntryHorizontal.css';
import { useState, useRef } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import ouroboros from 'url:../../../../assets/images/ouroboros.webp';
import { handleKeyDown, handleTimeInput } from '../../../utilities/dateInputHandler';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';

export default function NativetyTimeEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit, cuspMode = undefined }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (time: string) => void;
    /** Cusp deviation mode: the birth date falls near a zodiacal change, so an
     *  exact time is REQUIRED. Shows the backend's explanation on mount and
     *  blocks both Skip and the workflow Next — the only ways onward are a
     *  valid time or the back button. */
    cuspMode?: { message: string | null };
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cuspNoticeOpen, setCuspNoticeOpen] = useState(cuspMode != null);
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
            <BottomNavBarHorizontal
                onBack={onBack}
                onSkip={onSkip}
                onNext={onNext}
                showNext={cuspMode ? false : showNext}
                showSkip={cuspMode ? false : showSkip}
                skipLabel="Skip for now..."
            />
            {cuspMode && cuspNoticeOpen && (
                <>
                    <div className="cusp-notice-backdrop" onClick={() => setCuspNoticeOpen(false)} />
                    <div className="cusp-notice-dialog">
                        <p className="cusp-notice-title">Birth time required</p>
                        <div className="cusp-notice-divider" />
                        <p className="cusp-notice-message">
                            {cuspMode.message ??
                                'Your date of birth falls near the cusp of a zodiacal change, so an exact birth time is needed for an accurate reading.'}
                        </p>
                        <button className="cusp-notice-ok" onClick={() => setCuspNoticeOpen(false)}>OK</button>
                    </div>
                </>
            )}
        </div>
    );
}
