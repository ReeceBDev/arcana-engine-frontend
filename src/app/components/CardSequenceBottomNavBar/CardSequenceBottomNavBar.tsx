import './CardSequenceBottomNavBar.css';
import arrow from 'url:../../../assets/images/arrow.webp';

export type BottomNavBarProps = {
    onBack?: () => void;
    onSkip: () => void;
    showSkip: boolean;
    onNext: () => void;
    showNext: boolean;
    skipLabel?: string;
};

function CardSequenceBottomNavBar({ orientation, onBack, onSkip, showSkip, onNext, showNext, skipLabel = 'Skip' }:
    BottomNavBarProps & { orientation: 'vertical' | 'horizontal' }) {
    return (
        <div className={`bottom-nav-bar ${orientation}`}>
            {!showSkip && onBack && (
                <button className="back-button" onClick={onBack}>
                    <img src={arrow} style={{ transform: 'rotate(180deg)' }} />
                </button>
            )}
            {showSkip && (
                <button className="skip-button" onClick={onSkip}>
                    {skipLabel}
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

export function BottomNavBarVertical(props: BottomNavBarProps) {
    return <CardSequenceBottomNavBar {...props} orientation="vertical" />;
}

export function BottomNavBarHorizontal(props: BottomNavBarProps) {
    return <CardSequenceBottomNavBar {...props} orientation="horizontal" />;
}

export { TopNavBarVertical, TopNavBarHorizontal } from './TopNavBar';