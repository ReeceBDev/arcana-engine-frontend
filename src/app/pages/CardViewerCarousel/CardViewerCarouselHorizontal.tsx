import './CardViewerCarouselHorizontal.css'
import CardCarousel from '../../components/CardCarousel/CardCarousel';
import { useEffect, useRef, useState, useCallback } from 'react';
import arrow from 'url:../../../assets/images/arrow.webp';
import type { CarouselDraggableSnapHandle } from '../../components/CardCarousel/CardCarouselDraggableSnapHandle';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { type ArcanaIdentityIndex } from '../../constants/arcana-identities';
import {
  MAJOR_ARCANA_IDS,
  ELEMENT_ARCANA_IDS,
  ELEMENT_TAGLINES,
  type Element,
} from '../../constants/data/arcana-elements';

const CARD_GAP_IN_PX = 10;
const CAROUSEL_ANIMATIONS = [
  { property: 'scale', peak: 1.05, trough: 1.05, ease: "power2.in" },
  { property: 'rotateY', type: 'linear' as const, left: 30, right: -30 },
  { property: 'rotateZ', type: 'linear' as const, left: 4, right: -4 },
  { property: 'z', peak: 0, trough: -450, ease: "power1.in" },
];

export default function CardViewerCarouselHorizonal({ onBack, startingIndex = 0, onIndexChange, cardIDs: cardIDsProp = MAJOR_ARCANA_IDS, onInspect }: {
  onBack?: () => void;
  startingIndex?: number;
  onIndexChange?: (index: number) => void;
  cardIDs?: ArcanaIdentityIndex[];
  onInspect?: (cardId: ArcanaIdentityIndex, index: number, cardIDs?: ArcanaIdentityIndex[]) => void;
}) {
  const carouselRef = useRef<CarouselDraggableSnapHandle>(null!);
  const lastSyncedIndex = useRef(startingIndex);

  // Currently selected minor-arcana element. Defaults to fire. While null, the
  // major arcana list (cardIDsProp) is shown. When remounting with an element
  // list (e.g. returning from Inspect), restore the matching element so the
  // tagline + element buttons stay consistent with the shown cards.
  const [selectedElement, setSelectedElement] = useState<Element | null>(
    (Object.keys(ELEMENT_ARCANA_IDS) as Element[]).find(el => ELEMENT_ARCANA_IDS[el] === cardIDsProp) ?? null
  );
  const cardIDs = selectedElement ? ELEMENT_ARCANA_IDS[selectedElement] : cardIDsProp;

  const onToggleArcana = () => setSelectedElement(prev => prev === null ? 'fire' : null);

  const onCarouselIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.debug(`Carousel card changed (onCarouselIndexChange) - new index ${index}`);
    lastSyncedIndex.current = index;
    onIndexChange?.(index);
  }, [onIndexChange]);

  // Cards are inspected by clicking them (see the "Tap the card to Inspect it"
  // banner). Sync the index first so the return trip restores the clicked card.
  const handleInspect = useCallback((index: number) => {
    const id = cardIDs[index];
    if (id === undefined) return;
    lastSyncedIndex.current = index;
    onIndexChange?.(index);
    onInspect?.(id, index, cardIDs);
  }, [cardIDs, onIndexChange, onInspect]);

  return (
    <div className="horizontal-carousel-page">
      <CardSequenceBackground />
      <TopNavBarRegion onBack={onBack} selectedElement={selectedElement} />
      <CarouselRegion carouselRef={carouselRef} onIndexChange={onCarouselIndexChange} lastSyncedIndex={lastSyncedIndex} cardIDs={cardIDs} selectedElement={selectedElement} onCardClick={handleInspect} />
      <CarouselControls carouselRef={carouselRef} onToggleArcana={onToggleArcana} selectedElement={selectedElement} onSelectElement={setSelectedElement} />
    </div>
  )
}

