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
import type { CardData } from '../../types/card-data';
import { fetchBirthdateReading, fetchNameReading } from '../api';
import type { Practitioner } from '../../types/practitioner';
import {
  loadPractitioners,
  savePractitioners,
  createPractitioner,
  updatePractitioner,
  deduplicatePractitioners,
  hasNewPractitioners as checkHasNew,
  setHasNewPractitioners as persistHasNew,
} from '../utilities/practitioner-storage';

function App() {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [page, setPage] = useState<PageIdentity>('main-menu');
  const [deckConfig, setDeckConfig] = useState<DeckConfig>({ currentIndex: 0 });
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({ currentIteration: 0, lastIteration: 0 });
  const [birthDate, setBirthDate] = useState('');
  const [userName, setUserName] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [birthdateCards, setBirthdateCards] = useState<CardData[]>([]);
  const [nameCards, setNameCards] = useState<CardData[]>([]);
  const [growthCards, setGrowthCards] = useState<CardData[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>(() => loadPractitioners());
  const [currentPractitionerId, setCurrentPractitionerId] = useState<string | null>(null);
  const [newPractitioners, setNewPractitioners] = useState(() => checkHasNew());

  console.debug('workflowConfig', workflowConfig);

  const navigate = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigate called!', base);
    if (base === 'practitioners-list') {
      const deduped = deduplicatePractitioners();
      setPractitioners(deduped);
      setNewPractitioners(false);
      persistHasNew(false);
    }
    if (config) setDeckConfig(c => ({ ...c, ...config }));
    setPage(base);
  };

  const navigateNext = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigateNext called!', base);
    setWorkflowConfig(c => {
      const nextIteration = c.currentIteration + 1;
      return {
        currentIteration: nextIteration,
        lastIteration: Math.max(c.lastIteration, nextIteration),
      };
    });
    navigate(base, config);
  };

  const navigateBack = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigateBack called!', base);
    setWorkflowConfig(c => ({
      currentIteration: Math.max(0, c.currentIteration - 1),
      lastIteration: c.lastIteration,
    }));
    navigate(base, config);
  };

  const onIndexChange = (index: number) => setDeckConfig(c => ({ ...c, currentIndex: index }));
  const resetWorkflow = () => {
    setWorkflowConfig({ currentIteration: 0, lastIteration: 0 });
    setBirthDate('');
    setUserName('');
    setBirthdateCards([]);
    setNameCards([]);
    setGrowthCards([]);
    setBirthTime('');
    setBirthLocation('');
    const p = createPractitioner();
    setCurrentPractitionerId(p.id);
    setPractitioners(loadPractitioners());
    setNewPractitioners(true);
  };

  const handleBirthDateSubmit = async (date: string) => {
    setBirthDate(date);
    if (currentPractitionerId) {
      updatePractitioner(currentPractitionerId, { birthDate: date });
      setPractitioners(loadPractitioners());
    }
    try {
      const data = await fetchBirthdateReading(date);
      console.debug('Birthdate reading response:', data);
      setBirthdateCards([
        data.personalityCard,
        data.characterCard,
        data.personalCourtCard,
        data.personalDecanCard,
        data.personalZodiacalCard
      ].filter((c): c is CardData => c != null));
    } catch (e) {
      console.error('Failed to fetch birthdate reading:', e);
    }
    navigateNext('birthdate-card-stack');
  };

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    if (currentPractitionerId) {
      updatePractitioner(currentPractitionerId, { name });
      setPractitioners(loadPractitioners());
    }
    try {
      const data = await fetchNameReading(birthDate, name);
      console.debug('Name reading response:', data);
      setNameCards(data.cards ?? []);
    } catch (e) {
      console.error('Failed to fetch name reading:', e);
    }
    navigateNext('name-card-stack');
  };

  const handlePractitionerSelect = async (practitioner: Practitioner) => {
    console.debug('[Practitioners] Selected practitioner:', practitioner);
    setCurrentPractitionerId(practitioner.id);
    setBirthDate(practitioner.birthDate ?? '');
    setUserName(practitioner.name ?? '');
    setBirthTime(practitioner.birthTime ?? '');
    setBirthLocation(practitioner.birthLocation ?? '');
    setBirthdateCards([]);
    setNameCards([]);
    setGrowthCards([]);

    if (practitioner.birthDate) {
      try {
        const data = await fetchBirthdateReading(practitioner.birthDate);
        console.debug('[Practitioners] Fetched birthdate cards:', data);
        setBirthdateCards([
          data.personalityCard,
          data.characterCard,
          data.personalCourtCard,
          data.personalDecanCard,
          data.personalZodiacalCard,
        ].filter((c): c is CardData => c != null));
      } catch (e) {
        console.error('[Practitioners] Failed to fetch birthdate reading:', e);
      }

      if (practitioner.name) {
        try {
          const data = await fetchNameReading(practitioner.birthDate, practitioner.name);
          console.debug('[Practitioners] Fetched name cards:', data);
          setNameCards(data.cards ?? []);
        } catch (e) {
          console.error('[Practitioners] Failed to fetch name reading:', e);
        }
      }
    }

    navigate('practitioner-view');
  };

  const handleClearAllPractitioners = () => {
    console.debug('[Practitioners] Clearing all practitioner data');
    savePractitioners([]);
    setPractitioners([]);
    persistHasNew(false);
    setNewPractitioners(false);
  };

  const props: PageProps = {
    navigate,
    navigateNext,
    navigateBack,
    resetWorkflow,
    deckConfig,
    onIndexChange,
    workflowConfig,
    birthDate,
    userName,
    birthdateCards,
    nameCards,
    growthCards,
    onBirthDateSubmit: handleBirthDateSubmit,
    onNameSubmit: handleNameSubmit,
    practitioners,
    hasNewPractitioners: newPractitioners,
    onPractitionerSelect: handlePractitionerSelect,
    onClearAllPractitioners: handleClearAllPractitioners,
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