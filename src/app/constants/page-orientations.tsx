import { type JSX } from "react";
import type { PageIdentity } from "../../types/page-identity";
import MainPageVertical from "../pages/MainPageVertical";
import MainPageHorizontal from "../pages/MainPageHorizontal";
import CardViewerCarouselVertical from "../pages/CardViewerCarouselVertical";
import CardViewerCarouselHorizontal from "../pages/CardViewerCarouselHorizontal";
import type { Orientation } from "../../types/orientation";
import IntroductionHorizontal from "../pages/CardFinderSequence/IntroductionHorizontal";
import type { WorkflowConfig } from "../../types/workflow-config";
import IntroductionVertical from "../pages/CardFinderSequence/IntroductionVertical";

export function getOrientationType(type: string): Orientation {
  return type.startsWith('landscape') ? 'landscape' : 'portrait';
}

export type DeckConfig = {
  currentIndex: number;
  cardIDs?: number[];
}

export type NavConfig = {
  showNext?: boolean;
}

export type PageProps = {
  navigate: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  navigateNext: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  navigateBack: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  resetWorkflow: () => void;
  deckConfig: DeckConfig;
  onIndexChange: (index: number) => void;
  workflowConfig: WorkflowConfig;
}

const orientedPage: Record<PageIdentity, { portrait: (props: PageProps) => JSX.Element; landscape: (props: PageProps) => JSX.Element }> = {
'main-menu': {
    portrait: (props) => <MainPageVertical navigate={props.navigate} resetWorkflow={props.resetWorkflow} />,
    landscape: (props) => { props.resetWorkflow; return <MainPageHorizontal navigate={props.navigate} resetWorkflow={props.resetWorkflow} />; },
  },
  'deck-viewer': {
    portrait: (props) => <CardViewerCarouselVertical startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
  },
  'calendar': {
    portrait: (props) => <CardViewerCarouselVertical {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
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
    portrait: (props) => <IntroductionVertical onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('deck-viewer')} onBack={() => props.navigateBack('card-finder-introduction-part-1')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
    landscape: (props) => <IntroductionHorizontal onHome={() => props.navigate('main-menu')} onNext={() => props.navigateNext('deck-viewer')} onBack={() => props.navigateBack('card-finder-introduction-part-1')} showNext={props.workflowConfig.currentIteration < props.workflowConfig.lastIteration} />,
  },
};

export default orientedPage;