import './CardViewerCarouselVertical.css'
import CardCarousel from '../../components/CardCarousel/CardCarousel';
import CardSwipeable from '../../components/CardCarousel/CardSwipeable';
import { useRef, useCallback, useState } from 'react';
import arrow from 'url:../../../assets/images/arrow.webp';
import type { CarouselDraggableSnapHandle } from '../../components/CardCarousel/CardCarouselDraggableSnapHandle';
import SmallVerticalTabLine from '../../components/SmallVerticalTabLine';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { type ArcanaIdentityIndex } from '../../constants/arcana-identities';
import {
  MAJOR_ARCANA_IDS,
  ELEMENT_ARCANA_IDS,
  type Element,
} from '../../constants/data/arcana-elements';

const CARD_GAP_IN_PX = 10;
const CAROUSEL_ANIMATIONS = [
    { property: 'scale', peak: 1.1, trough: 0.86, ease: "M0,0 C0.078,0.153 0.668,0.128 0.887,0.469 1,0.647 0.979,0.9 1,0.9 " },
    { property: 'y', peak: 0, trough: -60, ease: "M0,0 C0.011,0.138 0.34,0.247 0.532,0.4 0.689,0.525 0.716,0.709 0.716,0.709 0.716,0.709 0.757,1.012 1,1.025 " },
];

export default function CardViewerCarouselVertical({ onBack, startingIndex = 0, onIndexChange, cardIDs: cardIDsProp = MAJOR_ARCANA_IDS, onInspect }: {
  onBack?: () => void;
  startingIndex?: number;
  onIndexChange?: (index: number) => void;
  cardIDs?: ArcanaIdentityIndex[];
  onInspect?: (cardId: ArcanaIdentityIndex, index: number, cardIDs?: ArcanaIdentityIndex[]) => void;
}) {
  const swipeRef = useRef<CarouselDraggableSnapHandle>(null!);
  const smallRef = useRef<CarouselDraggableSnapHandle>(null!);
  const lastSyncedIndex = useRef(startingIndex);

  // Currently selected minor-arcana element. Defaults to fire. While null, the
  // major arcana list (cardIDsProp) is shown. When remounting with an element
  // list (e.g. returning from Inspect), restore the matching element so the
  // element buttons stay consistent with the shown cards.
  const [selectedElement, setSelectedElement] = useState<Element | null>(
    (Object.keys(ELEMENT_ARCANA_IDS) as Element[]).find(el => ELEMENT_ARCANA_IDS[el] === cardIDsProp) ?? null
  );
  const cardIDs = selectedElement ? ELEMENT_ARCANA_IDS[selectedElement] : cardIDsProp;

  const onToggleArcana = () => setSelectedElement(prev => prev === null ? 'fire' : null);

  const onSwipeIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.debug(`Swipeable card changed (onSwipeIndexChange) - syncing carousel to index ${index}`);
    lastSyncedIndex.current = index;
    smallRef.current?.toIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  const onSmallIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.debug(`Carousel card changed (onSmallIndexChange) - syncing swipeable to index ${index}`);
    lastSyncedIndex.current = index;
    swipeRef.current?.toIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  const onSmallDragStart = useCallback(() => {
  }, []);

  const onSmallDragComplete = useCallback((index: number) => {
    console.debug(`Carousel drag complete (onSmallDragComplete) - syncing swipeable to index ${index}`);
    swipeRef.current?.toIndex(index);
  }, []);

  // Cards are inspected by tapping them (see the "Tap the card to Inspect it"
  // banner). Sync the index first so the return trip restores the tapped card.
  const handleInspect = useCallback((index: number) => {
    const id = cardIDs[index];
    if (id === undefined) return;
    lastSyncedIndex.current = index;
    onIndexChange?.(index);
    onInspect?.(id, index, cardIDs);
  }, [cardIDs, onIndexChange, onInspect]);

  return (
    <div className="vertical-carousel-page">
      <CardSequenceBackground />
      <TopNavBarRegion onBack={onBack} selectedElement={selectedElement} onSelectElement={setSelectedElement} />
      <CardDisplayRegion swipeRef={swipeRef} onIndexChange={onSwipeIndexChange} onCardTap={handleInspect} startingIndex={startingIndex} cardIDs={cardIDs} selectedElement={selectedElement} />
      <MinimapCarouselRegion carouselRef={smallRef} onIndexChange={onSmallIndexChange} onDragStart={onSmallDragStart} onDragComplete={onSmallDragComplete} startingIndex={startingIndex} cardIDs={cardIDs} selectedElement={selectedElement} />
      <CarouselControls swipeRef={swipeRef} onToggleArcana={onToggleArcana} selectedElement={selectedElement} />
    </div>
  )
}

