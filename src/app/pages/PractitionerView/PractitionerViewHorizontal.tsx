import './PractitionerViewHorizontal.css';
import { useMemo, useState, useRef, useEffect } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarHorizontal } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardFace from '../../components/ArcanaCard/CardFace';
import CardSplay from '../../components/CardSplay/CardSplay';
import { ArcanaIdentities } from '../../constants/arcana-identities';
import { ASTROLOGICAL_HOUSE_CARDS } from '../../constants/data/astrological-houses';
import type { CardData } from '../../../types/card-data';
import type { PageIdentity } from '../../../types/page-identity';

type CardCategory = {
    label: string;
    editLabel: string;
    cards: CardData[];
    stackPage: PageIdentity;
    editPage: PageIdentity;
    /** Overrides the default hasCards ? stackPage : editPage rule. */
    resolveTarget?: () => PageIdentity;
};

export default function PractitionerViewHorizontal({
    birthTime,
    birthLocation,
    birthdateCards,
    nameCards,
    growthCards,
    onHome,
    navigate,
}: {
    birthTime: string;
    birthLocation: string;
    birthdateCards: CardData[];
    nameCards: CardData[];
    growthCards: CardData[];
    onHome: () => void;
    navigate: (page: PageIdentity) => void;
}) {
    const cardWidth = useMemo(() => Math.min(window.innerWidth * 0.18, 200), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

    // Mini growth card sizing — the peek card floating above the corner button.
    const miniCardWidth = useMemo(() => Math.min(window.innerWidth * 0.07, 80), []);
    const miniCardHeight = useMemo(() => Math.round(miniCardWidth * 1.5), [miniCardWidth]);

    // The current calendar year's growth card. buildGrowthPreviewCards places
    // it LAST (the panel convention fronts the last card). Null when there's
    // no birth date → the mini card is hidden entirely.
    const currentGrowthCard = growthCards.length > 0
        ? growthCards[growthCards.length - 1]
        : null;

    // Tap-to-splay-then-navigate. Touch has no :hover, so the first tap must
    // fan the cards out and only navigate once the splay finishes. Mouse hovers
    // pre-mark the card as splayed via onPointerEnter (pointerType === 'mouse'
    // only — mobile fires synthetic mouseenter on tap, which we must ignore),
    // so desktop stays hover → splay → instant click.
    // 380ms = CardSplay.css transition (0.35s) + small render buffer.
    const SPLAY_MS = 380;
    const [splayedKey, setSplayedKey] = useState<string | null>(null);
    const navTimer = useRef<number | undefined>(undefined);

    const handleSelect = (cat: CardCategory) => {
        const hasCards = cat.cards.length > 0;
        const target = cat.resolveTarget
            ? cat.resolveTarget()
            : (hasCards ? cat.stackPage : cat.editPage);
        if (splayedKey === cat.label) {
            // Already splayed (hover pre-marked it, or this is a second tap) →
            // navigate immediately, no extra delay.
            if (navTimer.current) window.clearTimeout(navTimer.current);
            navigate(target);
        } else {
            setSplayedKey(cat.label);
            if (navTimer.current) window.clearTimeout(navTimer.current);
            navTimer.current = window.setTimeout(() => navigate(target), SPLAY_MS);
        }
    };

    // Cancel any navigation still pending if we unmount mid-splay.
    useEffect(() => () => {
        if (navTimer.current) window.clearTimeout(navTimer.current);
    }, []);

    const categories: CardCategory[] = [
        {
            label: 'Date Cards',
            editLabel: 'Edit Date',
            cards: birthdateCards,
            stackPage: 'birthdate-card-stack',
            editPage: 'date-selector',
        },
        {
            label: 'Name Cards',
            editLabel: 'Edit Name',
            cards: nameCards,
            stackPage: 'name-card-stack',
            editPage: 'name-entry',
        },
        {
            label: 'Astrological Houses',
            editLabel: 'Edit Time',
            // Only front the house cards once the full natal details are in —
            // the houses reading needs BOTH birth time and birth location.
            // Until then the panel shows the placeholder face (no fan), and
            // resolveTarget below routes the tap to the missing workflow step.
            cards: birthTime && birthLocation ? ASTROLOGICAL_HOUSE_CARDS : [],
            stackPage: 'astrological-houses',
            editPage: 'nativety-time-entry',
            // Resume the workflow at the step after the last completed one:
            //   birthLocation set  -> astrological houses
            //   birthTime set      -> birth-location-entry
            //   neither            -> nativety-time-entry
            resolveTarget: () => birthLocation
                ? 'astrological-houses'
                : birthTime
                    ? 'birth-location-entry'
                    : 'nativety-time-entry',
        },
    ];

    return (
        <div className="practitioner-view-horizontal">
            <CardSequenceBackground objectPosition="center" />
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">
                    <p className="click-to-view">Click to view</p>

                    <div className="card-options">
                        {categories.map((cat) => {
                            const lastCard = cat.cards.length > 0
                                ? cat.cards[cat.cards.length - 1]
                                : null;

                            return (
                                <div
                                    className={`card-option ${splayedKey === cat.label ? 'splayed' : ''}`}
                                    key={cat.label}
                                    onPointerEnter={(e) => {
                                        if (e.pointerType === 'mouse') setSplayedKey(cat.label);
                                    }}
                                >
                                    <p className="card-label">{cat.label}</p>

                                    <div
                                        className="card-preview-wrap"
                                        onClick={() => handleSelect(cat)}
                                    >
                                        <CardSplay
                                            count={cat.cards.length - 1}
                                            cardWidth={cardWidth}
                                            cardHeight={cardHeight}
                                        />
                                        <div className="card-preview">
                                            <div className="card-overlay-label">
                                                <span>{cat.label}</span>
                                            </div>
                                            <CardFace
                                                cardId={lastCard ? ArcanaIdentities[lastCard.card] : ArcanaIdentities.THELEMA}
                                                cardWidth={cardWidth}
                                                cardHeight={cardHeight}
                                                isOptimised
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="edit-link"
                                        onClick={() => navigate(cat.editPage)}
                                    >
                                        {cat.editLabel}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="growth-cards-corner">
                {currentGrowthCard && (
                    <div
                        className="growth-mini-card"
                        onClick={() => navigate('growth-card-carousel')}
                    >
                        <div className="growth-mini-card-face">
                            <CardFace
                                cardId={ArcanaIdentities[currentGrowthCard.card]}
                                cardWidth={miniCardWidth}
                                cardHeight={miniCardHeight}
                                isOptimised
                            />
                        </div>
                        <span className="growth-mini-year">{new Date().getFullYear()}</span>
                    </div>
                )}
                <button
                    className="growth-cards-corner-button"
                    onClick={() => navigate('growth-card-carousel')}
                >
                    Growth Cards
                </button>
            </div>
        </div>
    );
}
