import './FallingCards.css';
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ArcanaIdentities } from "../constants/arcana-identities";
import { ARCANA_IMAGE_URI } from "../constants/arcana-images";

export default function FallingCards() {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeCards = useRef(0);
    const MAX_CARDS = 20;

    useEffect(() => {
            const container = containerRef.current!;
const spawnCard = () => {
        if (activeCards.current >= MAX_CARDS) return;
        activeCards.current++;

        const cardIndices = Object.values(ArcanaIdentities).filter(v => v !== ArcanaIdentities.BACK) as number[];
        const randomIndex = cardIndices[Math.floor(Math.random() * cardIndices.length)];
        let isFlipped = (Math.random() * 100 | 0) % 2 === 1;
        let frontUri = ARCANA_IMAGE_URI[(isFlipped ? ArcanaIdentities.BACK : randomIndex) as keyof typeof ARCANA_IMAGE_URI][0]?.uri;
        let backUri = ARCANA_IMAGE_URI[(isFlipped ? randomIndex : ArcanaIdentities.BACK) as keyof typeof ARCANA_IMAGE_URI][0]?.uri;

        const card = document.createElement('div');
        card.className = 'falling-card';
        card.style.left = `${Math.random() * 100}%`;
        card.style.zIndex = String(Math.floor(Math.random() * 3));
        card.style.backgroundImage = `url('${frontUri}')`;
        container.appendChild(card);



        gsap.to(card, {
            y: window.innerHeight * 1.3,
            rotationZ: (Math.random() - 0.5) * 720,
            rotationY: 360,
            x: (Math.random() - 0.5) * 100,
            duration: 2.5 + Math.random() * 2,
            ease: 'power1.in',
onUpdate: () => {
    const rotY = (gsap.getProperty(card, "rotationY") as number) % 360;
const shouldFlip = rotY > 90 && rotY < 270;
if (shouldFlip !== isFlipped) {
    isFlipped = shouldFlip;
    card.style.backgroundImage = `url('${isFlipped ? backUri : frontUri}')`;
}
},
            onComplete: () => {
                card.remove();
                activeCards.current--;
            }
        });
    };

        const interval = setInterval(spawnCard, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={containerRef} className="falling-cards-container" />
    );
}