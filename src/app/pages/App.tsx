import './App.css'
import { useState } from 'react';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import CardViewerCarouselHorizontal from './CardViewerCarouselHorizontal';
import MainPageVertical from './MainPageVertical';

type Page = 'home' | 'vertical' | 'horizontal';

function App() {
  Fullscreen.activateImmersiveMode();
  const [page, setPage] = useState<Page>('home');

  if (page === 'vertical') return <CardViewerCarouselVertical startingIndex={1} onBack={() => setPage('home')} />;
  if (page === 'horizontal') return <CardViewerCarouselHorizontal startingIndex={6} onBack={() => setPage('home')} />;

  return (
    <MainPageVertical />
  )
}

export default App;