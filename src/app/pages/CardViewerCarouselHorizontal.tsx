import './CardViewerCarouselHorizontal.css'
import CardCarousel from '../components/CardCarousel/CardCarousel';
import { useEffect, useRef, useState, useCallback } from 'react';
import arrow from 'url:../../assets/images/arrow.webp';
import type { CarouselDraggableSnapHandle } from '../components/CardCarousel/CardCarouselDraggableSnapHandle';
import { gsap } from 'gsap';
import { proxyImageUrl } from '../utilities/proxy-image-url';

const CARD_GAP_IN_PX = 10;
const CAROUSEL_ANIMATIONS = [
  { property: 'scale', peak: 1.05, trough: 1.05, ease: "power2.in" },
  { property: 'rotateY', type: 'linear' as const, left: 30, right: -30 },
  { property: 'rotateZ', type: 'linear' as const, left: 4, right: -4 },
  { property: 'z', peak: 0, trough: -450, ease: "power1.in" },
];

export default function CardViewerCarouselHorizonal({ onBack, startingIndex = 0}: { onBack?: () => void, startingIndex?: number }) {
  const carouselRef = useRef<CarouselDraggableSnapHandle>(null!);
  const lastSyncedIndex = useRef(startingIndex);

 const onCarouselndexChange = useCallback((index: number) => {
      if (lastSyncedIndex.current === index) return;
      console.debug(`Carousel card changed (onCarouselIndexChange) - new index ${index}`);
      lastSyncedIndex.current = index;
    }, []);

  return (
    <div className="horizontal-carousel-page">
      <img
        src={proxyImageUrl(
          'https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png',
          window.innerWidth,
          window.innerHeight
        )}
        className="background-image"
      />
      <TopNavBarRegion onBack={onBack} />
      <CarouselRegion carouselRef={carouselRef} onIndexChange={onCarouselndexChange} lastSyncedIndex={lastSyncedIndex} />
      <CarouselControls carouselRef={carouselRef} />
    </div>
  )
}

function TopNavBarRegion({ onBack }: { onBack?: () => void }) {
  return (
    <div className="top-nav-bar-region">
      <button className="back-button" onClick={onBack}>
        <img src={arrow} alt="Back" />
      </button>
      <button className="back-button">
        <img src={arrow} style={{ visibility: 'hidden'}}/>
      </button>
      <div className="nav-bar-text-container">
        <div className="text-spacer" />

      <div className="centre-spacer" />
      <div className="text">
              <p className="first-child">The order of arcana,</p>
              <p className="second-child">tell of a fools journey.</p>
      </div>
      <div className="text-spacer" />
      </div>
    </div>
  );
}

function CarouselRegion({ carouselRef, onIndexChange, lastSyncedIndex } : { 
    carouselRef: React.RefObject<CarouselDraggableSnapHandle>, 
    onIndexChange: (index: number) => void, 
    lastSyncedIndex: React.RefObject<number> 
  }){
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
              key={cardHeight}
              ref={carouselRef}
              startingIndex={lastSyncedIndex.current}
              cardHeight={cardHeight}
              cardGapInPx={CARD_GAP_IN_PX}
              onIndexChange={onIndexChange}
              onDragStart={undefined}
              onDragComplete={undefined}
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

function CarouselControls({ carouselRef }: { carouselRef: React.RefObject<CarouselDraggableSnapHandle> }) {
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
      <button className="switch-to-arcana-text-container">
        <p className="nav-bar-instruction">- Switch to Minor Arcana - </p>
      </button>
      <div className="text-spacer" />
      <button className="right-button" onClick={() => { pulse(rightArrowRef); carouselRef.current?.next(); }}>
        <img ref={rightArrowRef} src={arrow} alt="Right" />
      </button>
      <div className="spacer" />
    </div>
  );
}