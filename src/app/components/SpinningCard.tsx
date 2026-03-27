import './SpinningCard.css';
import { CustomEase } from "gsap/CustomEase";
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CardFace from "./ArcanaCard/CardFace";
import { ArcanaIdentities, type ArcanaIdentity } from "../constants/arcana-identities";

gsap.registerPlugin(CustomEase);

CustomEase.create("cardSpin", "M0,0 C0,0.101 0.144,0.461 0.499,0.552 0.858,0.647 1,0.896 1,1 ");
CustomEase.create("cardSpinDramatic", "M0,0 C0,0.101 0.034,0.379 0.375,0.512 0.653,0.613 1,0.896 1,1 ");
CustomEase.create("cardSpinDramaticWithFastTail", undefined); // Please do later! It'll give it a dramatic "swoosh" effect if the card rotates out sooner & faster.

export default function SpinningCard({ height, width }: { height?: number, width?: number }) {
    const carouselRef = useRef(null);
    const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];

    const randomCard = (excludeId?: ArcanaIdentity) => {
        const available = excludeId ? cardIds.filter(id => id !== excludeId) : cardIds;
        return available[Math.floor(Math.random() * available.length)];
    };
    const [selectedId, setSelectedId] = useState<ArcanaIdentity>(randomCard);
    const nextFrontIdRef = useRef<ArcanaIdentity>(randomCard());

    useGSAP(() => {
        gsap.timeline({ repeat: -1 })
            .fromTo(".animated-card", { rotationY: -90 }, {
                rotationY: 90,
                duration: 2.8,
                ease: "cardSpinDramatic",
                onStart: () => setSelectedId(nextFrontIdRef.current)
            })
            .fromTo(".animated-card", { rotationY: 90 }, {
                rotationY: 270,
                duration: 0.6,
                ease: "sine.inOut",
                onStart: () => {
                    setSelectedId('BACK' as ArcanaIdentity);
                    const nextId = randomCard();
                    new Image().src = String(ArcanaIdentities[nextId]);
                    nextFrontIdRef.current = nextId;
                    console.debug("SpinningCard: preloaded the next card image. Next id:", nextId, " with URI:", ArcanaIdentities[nextId]);
                },
            })
    }, { scope: carouselRef });
    return (
        <div ref={carouselRef} className="card-container">
            <div className="animated-card" style={{ width, height }}>
                <CardFace cardId={ArcanaIdentities[selectedId]} cardWidth={width} cardHeight={height} />
            </div>
        </div>
    );
}