function TopNavBarRegion({ onBack, selectedElement, onSelectElement }: {
  onBack?: () => void;
  selectedElement: Element | null;
  onSelectElement: (element: Element) => void;
}) {
  return (
    <div className="top-nav-bar-region">
      <button className="back-button" onClick={onBack}>
        <img src={arrow} alt="Back" />
      </button>
      {selectedElement !== null && (
        <div className="elements-container">
          <button className={`element-button fire-button${selectedElement === 'fire' ? ' selected' : ''}`} onClick={() => onSelectElement('fire')} />
          <button className={`element-button water-button${selectedElement === 'water' ? ' selected' : ''}`} onClick={() => onSelectElement('water')} />
          <button className={`element-button air-button${selectedElement === 'air' ? ' selected' : ''}`} onClick={() => onSelectElement('air')} />
          <button className={`element-button earth-button${selectedElement === 'earth' ? ' selected' : ''}`} onClick={() => onSelectElement('earth')} />
        </div>
      )}
    </div>
  );
}

function CardDisplayRegion({ swipeRef, onIndexChange, onCardTap, startingIndex, cardIDs, selectedElement }: { 
  swipeRef: React.RefObject<CarouselDraggableSnapHandle>, 
  onIndexChange: (index: number) => void,
  onCardTap: (index: number) => void,
  startingIndex: number,
  cardIDs: ArcanaIdentityIndex[],
  selectedElement: Element | null
}) {
  return (
    <div className="card-display-region">
      <div className="container-banner-bundle">
        <p className="card-display-banner">Tap the card to Inspect it...</p>
        <div className="card-display-container">
          <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
          <CardSwipeable key={`${selectedElement ?? 'major'}`} ref={swipeRef} cardIDs={cardIDs} startingIndex={startingIndex} onIndexChange={onIndexChange} onCardTap={onCardTap} />
          <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
        </div>
      </div>
    </div>
  );
}

function MinimapCarouselRegion({ carouselRef, onIndexChange, onDragStart, onDragComplete, startingIndex, cardIDs, selectedElement }: {
  carouselRef: React.RefObject<CarouselDraggableSnapHandle>,
  onIndexChange: (index: number) => void,
  onDragStart: (direction: 1 | -1) => void,
  onDragComplete: (index: number) => void,
  startingIndex: number,
  cardIDs: ArcanaIdentityIndex[],
  selectedElement: Element | null
}) {

  return (
    <div className="minimap-carousel-region">
      <p className="minimap-carousel-banner">Swipe left and right to change cards</p>
      <div className="minimap-carousel-container">
        <CardCarousel
          key={`${selectedElement ?? 'major'}`}
          ref={carouselRef}
          cardIDs={cardIDs}
          startingIndex={startingIndex}
          cardHeight={150}
          cardWidth={100}
          cardGapInPx={CARD_GAP_IN_PX}
          onIndexChange={onIndexChange}
          onDragStart={onDragStart}
          onDragComplete={onDragComplete}
          animations={CAROUSEL_ANIMATIONS}
          compressImages={true}
          disable3d={true}
        />
      </div>
      <CurvedLine />
    </div>
  );
}

function CurvedLine() {
  return (
    <div className="curved-line">
      <svg height="40" width="100%" viewBox="0 0 400 40">
        <path
          d="M 10 13 C 45 18, 105 22, 128.5 23 M 271.5 23 C 295 22, 355 18, 390 13"
          stroke="white"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </div>
  );
}

function CarouselControls({ swipeRef, onToggleArcana, selectedElement }: { 
  swipeRef: React.RefObject<CarouselDraggableSnapHandle>,
  onToggleArcana: () => void,
  selectedElement: Element | null
}) {
  const leftArrowRef = useRef(null);
  const rightArrowRef = useRef(null);

  const pulse = (ref: any) => {
    gsap.fromTo(ref.current,
      { scale: 1 },
      { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, ease: "none" }
    );
  };

  return (
    <div className="carousel-controls">
      <div className="spacer" />
      <button className="left-button" onClick={() => { pulse(leftArrowRef); swipeRef.current?.previous() }}>
        <img ref={leftArrowRef} src={arrow} alt="Left" />
      </button>
      <div className="text-spacer" />
      <button className="switch-to-arcana-text-container" onClick={onToggleArcana}>
        <p className="nav-bar-instruction">Tap here to Switch</p>
        <p className="switch-arcana">to {selectedElement === null ? 'Minor' : 'Major'} arcana</p>
      </button>
      <div className="text-spacer" />
      <button className="right-button" onClick={() => { pulse(rightArrowRef); swipeRef.current?.next() }}>
        <img ref={rightArrowRef} src={arrow} alt="Right" />
      </button>
      <div className="spacer" />
    </div>
  );
}