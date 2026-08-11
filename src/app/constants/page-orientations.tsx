import { type JSX } from "react";
import type { PageIdentity } from "../../types/page-identity";
import { type ArcanaIdentityIndex } from "../../constants/arcana-identities";
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
import PractitionerViewHorizontal from "../pages/PractitionerView/PractitionerViewHorizontal";
import PractitionerViewVertical from "../pages/PractitionerView/PractitionerViewVertical";
import PractitionersListVertical from "../pages/PractitionersList/PractitionersListVertical";
import PractitionersListHorizontal from "../pages/PractitionersList/PractitionersListHorizontal";
import type { Practitioner } from "../../types/practitioner";

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
  workflowConfig: WorkflowConfig;
  birthDate: string;
  userName: string;
  birthTime: string;
  birthLocation: string;
  birthdateCards: CardData[];
  nameCards: CardData[];
  growthCards: CardData[];
  onBirthDateSubmit: (date: string) => void;
  onNameSubmit: (name: string) => void;
  practitioners: Practitioner[];
  hasNewPractitioners: boolean;
  onPractitionerSelect: (practitioner: Practitioner) => void;
  onClearAllPractitioners: () => void;
}

const orientedPage: Record<PageIdentity, { portrait: (props: PageProps) => JSX.Element; landscape: (props: PageProps) => JSX.Element }> = {
'main-menu': {
    portrait: (props) => <MainPageVertical navigate={props.navigate} resetWorkflow={props.resetWorkflow} hasNewPractitioners={props.hasNewPractitioners} />,
    landscape: (props) => { props.resetWorkflow; return <MainPageHorizontal navigate={props.navigate} resetWorkflow={props.resetWorkflow} hasNewPractitioners={props.hasNewPractitioners} />; },
  },
  'deck-viewer': {
    portrait: (props) => <CardViewerCarouselVertical startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
  },
  'calendar': {
    portrait: (props) => <CardViewerCarouselVertical {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
  },
  'practitioners-list': {
    portrait: (props) => <PractitionersListVertical practitioners={props.practitioners} onClose={() => props.navigate('main-menu')} onSelect={props.onPractitionerSelect} onClearAll={props.onClearAllPractitioners} />,
    landscape: (props) => <PractitionersListHorizontal practitioners={props.practitioners} onClose={() => props.navigate('main-menu')} onSelect={props.onPractitionerSelect} onClearAll={props.onClearAllPractitioners} />,
  },
  'faq': {
    portrait: (props) => <CardViewerCarouselVertical {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
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
    portrait: (props) => <NameEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('nativety-time-entry')} onNext={() => props.navigateNext('name-card-stack')} onSubmit={props.onNameSubmit} onBack={() => props.handleBackWithReturn('birthdate-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <NameEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('nativety-time-entry')} onNext={() => props.navigateNext('name-card-stack')} onSubmit={props.onNameSubmit} onBack={() => props.handleBackWithReturn('birthdate-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'nativety-time-entry': {
    portrait: (props) => <NativetyTimeEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('birth-location-entry')} onNext={() => props.navigateNext('birth-location-entry')} onBack={() => props.handleBackWithReturn('name-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <NativetyTimeEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('birth-location-entry')} onNext={() => props.navigateNext('birth-location-entry')} onBack={() => props.handleBackWithReturn('name-card-stack')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'birth-location-entry': {
    portrait: (props) => <BirthLocationEntryVertical onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('growth-card-carousel')} onNext={() => props.navigateNext('growth-card-carousel')} onBack={() => props.navigateBack('nativety-time-entry')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <BirthLocationEntryHorizontal onHome={() => props.navigate('main-menu')} onSkip={() => props.navigateNext('growth-card-carousel')} onNext={() => props.navigateNext('growth-card-carousel')} onBack={() => props.navigateBack('nativety-time-entry')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
  'card-stack': {
    portrait: (props) => <CardStackVertical cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.navigateBack('birth-location-entry')} />,
    landscape: (props) => <CardStackHorizontal cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.navigateBack('birth-location-entry')} />,
  },
  'birthdate-card-stack': {
    portrait: (props) => <CardStackVertical cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('date-selector')} />,
    landscape: (props) => <CardStackHorizontal cards={props.birthdateCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('date-selector')} />,
  },
  'name-card-stack': {
    portrait: (props) => <CardStackVertical cards={props.nameCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('name-entry')} />,
    landscape: (props) => <CardStackHorizontal cards={props.nameCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('name-entry')} />,
  },
  'growth-card-stack': {
    portrait: (props) => <CardStackVertical cards={props.growthCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('nativety-time-entry')} />,
    landscape: (props) => <CardStackHorizontal cards={props.growthCards} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('nativety-time-entry')} />,
  },
  'growth-card-carousel': {
    // Vertical variant intentionally deferred ("ignore vertical for now").
    // Both orientations render the Horizontal page until a Vertical one exists.
    portrait: (props) => <GrowthCardStackHorizontal birthDate={props.birthDate} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('birth-location-entry')} />,
    landscape: (props) => <GrowthCardStackHorizontal birthDate={props.birthDate} onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('practitioner-view')} onBack={() => props.handleBackWithReturn('birth-location-entry')} />,
  },
  'practitioner-view': {
    portrait: (props) => <PractitionerViewVertical birthDate={props.birthDate} birthTime={props.birthTime} birthLocation={props.birthLocation} birthdateCards={props.birthdateCards} nameCards={props.nameCards} growthCards={props.growthCards} onHome={() => props.navigate('main-menu')} navigate={(page) => props.navigateFromPractitioner(page)} />,
    landscape: (props) => <PractitionerViewHorizontal birthDate={props.birthDate} birthTime={props.birthTime} birthLocation={props.birthLocation} birthdateCards={props.birthdateCards} nameCards={props.nameCards} growthCards={props.growthCards} onHome={() => props.navigate('main-menu')} navigate={(page) => props.navigateFromPractitioner(page)} />,
  }
};

export default orientedPage;