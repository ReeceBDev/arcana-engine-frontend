import { type JSX } from "react";
import type { PageIdentity } from "../../types/page-identity";
import MainPageVertical from "../pages/MainPageVertical";
import MainPageHorizontal from "../pages/MainPageHorizontal";
import CardViewerCarouselVertical from "../pages/CardViewerCarouselVertical";
import CardViewerCarouselHorizontal from "../pages/CardViewerCarouselHorizontal";
import type { Orientation } from "../../types/orientation";

export function getOrientationType(type: string): Orientation {
  return type.startsWith('landscape') ? 'landscape' : 'portrait';
}

export type DeckConfig = {
  currentIndex: number;
  cardIDs?: number[];
}

export type PageProps = {
  navigate: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  deckConfig: DeckConfig;
  onIndexChange: (index: number) => void;
}

const orientedPage: Record<PageIdentity, { portrait: (props: PageProps) => JSX.Element; landscape: (props: PageProps) => JSX.Element }> = {
  'main-menu': {
    portrait: (props) => <MainPageVertical navigate={props.navigate} />,
    landscape: (props) => <MainPageHorizontal navigate={props.navigate} />,
  },
  'deck-viewer': {
    portrait: (props) => <CardViewerCarouselVertical startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal startingIndex={props.deckConfig.currentIndex} onIndexChange={props.onIndexChange} onBack={() => props.navigate('main-menu')} />,
  },
'calendar': {
  portrait: (props) => <CardViewerCarouselVertical  {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
  },
'faq': {
  portrait: (props) => <CardViewerCarouselVertical  {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
    landscape: (props) => <CardViewerCarouselHorizontal {...props.deckConfig} onBack={() => props.navigate('main-menu')} />,
  },
};

export default orientedPage;