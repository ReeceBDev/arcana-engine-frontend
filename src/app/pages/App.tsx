import './App.css'
import { useEffect, useState } from 'react';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import orientedPage, { getOrientationType } from '../constants/page-orientations';
import type { DeckConfig, PageProps } from '../constants/page-orientations';
import type { PageIdentity } from '../../types/page-identity';
import type { Orientation } from '../../types/orientation';

function App() {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [page, setPage] = useState<PageIdentity>('main-menu');
  const [deckConfig, setDeckConfig] = useState<DeckConfig>({ currentIndex: 0 });

  const navigate = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    if (config) setDeckConfig(c => ({ ...c, ...config }));
    setPage(base);
  };

  const onIndexChange = (index: number) => setDeckConfig(c => ({ ...c, currentIndex: index }));
  const props: PageProps = { navigate, deckConfig, onIndexChange };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) Fullscreen.activateImmersiveMode();

    const init = async () => {
      if (Capacitor.isNativePlatform()) {
        const { type } = await ScreenOrientation.orientation();
        setOrientation(getOrientationType(type));
        await ScreenOrientation.addListener('screenOrientationChange', ({ type }) => {
          setOrientation(getOrientationType(type));
        });
      } else {
        const mq = window.matchMedia('(orientation: landscape)');
        setOrientation(mq.matches ? 'landscape' : 'portrait');
        mq.addEventListener('change', (e: MediaQueryListEvent) =>
          setOrientation(e.matches ? 'landscape' : 'portrait')
        );
      }
    };

    init();

    return () => {
      if (Capacitor.isNativePlatform()) ScreenOrientation.removeAllListeners();
    };
  }, []);

  return orientedPage[page][orientation](props);
}

export default App;