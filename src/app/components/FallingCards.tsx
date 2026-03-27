import './FallingCards.css';
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ArcanaIdentities } from "../constants/arcana-identities";
import { ARCANA_IMAGE_URI } from "../constants/arcana-images";

const SPAWNS_PER_TICK = 1.5;   // base cards per tick
const SPAWN_CHANCE = 0.6;    // chance each individual spawn attempt succeeds

const LEFT_ZONE_CHANCE = 0.425;  // { total must sum to 1 }
const MIDDLE_ZONE_CHANCE = 0.15; // { total must sum to 1 }
const RIGHT_ZONE_CHANCE = 0.425; // { total must sum to 1 }

const LEFT_ZONE_END = 37.5;    // left zone covers 0–37.5%
const MIDDLE_ZONE_END = 62.5;  // middle zone covers 37.5–62.5%
// right zone covers remainder up until -100%

const SPAWN_JIGGLE_MS = 600; // max random delay between simultaneous spawns

export default function FallingCards() {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeCards = useRef(0);
    const MAX_CARDS = 300;
    const lastSpawnTime = useRef(Date.now());
    const activeCardIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        const container = containerRef.current!;

        const spawnCard = () => {
            const now = Date.now();
            if (now - lastSpawnTime.current > 1000) {
                // tab was inactive, skip the backlog
                lastSpawnTime.current = now;
                return;
            }
            lastSpawnTime.current = now;
            for (let i = 0; i < SPAWNS_PER_TICK; i++) {
                if (Math.random() > SPAWN_CHANCE) continue;
                if (activeCards.current >= MAX_CARDS) return;

                const delay = Math.random() * SPAWN_JIGGLE_MS;
                setTimeout(() => {
                    if (activeCards.current >= MAX_CARDS) return;
                    activeCards.current++;

                    const cardIndices = Object.values(ArcanaIdentities).filter(v => v !== ArcanaIdentities.BACK) as number[];
                    const randomIndex = cardIndices[Math.floor(Math.random() * cardIndices.length)];
                    if (activeCardIds.current.has(randomIndex)) return;
                    activeCardIds.current.add(randomIndex);

                    let isFlipped = (Math.random() * 100 | 0) % 2 === 1;
                    let frontUri = ARCANA_IMAGE_URI[(isFlipped ? ArcanaIdentities.BACK : randomIndex) as keyof typeof ARCANA_IMAGE_URI][0]?.uri;
                    let backUri = ARCANA_IMAGE_URI[(isFlipped ? randomIndex : ArcanaIdentities.BACK) as keyof typeof ARCANA_IMAGE_URI][0]?.uri;

                    const card = document.createElement('div');
                    card.className = 'falling-card';
                    const rand = Math.random() * (LEFT_ZONE_CHANCE + MIDDLE_ZONE_CHANCE + RIGHT_ZONE_CHANCE);
                    const left = rand < LEFT_ZONE_CHANCE
                        ? Math.random() * LEFT_ZONE_END
                        : rand < LEFT_ZONE_CHANCE + MIDDLE_ZONE_CHANCE
                            ? LEFT_ZONE_END + Math.random() * (MIDDLE_ZONE_END - LEFT_ZONE_END)
                            : MIDDLE_ZONE_END + Math.random() * (100 - MIDDLE_ZONE_END);

                    card.style.left = `${left}%`;
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
                            activeCardIds.current.delete(randomIndex);
                        }
                    });
                }, delay);
            };

        }
        const interval = setInterval(spawnCard, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={containerRef} className="falling-cards-container" />
    );
}