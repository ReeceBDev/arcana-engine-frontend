import './PractitionerViewHorizontal.css';
import { useMemo } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarHorizontal } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardFace from '../../components/ArcanaCard/CardFace';
import { ArcanaIdentities } from '../../constants/arcana-identities';
import type { CardData } from '../../../types/card-data';
import type { PageIdentity } from '../../../types/page-identity';

type CardCategory = {
    label: string;
    editLabel: string;
    cards: CardData[];
    stackPage: PageIdentity;
    editPage: PageIdentity;
};

export default function PractitionerViewHorizontal({
    birthdateCards,
    nameCards,
    growthCards,
    onHome,
    navigate,
}: {
    birthdateCards: CardData[];
    nameCards: CardData[];
    growthCards: CardData[];
    onHome: () => void;
    navigate: (page: PageIdentity) => void;
}) {
    const cardWidth = useMemo(() => Math.min(window.innerWidth * 0.18, 200), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

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
            label: 'Growth Cards',
            editLabel: 'Edit Time',
            cards: growthCards,
            stackPage: 'growth-card-stack',
            editPage: 'nativety-time-entry',
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
                            const hasCards = cat.cards.length > 0;

                            return (
                                <div className="card-option" key={cat.label}>
                                    <p className="card-label">{cat.label}</p>

                                    <div
                                        className="card-preview"
                                        onClick={() => navigate(hasCards ? cat.stackPage : cat.editPage)}
                                    >
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
        </div>
    );
}
