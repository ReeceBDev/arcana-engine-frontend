import './App.css'
import { useState } from 'react';
import CardCarousel from '../components/CardCarousel/CardCarousel';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import CardViewerCarouselHorizontal from './CardViewerCarouselHorizontal';

type Page = 'home' | 'vertical' | 'horizontal';

function App() {
  Fullscreen.activateImmersiveMode();
  const [page, setPage] = useState<Page>('home');

  if (page === 'vertical') return <CardViewerCarouselVertical  startingIndex={1} onBack={() => setPage('home')} />;
  if (page === 'horizontal') return <CardViewerCarouselHorizontal startingIndex={6} onBack={() => setPage('home')} />;
  
  return (
    <>
      <div>
        <CardCarousel cardHeight={150} cardWidth={100} cardGapInPx={0} />
        <button onClick={() => setPage('vertical')}>Card Viewer — Vertical</button>
        <button onClick={() => setPage('horizontal')}>Card Viewer — Horizontal</button>
      </div>
    </>
  )
}

export default App;