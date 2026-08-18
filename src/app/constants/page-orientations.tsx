import { type JSX } from "react";
import type { PageIdentity } from "../../types/page-identity";
import { type ArcanaIdentityIndex, ArcanaIdentities } from "./arcana-identities";
import MainPageVertical from "../pages/MainPage/MainPageVertical";
import MainPageHorizontal from "../pages/MainPage/MainPageHorizontal";
import CardViewerCarouselVertical from "../pages/CardViewerCarousel/CardViewerCarouselVertical";
import CardViewerCarouselHorizontal from "../pages/CardViewerCarousel/CardViewerCarouselHorizontal";
import type { Orientation } from "../../types/orientation";
import IntroductionHorizontal from "../pages/CardFinderSequence/Introduction/IntroductionHorizontal";
import type { WorkflowConfig } from "../../types/workflow-config";
import type { CardData } from "../../types/card-data";
import IntroductionVertical from "../pages/CardFinderSequence/Introduction/IntroductionVertical";
import IntroductionPart2Horizontal from "../pages/CardFinderSequence/IntroductionPart2/IntroductionPart2Horizontal";
import IntroductionPart2Vertical from "../pages/CardFinderSequence/IntroductionPart2/IntroductionPart2Vertical";
import DateSelectorHorizontal from "../pages/CardFinderSequence/DateSelection/DateSelectorHorizontal";
import DateSelectorVertical from "../pages/CardFinderSequence/DateSelection/DateSelectorVertical";
import NameEntryHorizontal from "../pages/CardFinderSequence/NameEntry/NameEntryHorizontal";
import NameEntryVertical from "../pages/CardFinderSequence/NameEntry/NameEntryVertical";
import NativetyTimeEntryHorizontal from "../pages/CardFinderSequence/NativetyTimeEntry/NativetyTimeEntryHorizontal";
import NativetyTimeEntryVertical from "../pages/CardFinderSequence/NativetyTimeEntry/NativetyTimeEntryVertical";
import BirthLocationEntryHorizontal from "../pages/CardFinderSequence/BirthLocationEntry/BirthLocationEntryHorizontal";
import BirthLocationEntryVertical from "../pages/CardFinderSequence/BirthLocationEntry/BirthLocationEntryVertical";
import CardStackHorizontal from "../pages/CardStack/CardStackHorizontal";
import CardStackVertical from "../pages/CardStack/CardStackVertical";
import GrowthCardStackHorizontal from "../pages/GrowthCardStack/GrowthCardStackHorizontal";
import GrowthCardStackVertical from "../pages/GrowthCardStack/GrowthCardStackVertical";
import PractitionerViewHorizontal from "../pages/PractitionerView/PractitionerViewHorizontal";
import PractitionerViewVertical from "../pages/PractitionerView/PractitionerViewVertical";
import PractitionersListVertical from "../pages/PractitionersList/PractitionersListVertical";
import PractitionersListHorizontal from "../pages/PractitionersList/PractitionersListHorizontal";
import LiveAstrologyVertical from "../pages/LiveAstrology/LiveAstrologyVertical";
import LiveAstrologyHorizontal from "../pages/LiveAstrology/LiveAstrologyHorizontal";
import AstrologicalHousesVertical from "../pages/AstrologicalHouses/AstrologicalHousesVertical";
import AstrologicalHousesHorizontal from "../pages/AstrologicalHouses/AstrologicalHousesHorizontal";
import InspectVertical from "../pages/Inspect/InspectVertical";
import InspectHorizontal from "../pages/Inspect/InspectHorizontal";
import type { Practitioner } from "../../types/practitioner";
import type { City } from "../utilities/citySearch";

export function getOrientationType(type: string): Orientation {
  return type.startsWith('landscape') ? 'landscape' : 'portrait';
}

export type DeckConfig = {
  currentIndex: number;
  cardIDs?: ArcanaIdentityIndex[];
}

export type NavConfig = {
  showNext?: boolean;
}

