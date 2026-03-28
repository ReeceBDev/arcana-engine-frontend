import './MainPageVertical.css';
import { proxyImageUrl } from '../utilities/proxy-image-url';
import { useEffect, useRef, useState } from 'react';
import SpinningCard from '../components/SpinningCard.tsx'
import Spacer from '../../assets/iconography/spacer.svg?react';
import type { PageIdentity } from '../../types/page-identity.ts';
import type { DeckConfig } from '../constants/page-orientations.tsx';

interface Props {
    navigate: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
    resetWorkflow: () => void;
}

export default function MainMenuVertical({ navigate, resetWorkflow }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(300);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            setContainerHeight(entries[0].contentRect.height);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="main-page-vertical">
            <img
                src={proxyImageUrl(
                    'https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png',
                    window.innerWidth,
                    window.innerHeight
                )}
                className="background-image"
            />
            <div className="header-text-container">
                <div className="crowley-container">
                    <p className="text-crowley">Alastair Crowley's</p>
                    <div className="right-spacer" />
                </div>
                <p className="text-title">Thoth Tarot</p>
                <p className="text-slogan">Find the colour of your soul...</p>
            </div>
            <div className='spinning-card-constraint'>
                <div ref={containerRef} className="spinning-card-container">
                    <SpinningCard height={containerHeight} />
                </div>
            </div>
            <div className="footer-segment">
                <div className="nav-control-container">
                    <button className="begin-button" onClick={() => { resetWorkflow(); navigate('card-finder-introduction-part-1') }}>~ Begin ~</button>
                    <ColouredSplit colour={'red'} />
                    <button className="deck-viewer-button" onClick={() => navigate('deck-viewer')}>Deck Viewer</button>
                    <ColouredSplit colour={'blue'} />
                    <button onClick={() => navigate('card-finder-introduction-part-1')}>Find your Cards</button>
                    <ColouredSplit colour={'yellow'} />
                    <button className="calendar-button" onClick={() => navigate('calendar')}>Calendar</button>
                    <ColouredSplit colour={'green'} />
                    <button className="faq-button" onClick={() => navigate('faq')}>FAQ</button>
                </div>
            </div>
        </div>
    )
}

function ColouredSplit({ colour }: { colour: string }) {
    return (
        <Spacer className="coloured-split" style={{ color: colour }} />
    )
}