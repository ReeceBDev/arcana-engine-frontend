import './SpinningCard.css';
import { useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from '@gsap/react';
import CardFace from "./ArcanaCard/CardFace";
import { ArcanaIdentities, type ArcanaIdentity } from "../constants/arcana-identities";

export default function ArcanaCarousel() {    
const carouselRef = useRef(null);
const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];
gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

useGSAP(() => {
    gsap.to(".animated-card", {
        rotationY: 360,
        duration: 10,
        repeat: -1,
    });
}, {scope: carouselRef});

    return (
        <div ref={carouselRef} className="card-carousel">
            {cardIds.map((cardId, index) => (
                <div key={index} className="animated-card">
                    <CardFace cardId={ArcanaIdentities[cardId]} cardWidth={100} cardHeight={150} />
                </div>
            ))}
        </div>
    )
}