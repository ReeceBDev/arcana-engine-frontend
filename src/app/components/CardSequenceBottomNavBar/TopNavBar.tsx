import './TopNavBar.css';

/** Optional secondary action rendered left of "Go Home" (e.g. "Back to Practitioner View"). */
type TopNavBarProps = {
    onHome: () => void;
    onBack?: () => void;
    backLabel?: string;
};

export function TopNavBarVertical({ onHome, onBack, backLabel = 'Back' }: TopNavBarProps) {
    return (
        <div className="top-nav-bar vertical">
            {onBack && (
                <button className="back-button" onClick={onBack}>
                    <p className="back-title">{backLabel}</p>
                </button>
            )}
            <button className="home-button" onClick={onHome}>
                <p className="home-title">Go Home</p>
            </button>
        </div>
    );
}

export function TopNavBarHorizontal({ onHome, onBack, backLabel = 'Back' }: TopNavBarProps) {
    return (
        <div className="top-nav-bar horizontal">
            {onBack && (
                <button className="back-button" onClick={onBack}>
                    <p className="back-title">{backLabel}</p>
                </button>
            )}
            <button className="home-button" onClick={onHome}>
                <p className="home-title">Go Home</p>
            </button>
        </div>
    );
}