function TopNavBarRegion({ onBack, selectedElement }: {
  onBack?: () => void;
  selectedElement: Element | null;
}) {
  const [firstLine, secondLine] = selectedElement !== null
    ? ELEMENT_TAGLINES[selectedElement]
    : ['The order of arcana,', 'tell of a fools journey.'];
  return (
    <div className="top-nav-bar-region">
      <button className="back-button" onClick={onBack}>
        <img src={arrow} alt="Back" />
      </button>
      <button className="back-button">
        <img src={arrow} style={{ visibility: 'hidden' }} />
      </button>
      <div className="nav-bar-text-container">
        <div className="text-spacer" />

        <div className="centre-spacer" />
        <div className="text">
          <p className="first-child">{firstLine}</p>
          <p className="second-child">{secondLine}</p>
        </div>
        <div className="text-spacer" />
      </div>
    </div>
  );
}

function CarouselRegion({ carouselRef, onIndexChange, lastSyncedIndex, cardIDs, selectedElement, onCardClick }: {
  carouselRef: React.RefObject<CarouselDraggableSnapHandle>,
  onIndexChange: (index: number) => void,
  lastSyncedIndex: React.RefObject<number>,
  cardIDs: ArcanaIdentityIndex[],
  selectedElement: Element | null,
  onCardClick: (index: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const height = entries[0].contentRect.height;
      console.log('container height:', height);
      setCardHeight(height);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="minimap-carousel-region">
      <div className="container-banner-bundle">
        <div className="minimap-carousel-container" ref={containerRef}>
          {cardHeight !== undefined && (
            <CardCarousel
              key={`${selectedElement ?? 'major'}-${cardHeight}`}
              ref={carouselRef}
              cardIDs={cardIDs}
              startingIndex={lastSyncedIndex.current}
              cardHeight={cardHeight}
              cardGapInPx={CARD_GAP_IN_PX}
              onIndexChange={onIndexChange}
              onCardClick={onCardClick}
              onDragStart={undefined}
              onDragComplete={onIndexChange}
              animations={CAROUSEL_ANIMATIONS}
              deadzoneEnabled={false}
            />
          )}
        </div>
        <p className="card-display-banner">Tap the card to Inspect it</p>
      </div>
      <CurvedLine />
    </div>
  );
}

function CurvedLine() {
  return (
    <div className="curved-line">
      <svg height="40" width="180%" viewBox="0 0 720 40">
        <path
          d="M 18 13 C 81 18, 189 22, 231.3 23 M 488.7 23 C 531 22, 639 18, 702 13"
          stroke="white"
          strokeWidth="1.8"
          fill="none"
        />
      </svg>
    </div>
  );
}

function CarouselControls({ carouselRef, onToggleArcana, selectedElement, onSelectElement }: {
  carouselRef: React.RefObject<CarouselDraggableSnapHandle>,
  onToggleArcana: () => void,
  selectedElement: Element | null,
  onSelectElement: (element: Element) => void
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
      <button className="left-button" onClick={() => { pulse(leftArrowRef); carouselRef.current?.previous(); }}>
        <img ref={leftArrowRef} src={arrow} alt="Left" />
      </button>
      <div className="text-spacer" />
      {selectedElement === null ? (
        <button className="switch-to-arcana-text-container" onClick={onToggleArcana}>
          <p className="nav-bar-instruction">- Switch to Minor Arcana - </p>
        </button>
      ) : (
        <div className="minor-arcana-controls">
          <button className="switch-to-arcana-text-container-small" onClick={onToggleArcana}>
            <p className="nav-bar-instruction">Major</p>
            <p className="switch-arcana">Arcana</p>
          </button>
          <div className="elements-container">
            <button className={`element-button fire-button${selectedElement === 'fire' ? ' selected' : ''}`} onClick={() => onSelectElement('fire')} />
            <button className={`element-button water-button${selectedElement === 'water' ? ' selected' : ''}`} onClick={() => onSelectElement('water')} />
            <button className={`element-button air-button${selectedElement === 'air' ? ' selected' : ''}`} onClick={() => onSelectElement('air')} />
            <button className={`element-button earth-button${selectedElement === 'earth' ? ' selected' : ''}`} onClick={() => onSelectElement('earth')} />
          </div>
        </div>
      )}
      <div className="text-spacer" />
      <button className="right-button" onClick={() => { pulse(rightArrowRef); carouselRef.current?.next(); }}>
        <img ref={rightArrowRef} src={arrow} alt="Right" />
      </button>
      <div className="spacer" />
    </div>
  );
}