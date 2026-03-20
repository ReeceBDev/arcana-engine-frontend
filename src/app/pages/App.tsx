import './App.css'
import { useState } from 'react';
import CardCarousel from '../components/CardCarousel/CardCarousel';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';
import { Fullscreen } from '@boengli/capacitor-fullscreen';

type Page = 'home' | 'vertical' | 'horizontal';

function App() {
  Fullscreen.activateImmersiveMode();
  const [page, setPage] = useState<Page>('home');

  if (page === 'vertical') return <CardViewerCarouselVertical onBack={() => setPage('home')} />;

  return (
    <>
      <div>
        <CardCarousel cardHeight={150} cardWidth={100} cardGapInPx={0} />
        <button onClick={() => setPage('vertical')}>Card Viewer — Vertical</button>
      </div>
    </>
  )
}

export default App;