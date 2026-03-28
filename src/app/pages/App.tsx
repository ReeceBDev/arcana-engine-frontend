import './App.css'
import { useEffect, useState } from 'react';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import orientedPage, { getOrientationType } from '../constants/page-orientations';
import type { DeckConfig, PageProps } from '../constants/page-orientations';
import type { PageIdentity } from '../../types/page-identity';
import type { Orientation } from '../../types/orientation';
import type { WorkflowConfig } from '../../types/workflow-config';

function App() {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [page, setPage] = useState<PageIdentity>('main-menu');
  const [deckConfig, setDeckConfig] = useState<DeckConfig>({ currentIndex: 0 });
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({ currentIteration: 0, lastIteration: 0 });

  console.debug('workflowConfig', workflowConfig);

  const navigate = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigate called!', base);
    if (config) setDeckConfig(c => ({ ...c, ...config }));
    setPage(base);
  };

  const navigateNext = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigateNext called!', base);
    setWorkflowConfig(c => ({ ...c, currentIteration: c.currentIteration + 1 }));
    navigate(base, config);
  }; 

  const navigateBack = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigateBack called!', base);
    setWorkflowConfig(c => ({ lastIteration: c.currentIteration, currentIteration: c.currentIteration - 1 }));
    navigate(base, config);
  };

  const onIndexChange = (index: number) => setDeckConfig(c => ({ ...c, currentIndex: index }));
  const resetWorkflow = () => setWorkflowConfig({ currentIteration: 0, lastIteration: 0 });

  const props: PageProps = {
    navigate,
    navigateNext,
    navigateBack,
    resetWorkflow,
    deckConfig,
    onIndexChange,
    workflowConfig,
  };

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

  const CurrentPage = orientedPage[page][orientation];
  return <CurrentPage key={page} {...props} />;
}

export default App;