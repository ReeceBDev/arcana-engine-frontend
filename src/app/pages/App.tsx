import './App.css'
import { useEffect, useState } from 'react';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import CardViewerCarouselHorizontal from './CardViewerCarouselHorizontal';
import MainPageVertical from './MainPageVertical';
import { Capacitor } from '@capacitor/core';

type Page = 'home' | 'vertical' | 'horizontal';

function App() {
useEffect(() => {
    if (Capacitor.isNativePlatform()) {
        Fullscreen.activateImmersiveMode();
    }
}, []);

  const [page, setPage] = useState<Page>('home');

  if (page === 'vertical') return <CardViewerCarouselVertical startingIndex={1} onBack={() => setPage('home')} />;
  if (page === 'horizontal') return <CardViewerCarouselHorizontal startingIndex={6} onBack={() => setPage('home')} />;

  return (
    <MainPageVertical />
  )
}

export default App;