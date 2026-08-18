import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react';
import { Fullscreen } from '@boengli/capacitor-fullscreen';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import orientedPage, { getOrientationType } from '../constants/page-orientations';
import type { DeckConfig, PageProps } from '../constants/page-orientations';
import type { PageIdentity } from '../../types/page-identity';
import type { Orientation } from '../../types/orientation';
import type { WorkflowConfig } from '../../types/workflow-config';
import type { CardData } from '../../types/card-data';
import { fetchBirthdateReading, fetchFullReading, fetchNameReading, NameRejectionError } from '../api';
import type { FullReading, FullReadingStatus } from '../utilities/astro/natal';
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
  /** Natal houses + planet correspondences from POST /reading/full (whole-sign,
   *  from the Ascendant). Null until the full nativity has been fetched. */
  const [fullReading, setFullReading] = useState<FullReading | null>(null);
  const [fullReadingStatus, setFullReadingStatus] = useState<FullReadingStatus>('idle');
  /** Backend guidance (invalidNameError) or transport error, shown verbatim. */
  const [fullReadingError, setFullReadingError] = useState<string | null>(null);
  /** True while the name-rejection guidance popup is shown on the name-entry page
   *  (the backend rejected the name as unconvertible to Hebrew gematria). */
  const [nameRejected, setNameRejected] = useState(false);
  /** Cusp flag mirrored from the practitioner record (like birthTime etc.): the
   *  birth date falls near a zodiacal change, so an exact birth time is required
   *  before zodiacal readings are accurate. */
  const [cuspWarning, setCuspWarning] = useState(false);
  const [cuspWarningMessage, setCuspWarningMessage] = useState<string | null>(null);
  /** Where the workflow should resume after the required birth time is supplied
   *  (the screen the cusp deviation interrupted). Transient navigation memory,
   *  same nature as returnDestination. */
  const [cuspReturnTarget, setCuspReturnTarget] = useState<PageIdentity | null>(null);
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
  //
  // Cusp gate: when the active practitioner's birth date was flagged as near a
  // zodiacal cusp and no birth time exists yet, reading destinations are
  // diverted through the time-entry screen first (with the destination
  // remembered) — including after closing the app and re-entering, since the
  // flag is persisted on the practitioner record.
  const navigateFromPractitioner = (page: PageIdentity) => {
    const requiresBirthTime = page === 'astrological-houses'
      || page === 'growth-card-carousel'
      || page === 'birthdate-card-stack'
      || page === 'name-card-stack';
    if (requiresBirthTime && cuspWarning && !birthTime) {
      setCuspReturnTarget(page);
      navigate('nativety-time-entry');
      setReturnDestination('practitioner-view');
      return;
    }
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
    setNameRejected(false);
    resetFullReading();
    setCuspWarning(false);
    setCuspWarningMessage(null);
    setCuspReturnTarget(null);
    const p = createPractitioner();
    setCurrentPractitionerId(p.id);
    setPractitioners(loadPractitioners());
    setNewPractitioners(true);
  };

  const handleBirthDateSubmit = async (date: string) => {
    setBirthDate(date);
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
      // Persist + mirror the cusp flag: near a zodiacal change the reading is
      // inaccurate without a birth time, so the workflow deviates through the
      // time-entry screen (blocking) before showing the cards.
      setCuspWarning(data.cuspWarning);
      setCuspWarningMessage(data.cuspWarningMessage);
      if (currentPractitionerId) {
        updatePractitioner(currentPractitionerId, {
          birthDate: date,
          cuspWarning: data.cuspWarning,
          cuspWarningMessage: data.cuspWarningMessage,
        });
        setPractitioners(loadPractitioners());
      }
      if (data.cuspWarning) {
        setCuspReturnTarget('birthdate-card-stack');
        navigateNext('nativety-time-entry');
      } else {
        setCuspReturnTarget(null);
        navigateNext('birthdate-card-stack');
      }
    } catch (e) {
      console.error('Failed to fetch birthdate reading:', e);
      navigateNext('birthdate-card-stack');
    }
  };

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    setNameRejected(false);
    if (currentPractitionerId) {
      updatePractitioner(currentPractitionerId, { name });
      setPractitioners(loadPractitioners());
    }
    try {
      const data = await fetchNameReading(birthDate, name);
      console.debug('Name reading response:', data);
      setNameCards(data.cards ?? []);
    } catch (e) {
      // The backend rejected the name as unconvertible to Hebrew gematria:
      // stay on the name-entry page and show the guidance popup instead of
      // navigating onto an empty name-card stack.
      if (e instanceof NameRejectionError) {
        console.warn('Name reading rejected:', e.backendMessage);
        setNameRejected(true);
        return;
      }
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

  // Called after a valid birth time is submitted while the cusp deviation is
  // active: resume the workflow at the screen the deviation interrupted.
  // navigateNext clears returnDestination, which is correct — each destination
  // page's own back handling already leads somewhere sensible.
  const handleCuspTimeFulfilled = () => {
    const dest = cuspReturnTarget ?? 'birthdate-card-stack';
    setCuspReturnTarget(null);
    navigateNext(dest);
  };

  /* Full natal reading (houses + planet correspondences). Fetched once per
   * completed nativity — at the end of the card-finder workflow and again on
   * practitioner re-select — and held in App state (deterministic per record,
   * so it is never persisted). The ref guards duplicate fetches of the same
   * birthIso+name+coords key while one is in flight or already loaded; it is
   * cleared on failure so the retry path can run the same request again. */
  const fullReadingFetchRef = useRef<{ key: string; pending: boolean } | null>(null);
  const lastFullReadingParamsRef = useRef<{ birthDate: string; iso: string; name: string; lat: number; lng: number } | null>(null);

  const resetFullReading = () => {
    fullReadingFetchRef.current = null;
    lastFullReadingParamsRef.current = null;
    setFullReading(null);
    setFullReadingStatus('idle');
    setFullReadingError(null);
  };

  const runFullReading = async (birthDate: string, iso: string, name: string, lat: number, lng: number) => {
    const key = `${birthDate}|${iso}|${name}|${lat}|${lng}`;
    if (fullReadingFetchRef.current?.key === key) return; // in flight or loaded
    fullReadingFetchRef.current = { key, pending: true };
    lastFullReadingParamsRef.current = { birthDate, iso, name, lat, lng };
    setFullReadingStatus('loading');
    setFullReadingError(null);
    try {
      const reading = await fetchFullReading(birthDate, iso, name, lat, lng);
      setFullReading(reading);
      setFullReadingStatus('ready');
      fullReadingFetchRef.current = { key, pending: false };
    } catch (e) {
      // Backend rejection (unresolved 'C' in the name) carries K/Z guidance;
      // show it verbatim. Other failures surface their transport message.
      fullReadingFetchRef.current = null;
      setFullReading(null);
      setFullReadingStatus('error');
      const message = e instanceof NameRejectionError
        ? e.backendMessage
        : e instanceof Error ? e.message : String(e);
      setFullReadingError(message);
      console.warn('Full reading failed:', e);
    }
  };

  const retryFullReading = () => {
    const p = lastFullReadingParamsRef.current;
    if (p) void runFullReading(p.birthDate, p.iso, p.name, p.lat, p.lng);
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
      // The nativity is complete — fetch the natal houses + correspondences
      // for the Astrological Houses screen and the PractitionerView panel.
      // (Name may be '' when name-entry was skipped; the backend's rejection
      // guidance then surfaces on the houses screen.)
      void runFullReading(birthDate, iso, userName, city.lat, city.lng);
    } else {
      console.debug('Birth location resolved but birthDate missing/unparseable; ISO deferred.');
    }
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
    setNameRejected(false);
    resetFullReading();
    // Rehydrate the cusp flag so the practitioner-view gate re-applies the
    // time-entry deviation for dates that were flagged but never given a time.
    setCuspWarning(practitioner.cuspWarning ?? false);
    setCuspWarningMessage(practitioner.cuspWarningMessage ?? null);
    setCuspReturnTarget(null);

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

    // Rehydrate the full natal reading: rebuild the ISO the same way the
    // workflow does (birthIso is not persisted, so it is recomputed from the
    // stored date/time/timezone), then fetch houses + correspondences when
    // the record carries the complete nativity the reading requires.
    if (practitioner.name && practitioner.birthDate && practitioner.birthTime
      && practitioner.birthTimezone
      && practitioner.birthLatitude != null && practitioner.birthLongitude != null) {
      const inputs = parseBirthInputs(practitioner.birthDate, practitioner.birthTime);
      if (inputs) {
        const offset = offsetMinutesAt(practitioner.birthTimezone, inputs.y, inputs.m, inputs.d, inputs.h, inputs.min);
        const iso = toIso8601(practitioner.birthDate, practitioner.birthTime, offset);
        setBirthIso(iso);
        console.debug('[Practitioners] Rebuilt birthIso from record:', iso);
        void runFullReading(practitioner.birthDate, iso, practitioner.name, practitioner.birthLatitude, practitioner.birthLongitude);
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
    fullReading,
    fullReadingStatus,
    fullReadingError,
    onRetryFullReading: retryFullReading,
    onBirthDateSubmit: handleBirthDateSubmit,
    onNameSubmit: handleNameSubmit,
    onTimeSubmit: handleTimeSubmit,
    onLocationSubmit: handleLocationSubmit,
    nameRejected,
    onNameRejectionDismiss: () => setNameRejected(false),
    cuspWarning,
    cuspWarningMessage,
    onCuspTimeFulfilled: handleCuspTimeFulfilled,
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