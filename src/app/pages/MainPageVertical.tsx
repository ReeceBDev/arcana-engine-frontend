import './MainPageVertical.css';
import { proxyImageUrl } from '../utilities/proxy-image-url';
import { useEffect, useRef, useState } from 'react';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import CardViewerCarouselHorizontal from './CardViewerCarouselHorizontal';
import type { PageIdentity } from './../../types/page-identity.ts';
import SpinningCard from '../components/SpinningCard.tsx'

export default function MainMenuVertical() {
    Fullscreen.activateImmersiveMode();
    const [page, setPage] = useState<PageIdentity>('main-menu-vertical');
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


    if (page === 'deck-viewer-vertical') return <CardViewerCarouselVertical startingIndex={1} onBack={() => setPage('main-menu-vertical')} />;
    if (page === 'deck-viewer-horizontal') return <CardViewerCarouselHorizontal startingIndex={6} onBack={() => setPage('main-menu-vertical')} />;

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
                    <button className="begin-button" onClick={() => setPage('deck-viewer-vertical')}>~ Begin ~</button>
                    <ColouredSplit colour={'red'} />
                    <button className="find-cards-button" onClick={() => setPage('deck-viewer-horizontal')}>Find your Cards</button>
                    <ColouredSplit colour={'blue'} />
                    <button className="deck-viewer-button" onClick={() => setPage('deck-viewer')}>Deck Viewer</button>
                    <ColouredSplit colour={'yellow'} />
                    <button className="calendar-button" onClick={() => setPage('calendar-viewer')}>Calendar</button>
                    <ColouredSplit colour={'green'} />
                    <button className="faq-button" onClick={() => setPage('faq-page')}>FAQ</button>
                </div>
            </div>
        </div>
    )
}

function ColouredSplit({ colour }: { colour: string }) {
    return (
        <p className="coloured-split" style={{ color: colour }}>~</p>
    )
}