export type PageProps = {
  navigate: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  navigateNext: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  navigateBack: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  navigateFromPractitioner: (page: PageIdentity) => void;
  handleBackWithReturn: (fallback: PageIdentity, config?: Partial<DeckConfig>) => void;
  resetWorkflow: () => void;
  deckConfig: DeckConfig;
  onIndexChange: (index: number) => void;
  /** Numeric identity of the card currently open in the Inspect screen. */
  inspectCardId: number | null;
  /** Open the Inspect screen for a card, remembering where to return to. */
  onInspect: (cardId: ArcanaIdentityIndex, returnPage: PageIdentity, returnConfig?: Partial<DeckConfig>) => void;
  /** Close the Inspect screen and return to the page that opened it. */
  closeInspect: () => void;
  /** Move the Inspect screen to another card in the deck chain (prev/next arrows). */
  onInspectCardChange: (cardId: number) => void;
  workflowConfig: WorkflowConfig;
  birthDate: string;
  userName: string;
  birthTime: string;
  birthLocation: string;
  /** Birthplace coordinates + IANA timezone resolved from the selected city. */
  birthCoords: { lat: number; lng: number } | null;
  birthTimezone: string | null;
  /** Resolved ISO-8601 birth-datetime with offset, ready for fetchFullReading. */
  birthIso: string | null;
  birthdateCards: CardData[];
  nameCards: CardData[];
  growthCards: CardData[];
  onBirthDateSubmit: (date: string) => void;
  onNameSubmit: (name: string) => void;
  onTimeSubmit: (time: string) => void;
  onLocationSubmit: (city: City) => void;
  /** True while the name-rejection guidance popup should show on the name-entry page. */
  nameRejected: boolean;
  /** Dismisses the name-rejection popup. */
  onNameRejectionDismiss: () => void;
  /** Cusp flag for the active practitioner (birth date near a zodiacal change). */
  cuspWarning: boolean;
  /** Backend-supplied explanation shown when the cusp time-entry deviation is active. */
  cuspWarningMessage: string | null;
  /** Resumes the workflow at the interrupted destination after a cusp-required time is submitted. */
  onCuspTimeFulfilled: () => void;
  practitioners: Practitioner[];
  hasNewPractitioners: boolean;
  onPractitionerSelect: (practitioner: Practitioner) => void;
  onClearAllPractitioners: () => void;
}

