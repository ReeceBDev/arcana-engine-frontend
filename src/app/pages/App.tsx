import './App.css'
import { useEffect, useMemo, useState } from 'react';
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
import { buildGrowthPreviewCards } from '../utilities/growth-cards';
import type { City } from '../utilities/citySearch';
import { formatCityLabel, offsetMinutesAt, parseBirthInputs, toIso8601 } from '../utilities/citySearch';
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
  /** Birthplace coordinates + IANA timezone resolved from the selected city (used for the full reading). */
  const [birthCoords, setBirthCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [birthTimezone, setBirthTimezone] = useState<string | null>(null);
  /** Resolved ISO-8601 birth-datetime with offset (e.g. 2000-05-15T13:30:00+01:00), ready for fetchFullReading. */
  const [birthIso, setBirthIso] = useState<string | null>(null);
  const [birthdateCards, setBirthdateCards] = useState<CardData[]>([]);
  const [nameCards, setNameCards] = useState<CardData[]>([]);
  // Growth cards are a pure function of birthDate (one per calendar year, via
  // the numerology rule in growth-cards.ts), so derive them rather than store
  // them. PractitionerView shows the current year's card with a few prior-year
  // fillers fanned behind it for the splay animation.
  const growthCards = useMemo(() => buildGrowthPreviewCards(birthDate), [birthDate]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>(() => loadPractitioners());
  const [currentPractitionerId, setCurrentPractitionerId] = useState<string | null>(null);
  const [newPractitioners, setNewPractitioners] = useState(() => checkHasNew());
  const [returnDestination, setReturnDestination] = useState<PageIdentity | null>(null);
  /** Card currently open in the Inspect screen (numeric identity), or null. */
  const [inspectCardId, setInspectCardId] = useState<number | null>(null);
  /** Where the Inspect screen should return to (page + deck config to restore). */
  const [inspectReturn, setInspectReturn] = useState<{ page: PageIdentity; config?: Partial<DeckConfig> } | null>(null);

  console.debug('workflowConfig', workflowConfig);

  const navigate = (base: PageIdentity, config?: Partial<DeckConfig>) => {
    console.debug('navigate called!', base);
    setReturnDestination(null);
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

  // Navigate away from the practitioner dashboard into an edit/stack page,
  // remembering the dashboard so the destination page's back button can
  // return to it instead of jumping into the card-finder workflow.
  const navigateFromPractitioner = (page: PageIdentity) => {
    navigate(page);
    setReturnDestination('practitioner-view');
  };

  // Back handler for edit/stack pages: if the user arrived from the
  // practitioner dashboard, return there; otherwise use the normal workflow
  // back navigation.
  const handleBackWithReturn = (fallback: PageIdentity, config?: Partial<DeckConfig>) => {
    if (returnDestination) {
      const dest = returnDestination;
      setReturnDestination(null);
      setPage(dest);
      if (config) setDeckConfig(c => ({ ...c, ...config }));
    } else {
      navigateBack(fallback, config);
    }
  };

  // Open the Inspect screen for a card, remembering where to return to. The
  // deck-viewer passes its currentIndex/cardIDs so the carousel resumes on the
  // same card; the card stacks simply resume the same stack page.
  const openInspect = (cardId: number, returnPage: PageIdentity, returnConfig?: Partial<DeckConfig>) => {
    setInspectCardId(cardId);
    setInspectReturn({ page: returnPage, config: returnConfig });
    setPage('inspect');
  };

  // Close the Inspect screen and return to the page that opened it, restoring
  // any saved deck config (so the deck-viewer lands back on the same card).
  const closeInspect = () => {
    const ret = inspectReturn;
    setInspectCardId(null);
    setInspectReturn(null);
    if (ret) {
      if (ret.config) setDeckConfig(c => ({ ...c, ...ret.config }));
      setPage(ret.page);
    } else {
      setPage('main-menu');
    }
  };

  // Move the Inspect screen to another card in the deck chain (prev/next arrows).
  const inspectCardChange = (cardId: number) => setInspectCardId(cardId);

  const onIndexChange = (index: number) => setDeckConfig(c => ({ ...c, currentIndex: index }));
  const resetWorkflow = () => {
    setWorkflowConfig({ currentIteration: 0, lastIteration: 0 });
    setBirthDate('');
    setUserName('');
    setBirthdateCards([]);
    setNameCards([]);
    setBirthTime('');
    setBirthLocation('');
    setBirthCoords(null);
    setBirthTimezone(null);
    setBirthIso(null);
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

  const handleTimeSubmit = (time: string) => {
    setBirthTime(time);
    if (currentPractitionerId) {
      updatePractitioner(currentPractitionerId, { birthTime: time });
      setPractitioners(loadPractitioners());
    }
  };

  const handleLocationSubmit = (city: City) => {
    const label = formatCityLabel(city);
    setBirthLocation(label);
    setBirthCoords({ lat: city.lat, lng: city.lng });
    setBirthTimezone(city.timezone);
    if (currentPractitionerId) {
      updatePractitioner(currentPractitionerId, {
        birthLocation: label,
        birthLatitude: city.lat,
        birthLongitude: city.lng,
        birthTimezone: city.timezone,
      });
      setPractitioners(loadPractitioners());
    }

    // Resolve the historical DST-aware offset for the birth instant and fold
    // date + time + offset into a single ISO-8601 string ready for the API.
    // birthDate/birthTime are already in state by now (workflow order: date -> name -> time -> location).
    const inputs = parseBirthInputs(birthDate, birthTime);
    if (inputs) {
      const offset = offsetMinutesAt(city.timezone, inputs.y, inputs.m, inputs.d, inputs.h, inputs.min);
      const iso = toIso8601(birthDate, birthTime, offset);
      setBirthIso(iso);
      console.debug('Birth location resolved:', { label, coords: { lat: city.lat, lng: city.lng }, timezone: city.timezone, offsetMinutes: offset, iso });
    } else {
      console.debug('Birth location resolved but birthDate missing/unparseable; ISO deferred.');
    }

    // TODO(out of scope for now): call fetchFullReading(birthIso, userName, city.lat, city.lng) once the backend endpoint is live.
  };

  const handlePractitionerSelect = async (practitioner: Practitioner) => {
    console.debug('[Practitioners] Selected practitioner:', practitioner);
    setCurrentPractitionerId(practitioner.id);
    setBirthDate(practitioner.birthDate ?? '');
    setUserName(practitioner.name ?? '');
    setBirthTime(practitioner.birthTime ?? '');
    setBirthLocation(practitioner.birthLocation ?? '');
    setBirthCoords(practitioner.birthLatitude != null && practitioner.birthLongitude != null
      ? { lat: practitioner.birthLatitude, lng: practitioner.birthLongitude }
      : null);
    setBirthTimezone(practitioner.birthTimezone ?? null);
    setBirthIso(null);
    setBirthdateCards([]);
    setNameCards([]);

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
    navigateFromPractitioner,
    handleBackWithReturn,
    resetWorkflow,
    deckConfig,
    onIndexChange,
    inspectCardId,
    onInspect: openInspect,
    closeInspect,
    onInspectCardChange: inspectCardChange,
    workflowConfig,
    birthDate,
    userName,
    birthTime,
    birthLocation,
    birthCoords,
    birthTimezone,
    birthIso,
    birthdateCards,
    nameCards,
    growthCards,
    onBirthDateSubmit: handleBirthDateSubmit,
    onNameSubmit: handleNameSubmit,
    onTimeSubmit: handleTimeSubmit,
    onLocationSubmit: handleLocationSubmit,
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