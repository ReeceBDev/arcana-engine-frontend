import './MainPageHorizontal.css';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import type { PageIdentity } from '../../../types/page-identity.ts';
import Spacer from '../../../assets/iconography/spacer.svg?react';
import FallingCards from '../../components/FallingCards.tsx';
import type { DeckConfig } from '../../constants/page-orientations.tsx';

interface Props {
  navigate: (base: PageIdentity, config?: Partial<DeckConfig>) => void;
  resetWorkflow: () => void;
  hasNewPractitioners: boolean;
}

export default function MainMenuHorizontal({ navigate, resetWorkflow, hasNewPractitioners }: Props) {
    return (
        <div className="main-page-horizontal">
            <CardSequenceBackground zIndex={0} />
            <FallingCards fallDuration={1}/>
            <div className="header-text-container">
                <div className="crowley-container">
                    <p className="text-crowley">Alastair Crowley's</p>
                    <div className="right-spacer" />
                </div>
                <p className="text-title">Thoth Tarot</p>
                <p className="text-slogan">Find the colour of your soul...</p>
            </div>
            <div className="footer-segment">
                <div className="nav-control-container">
                    <button className="begin-button" onClick={() => {resetWorkflow(); navigate('card-finder-introduction-part-1')}}>~ Begin ~</button>
                    <ColouredSplit colour={'red'} />
                    <button className="deck-viewer-button" onClick={() => navigate('deck-viewer')}>Deck Viewer</button>
                    <ColouredSplit colour={'blue'} />
                    <button onClick={() => navigate('card-finder-introduction-part-1')}>Find your Cards</button>
                    <ColouredSplit colour={'yellow'} />
                    <button className={`practitioners-button${hasNewPractitioners ? ' practitioners-pulse' : ''}`} onClick={() => navigate('practitioners-list')}>Practitioners</button>
                    <ColouredSplit colour={'green'} />
                    <button className="faq-button" onClick={() => navigate('card-stack')}>FAQ</button>
                </div>
            </div>
        </div>
    )
}

function ColouredSplit({ colour }: { colour: string }) {
    return (
        <Spacer className="coloured-split" style={{ color: colour }} />
    )
}