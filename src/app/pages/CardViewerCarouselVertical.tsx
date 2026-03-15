import './CardViewerCarouselVertical.css'
import CardCarouselSmall from '../components/CardCarousel/CardCarouselSmall';
import CardCarouselSwipeable from '../components/CardCarousel/CardCarouselSwipeable';
import { useRef, useCallback } from 'react';
import type { CarouselDraggableSnapHandle } from '../components/CardCarousel/CardCarouselDraggableSnapHandle';
import SmallVerticalTabLine from '../components/SmallVerticalTabLine';

export default function CardViewerCarouselVertical({ onBack }: { onBack?: () => void }) {
  const swipeRef = useRef<CarouselDraggableSnapHandle>(null!);
  const smallRef = useRef<CarouselDraggableSnapHandle>(null!);

  const onSwipeIndexChange = useCallback((index: number) => {
    smallRef.current?.toIndex(index);
  }, []);

const onSmallIndexChange = useCallback((index: number) => {
    swipeRef.current?.toIndex(index);
}, []);

const onSmallDragStart = useCallback(() => {
//  const onSmallDragStart = useCallback((direction: 1 | -1) => {
//    swipeRef.current?.beginExit?.(direction);
}, []);

const onSmallDragComplete = useCallback((index: number) => {
    //swipeRef.current?.completeEntry?.(index);
    swipeRef.current?.toIndex(index);
}, []);

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
      <button className="back-button" onClick={onBack}>Back</button>
    </div>
  );
}

function CardDisplayRegion({ swipeRef, onIndexChange }: { swipeRef: React.RefObject<CarouselDraggableSnapHandle>, onIndexChange: (index: number) => void }) {
  return (
    <div className="card-display-region">
      <p className="card-display-banner">Tap the card to Inspect it...</p>
      <div className="card-display-container">
        <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
        <CardCarouselSwipeable ref={swipeRef} onIndexChange={onIndexChange} />
        <SmallVerticalTabLine horizontalPadding={7} colour={'white'} />
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
  return (
    <div className="minimap-carousel-region">
      <p className="minimap-carousel-banner">Swipe left and right to change cards</p>
      <StraightLine widthPercent={45} />
      <div className="minimap-carousel-container">
        <CardCarouselSmall ref={carouselRef} cardHeight={150} cardWidth={100} onIndexChange={onIndexChange} onDragStart={onDragStart} onDragComplete={onDragComplete} />
      </div>
      <StraightLine widthPercent={45} />
      <CurvedLine />
    </div>
  );
}

function StraightLine({ widthPercent = 100 }: { widthPercent?: number }) {
  const x1 = (100 - widthPercent) / 2;
  const x2 = 100 - x1;
  return (
    <div className="straight-line">
      <svg height="40" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
        <line x1={x1} y1="20" x2={x2} y2="20" stroke="white" strokeWidth="`" />
      </svg>
    </div>
  );
}

function CurvedLine() {
  return (true); // Early return to disable curved line for now, as it looks a bit off with the current flat smallcarousel layout. Can re-enable later if desired.
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
  return (
    <div className="carousel-controls">
      <button className="left-button" onClick={() => swipeRef.current?.previous()}>Left</button>
      <button className="switch-to-arcana-text-container">
        <p className="nav-bar-instruction">Tap here to Switch</p>
        <p className="switch-arcana">to Minor arcana</p>
      </button>
      <button className="right-button" onClick={() => swipeRef.current?.next()}>Right</button>
    </div>
  );
}