const orientedPage: Record<PageIdentity, { portrait: (props: PageProps) => JSX.Element; landscape: (props: PageProps) => JSX.Element }> = {
'main-menu': {
    portrait: (props) => <MainPageVertical navigate={props.navigate} resetWorkflow={props.resetWorkflow} hasNewPractitioners={props.hasNewPractitioners} />,
    landscape: (props) => <MainPageHorizontal navigate={props.navigate} resetWorkflow={props.resetWorkflow} hasNewPractitioners={props.hasNewPractitioners} />,
  },
  'deck-viewer': {
    portrait: (props) => <CardViewerCarouselVertical startingIndex={props.deckConfig.currentIndex} cardIDs={props.deckConfig.cardIDs} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} onInspect={(id, index, cardIDs) => props.onInspect(id, 'deck-viewer', { currentIndex: index, cardIDs })} />,
    landscape: (props) => <CardViewerCarouselHorizontal startingIndex={props.deckConfig.currentIndex} cardIDs={props.deckConfig.cardIDs} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} onInspect={(id, index, cardIDs) => props.onInspect(id, 'deck-viewer', { currentIndex: index, cardIDs })} />,
  },
  'calendar': {
    portrait: (props) => <CardViewerCarouselVertical {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
  },
  'astrological-houses': {
    portrait: (props) => <AstrologicalHousesVertical onHome={() => props.navigate('main-menu')} onBackToPractitioner={() => props.handleBackWithReturn('practitioner-view')} onInspect={(id) => props.onInspect(id, 'astrological-houses')} />,
    landscape: (props) => <AstrologicalHousesHorizontal onHome={() => props.navigate('main-menu')} onBackToPractitioner={() => props.handleBackWithReturn('practitioner-view')} onInspect={(id) => props.onInspect(id, 'astrological-houses')} />,
  },
  'practitioners-list': {
    portrait: (props) => <PractitionersListVertical practitioners={props.practitioners} onClose={() => props.navigate('main-menu')} onSelect={props.onPractitionerSelect} onClearAll={props.onClearAllPractitioners} />,
    landscape: (props) => <PractitionersListHorizontal practitioners={props.practitioners} onClose={() => props.navigate('main-menu')} onSelect={props.onPractitionerSelect} onClearAll={props.onClearAllPractitioners} />,
  },
  'live-astrology': {
    portrait: (props) => <LiveAstrologyVertical onHome={() => props.navigate('main-menu')} />,
    landscape: (props) => <LiveAstrologyHorizontal onHome={() => props.navigate('main-menu')} />,
  },
  'card-finder-introduction-part-1': {
    portrait: (props) => <IntroductionVertical onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('card-finder-introduction-part-2')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <IntroductionHorizontal onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('card-finder-introduction-part-2')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'card-finder-introduction-part-2': {
    portrait: (props) => <IntroductionPart2Vertical onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('date-selector')} onBack={() => props.navigateBack('card-finder-introduction-part-1')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <IntroductionPart2Horizontal onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('date-selector')} onBack={() => props.navigateBack('card-finder-introduction-part-1')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'date-selector': {
    portrait: (props) => <DateSelectorVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('name-entry')} onNext={() => props.navigateNext('birthdate-card-stack')} onSubmit={props.onBirthDateSubmit} onBack={() => props.handleBackWithReturn('card-finder-introduction-part-2')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <DateSelectorHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('name-entry')} onNext={() => props.navigateNext('birthdate-card-stack')} onSubmit={props.onBirthDateSubmit} onBack={() => props.handleBackWithReturn('card-finder-introduction-part-2')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'name-entry': {
    portrait: (props) => <NameEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('nativety-time-entry')} onNext={() => props.navigateNext('name-card-stack')} onSubmit={props.onNameSubmit} onBack={() => props.handleBackWithReturn('birthdate-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} rejectionNotice={props.nameRejected} onRejectionDismiss={props.onNameRejectionDismiss} />,
    landscape: (props) => <NameEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('nativety-time-entry')} onNext={() => props.navigateNext('name-card-stack')} onSubmit={props.onNameSubmit} onBack={() => props.handleBackWithReturn('birthdate-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} rejectionNotice={props.nameRejected} onRejectionDismiss={props.onNameRejectionDismiss} />,
  },
  'nativety-time-entry': {
    portrait: (props) => <NativetyTimeEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('birth-location-entry')} onNext={props.cuspWarning && !props.birthTime ? props.onCuspTimeFulfilled : () => props.navigateNext('birth-location-entry')} onSubmit={props.onTimeSubmit} onBack={props.cuspWarning && !props.birthTime ? () => props.handleBackWithReturn('date-selector') : () => props.handleBackWithReturn('name-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} cuspMode={props.cuspWarning && !props.birthTime ? { message: props.cuspWarningMessage } : undefined} />,
    landscape: (props) => <NativetyTimeEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('birth-location-entry')} onNext={props.cuspWarning && !props.birthTime ? props.onCuspTimeFulfilled : () => props.navigateNext('birth-location-entry')} onSubmit={props.onTimeSubmit} onBack={props.cuspWarning && !props.birthTime ? () => props.handleBackWithReturn('date-selector') : () => props.handleBackWithReturn('name-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} cuspMode={props.cuspWarning && !props.birthTime ? { message: props.cuspWarningMessage } : undefined} />,
  },
  'birth-location-entry': {
    portrait: (props) => <BirthLocationEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('astrological-houses')} onNext={() => props.navigateNext('astrological-houses')} onSubmit={props.onLocationSubmit} onBack={() => props.navigateBack('nativety-time-entry')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <BirthLocationEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('astrological-houses')} onNext={() => props.navigateNext('astrological-houses')} onSubmit={props.onLocationSubmit} onBack={() => props.navigateBack('nativety-time-entry')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'card-stack': {
    portrait: (props) => <CardStackVertical cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.navigateBack('birth-location-entry')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'card-stack')} />,
    landscape: (props) => <CardStackHorizontal cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.navigateBack('birth-location-entry')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'card-stack')} />,
  },
  'birthdate-card-stack': {
    portrait: (props) => <CardStackVertical cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('date-selector')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'birthdate-card-stack')} />,
    landscape: (props) => <CardStackHorizontal cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('date-selector')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'birthdate-card-stack')} />,
  },
  'name-card-stack': {
    portrait: (props) => <CardStackVertical cards={props.nameCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('name-entry')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'name-card-stack')} />,
    landscape: (props) => <CardStackHorizontal cards={props.nameCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('name-entry')} onInspect={(a) => props.onInspect(ArcanaIdentities[a], 'name-card-stack')} />,
  },
  'growth-card-carousel': {
    portrait: (props) => <GrowthCardStackVertical birthDate={props.birthDate} onHome={() => props.navigate('main-menu')} onBackToPractitioner={() => props.handleBackWithReturn('practitioner-view')} />,
    landscape: (props) => <GrowthCardStackHorizontal birthDate={props.birthDate} onHome={() => props.navigate('main-menu')} onBackToPractitioner={() => props.handleBackWithReturn('practitioner-view')} />,
  },
  'practitioner-view': {
    portrait: (props) => <PractitionerViewVertical birthTime={props.birthTime} birthLocation={props.birthLocation} birthdateCards={props.birthdateCards} nameCards={props.nameCards} growthCards={props.growthCards} onHome={() => props.navigate('main-menu')} navigate={(page) => props.navigateFromPractitioner(page)} />,
    landscape: (props) => <PractitionerViewHorizontal birthTime={props.birthTime} birthLocation={props.birthLocation} birthdateCards={props.birthdateCards} nameCards={props.nameCards} growthCards={props.growthCards} onHome={() => props.navigate('main-menu')} navigate={(page) => props.navigateFromPractitioner(page)} />,
  },
  'inspect': {
    portrait: (props) => <InspectVertical cardId={props.inspectCardId ?? 0} onClose={props.closeInspect} onHome={() => props.navigate('main-menu')} onCardChange={props.onInspectCardChange} />,
    landscape: (props) => <InspectHorizontal cardId={props.inspectCardId ?? 0} onClose={props.closeInspect} onHome={() => props.navigate('main-menu')} onCardChange={props.onInspectCardChange} />,
  }
};

export default orientedPage;