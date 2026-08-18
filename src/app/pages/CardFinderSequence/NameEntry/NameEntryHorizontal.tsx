import './NameEntryHorizontal.css';
import { useState, useRef } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import mercury from 'url:../../../../assets/images/mercury.webp';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';
import { ArcanaPill } from '../../../components/ArcanaPill/ArcanaPill';

/** Practitioner-facing instructions shown when the backend rejects a name as
 *  unconvertible to Hebrew gematria (e.g. an unresolved letter 'C'). The backend's
 *  own error text is API guidance, so the app explains the rule itself. */
const NAME_REJECTION_TITLE = "This name can't be read yet.";
const NAME_REJECTION_BODY = [
    "The letter C can't be converted to Hebrew on its own — it needs to be changed to the letter that matches how it sounds:",
    "A hard C, like the “kuh” in Cat, is written as K.",
    "A soft C, like the “sss” in Spice, is written as Z.",
    "Never change a C that's followed by an H — CH stays as it is.",
    "So “Clarice” (klah-rhys) is entered as Klarize, but “Charlie” stays Charlie.",
    "Please re-enter your name using these letters, then submit again.",
];

export default function NameEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit, rejectionNotice = false, onRejectionDismiss }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (name: string) => void;
    /** True when the last submit was rejected by the backend — shows the guidance popup. */
    rejectionNotice?: boolean;
    /** Dismisses the rejection popup. */
    onRejectionDismiss?: () => void;
}) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showRules, setShowRules] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    /** The guidance dialog is shown either proactively (pill click) or after a
     *  backend rejection; both paths share one dismiss handler. */
    const dialogOpen = rejectionNotice || showRules;
    const handleDismissRules = () => {
        setShowRules(false);
        onRejectionDismiss?.();
    };

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
                <ArcanaPill
                    label="Letter C Rules"
                    isOpen={dialogOpen}
                    className="letter-c-rules-pill"
                    onClick={() => setShowRules(true)}
                />
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
            {dialogOpen && (
                <>
                    <div className="name-reject-backdrop" onClick={handleDismissRules} />
                    <div className="name-reject-dialog">
                        <p className="name-reject-title">{NAME_REJECTION_TITLE}</p>
                        <div className="name-reject-divider" />
                        <div className="name-reject-body">
                            <p className="name-reject-line">{NAME_REJECTION_BODY[0]}</p>
                            <ul className="name-reject-rules">
                                <li>{NAME_REJECTION_BODY[1]}</li>
                                <li>{NAME_REJECTION_BODY[2]}</li>
                                <li>{NAME_REJECTION_BODY[3]}</li>
                            </ul>
                            <p className="name-reject-line">{NAME_REJECTION_BODY[4]}</p>
                            <p className="name-reject-line">{NAME_REJECTION_BODY[5]}</p>
                        </div>
                        <button className="name-reject-ok" onClick={handleDismissRules}>OK</button>
                    </div>
                </>
            )}
        </div>
    );
}
