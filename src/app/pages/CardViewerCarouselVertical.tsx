import './CardViewerCarouselVertical.css'
import CardCarousel from '../components/CardCarousel/CardCarousel';
import CardSwipeable from '../components/CardCarousel/CardSwipeable';
import { useRef, useCallback } from 'react';
import arrow from 'url:../../assets/images/arrow.webp';
import type { CarouselDraggableSnapHandle } from '../components/CardCarousel/CardCarouselDraggableSnapHandle';
import SmallVerticalTabLine from '../components/SmallVerticalTabLine';
import { gsap } from 'gsap';
import { proxyImageUrl } from '../utilities/proxy-image-url';

const CARD_GAP_IN_PX = 10;
const CAROUSEL_ANIMATIONS = [
    { property: 'scale', peak: 1.1, trough: 0.86, ease: "M0,0 C0.078,0.153 0.668,0.128 0.887,0.469 1,0.647 0.979,0.9 1,0.9 " },
    { property: 'y', peak: 0, trough: -60, ease: "M0,0 C0.011,0.138 0.34,0.247 0.532,0.4 0.689,0.525 0.716,0.709 0.716,0.709 0.716,0.709 0.757,1.012 1,1.025 " },
];

export default function CardViewerCarouselVertical({ onBack, startingIndex = 0 }: { onBack?: () => void, startingIndex?: number }) {
  const swipeRef = useRef<CarouselDraggableSnapHandle>(null!);
  const smallRef = useRef<CarouselDraggableSnapHandle>(null!);
  const lastSyncedIndex = useRef(startingIndex);

  const onSwipeIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.debug(`Swipeable card changed (onSwipeIndexChange) - syncing carousel to index ${index}`);
    lastSyncedIndex.current = index;
    smallRef.current?.toIndex(index);
  }, []);

  const onSmallIndexChange = useCallback((index: number) => {
    if (lastSyncedIndex.current === index) return;
    console.debug(`Carousel card changed (onSmallIndexChange) - syncing swipeable to index ${index}`);
    lastSyncedIndex.current = index;
    swipeRef.current?.toIndex(index);
  }, []);

  const onSmallDragStart = useCallback(() => {
  }, []);

  const onSmallDragComplete = useCallback((index: number) => {
    console.debug(`Carousel drag complete (onSmallDragComplete) - syncing swipeable to index ${index}`);
    swipeRef.current?.toIndex(index);
  }, []);

  return (
    <div className="vertical-carousel-page">
      <img
        src={proxyImageUrl(
          'https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png',
          window.innerWidth,
          window.innerHeight
        )}
        className="background-image"
      />
      <TopNavBarRegion onBack={onBack} />
      <CardDisplayRegion swipeRef={swipeRef} onIndexChange={onSwipeIndexChange} />
      <MinimapCarouselRegion carouselRef={smallRef} onIndexChange={onSmallIndexChange} onDragStart={onSmallDragStart} onDragComplete={onSmallDragComplete} startingIndex={startingIndex} />
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

function MinimapCarouselRegion({ carouselRef, onIndexChange, onDragStart, onDragComplete, startingIndex }: {
  carouselRef: React.RefObject<CarouselDraggableSnapHandle>,
  onIndexChange: (index: number) => void,
  onDragStart: (direction: 1 | -1) => void,
  onDragComplete: (index: number) => void,
  startingIndex: number
}) {

  return (
    <div className="minimap-carousel-region">
      <p className="minimap-carousel-banner">Swipe left and right to change cards</p>
      <div className="minimap-carousel-container">
        <CardCarousel
          ref={carouselRef}
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
      <div className="spacer" />
      <button className="left-button" onClick={() => { pulse(leftArrowRef); swipeRef.current?.previous() }}>
        <img ref={leftArrowRef} src={arrow} alt="Left" />
      </button>
      <div className="text-spacer" />
      <button className="switch-to-arcana-text-container">
        <p className="nav-bar-instruction">Tap here to Switch</p>
        <p className="switch-arcana">to Minor arcana</p>
      </button>
      <div className="text-spacer" />
      <button className="right-button" onClick={() => { pulse(rightArrowRef); swipeRef.current?.next() }}>
        <img ref={rightArrowRef} src={arrow} alt="Right" />
      </button>
      <div className="spacer" />
    </div>
  );
}