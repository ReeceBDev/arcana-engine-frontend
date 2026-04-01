import './TopNavBar.css';

export function TopNavBarVertical({ onHome }: { onHome: () => void }) {
    return (
        <div className="top-nav-bar vertical">
            <button className="home-button" onClick={onHome}>
                <p className="home-title">Go Home</p>
            </button>
        </div>
    );
}

export function TopNavBarHorizontal({ onHome }: { onHome: () => void }) {
    return (
        <div className="top-nav-bar horizontal">
            <button className="home-button" onClick={onHome}>
                <p className="home-title">Go Home</p>
            </button>
        </div>
    );
}
