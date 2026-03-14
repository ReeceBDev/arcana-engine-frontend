import './App.css'
import { useState } from 'react';
import CardCarouselSmall from '../components/CardCarousel/CardCarouselSmall';
import CardViewerCarouselVertical from './CardViewerCarouselVertical';

type Page = 'home' | 'vertical' | 'horizontal';

function App() {
  const [page, setPage] = useState<Page>('home');

  if (page === 'vertical') return <CardViewerCarouselVertical onBack={() => setPage('home')} />;

  return (
    <>
      <div>
        <CardCarouselSmall cardHeight={150} cardWidth={100} />
        <button onClick={() => setPage('vertical')}>Card Viewer — Vertical</button>
      </div>
    </>
  )
}

export default App;