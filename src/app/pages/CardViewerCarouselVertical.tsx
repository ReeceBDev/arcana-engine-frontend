import './CardViewerCarouselVertical.css'
import CardCarousel from '../components/CardCarousel/CardCarousel';
import CardSwipeable from '../components/CardCarousel/CardSwipeable';
import { useRef, useCallback } from 'react';
import arrow from 'url:../../assets/images/arrow.webp';
import type { CarouselDraggableSnapHandle } from '../components/CardCarousel/CardCarouselDraggableSnapHandle';
import SmallVerticalTabLine from '../components/SmallVerticalTabLine';
import { gsap } from 'gsap';

export default function CardViewerCarouselVertical({ onBack }: { onBack?: () => void }) {
  const swipeRef = useRef<CarouselDraggableSnapHandle>(null!);
  const smallRef = useRef<CarouselDraggableSnapHandle>(null!);
  const lastSyncedIndex = useRef(-1);

  const onSwipeIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.log(`Swipeable card changed (onSwipeIndexChange) - syncing carousel to index ${index}`);
    lastSyncedIndex.current = index;
    smallRef.current?.toIndex(index);
  }, []);

  const onSmallIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.log(`Carousel card changed (onSmallIndexChange) - syncing swipeable to index ${index}`);
    lastSyncedIndex.current = index;
    swipeRef.current?.toIndex(index);
  }, []);

  const onSmallDragStart = useCallback(() => {
  }, []);

  const onSmallDragComplete = useCallback((index: number) => {
    console.log(`Carousel drag complete (onSmallDragComplete) - syncing swipeable to index ${index}`);
    swipeRef.current?.toIndex(index);
  }, []);

  console.log(arrow)

  return (
    <div className="page-vertical">
      <img
        src="https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png"
        className="background-image"
      />
      <TopNavBarRegion onBack={onBack} />
      <CardDisplayRegion swipeRef={swipeRef} onIndexChange={onSwipeIndexChange} />
      <MinimapCarouselRegion carouselRef={smallRef} onIndexChange={onSmallIndexChange} onDragStart={onSmallDragStart} onDragComplete={onSmallDragComplete} />
      <CarouselControls swipeRef={swipeRef} />
    </div>
  )
}

function TopNavBarRegion({ onBack }: { onBack?: () => void }) {
  return (
    <div className="top-nav-bar-region">
      <button className="back-button" onClick={onBack}>
        <img src={arrow} alt="Back" />
      </button>
    </div>
  );
}

function CardDisplayRegion({ swipeRef, onIndexChange }: { swipeRef: React.RefObject<CarouselDraggableSnapHandle>, onIndexChange: (index: number) => void }) {
  return (
    <div className="card-display-region">
      <div className="container-banner-bundle">
        <p className="card-display-banner">Tap the card to Inspect it...</p>
        <div className="card-display-container">
          <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
          <CardSwipeable ref={swipeRef} onIndexChange={onIndexChange} />
          <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
        </div>
      </div>
    </div>
  );
}

function MinimapCarouselRegion({ carouselRef, onIndexChange, onDragStart, onDragComplete }: {
  carouselRef: React.RefObject<CarouselDraggableSnapHandle>,
  onIndexChange: (index: number) => void,
  onDragStart: (direction: 1 | -1) => void,
  onDragComplete: (index: number) => void
}) {
  const CARD_GAP_IN_PX = 10;

  return (
    <div className="minimap-carousel-region">
      <p className="minimap-carousel-banner">Swipe left and right to change cards</p>
      <div className="minimap-carousel-container">
        <CardCarousel
          ref={carouselRef}
          cardHeight={150}
          cardWidth={100}
          cardGapInPx={CARD_GAP_IN_PX}
          onIndexChange={onIndexChange}
          onDragStart={onDragStart}
          onDragComplete={onDragComplete}
          animations={[
            { property: 'scale', peak: 1.1, trough: 0.86, ease: "M0,0 C0.078,0.153 0.668,0.128 0.887,0.469 1,0.647 0.979,0.9 1,0.9 " },
            { property: 'y', peak: 0, trough: -60, ease: "M0,0 C0.011,0.138 0.34,0.247 0.532,0.4 0.689,0.525 0.716,0.709 0.716,0.709 0.716,0.709 0.757,1.012 1,1.025 " },
          ]}
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

function CarouselControls({ swipeRef }: { swipeRef: React.RefObject<CarouselDraggableSnapHandle> }) {
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
      <button className="left-button" onClick={() => { pulse(leftArrowRef); swipeRef.current?.previous() }}>
        <img ref={leftArrowRef} src={arrow} alt="Left" />
      </button>
      <button className="switch-to-arcana-text-container">
        <p className="nav-bar-instruction">Tap here to Switch</p>
        <p className="switch-arcana">to Minor arcana</p>
      </button>
      <button className="right-button" onClick={() => { pulse(rightArrowRef); swipeRef.current?.next() }}>
        <img ref={rightArrowRef} src={arrow} alt="Right" />
      </button>
    </div>
  );
}