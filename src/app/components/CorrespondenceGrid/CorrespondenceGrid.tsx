import type { Correspondence, CorrespondenceKind } from '../../constants/data/correspondence-types';
import { ELEMENT_COLOR } from '../../constants/data/correspondence-types';
import './CorrespondenceGrid.css';

/** Per-kind accent colour. Element kinds use their elemental colour. */
const KIND_ACCENT: Partial<Record<CorrespondenceKind, string>> = {
    zodiac: '#d9b34a',
    planet: '#cfd6df',
    hebrew: '#7aa2e6',
    godform: '#c79ae6',
    decan: '#d9b34a',
    sephirah: '#7aa2e6',
    path: '#7aa2e6',
    'element-in-element': '#d9b34a',
    color: '#e6a3a3',
    title: '#d9c79a',
    keyword: '#c8cfd8',
    modality: '#c8b08a',
    polarity: '#b8c8d9',
    alchemical: '#d9c8a2',
};

/**
 * Renders a wrapping grid of correspondence chips. Each chip shows a large
 * glyph (when available) and an always-visible label + optional sublabel, so
 * the entry stays readable even on a font that lacks the astrological symbol.
 */
export default function CorrespondenceGrid({ correspondences }: {
    correspondences: Correspondence[];
}) {
    if (!correspondences || correspondences.length === 0) return null;
    return (
        <div className="correspondence-grid">
            {correspondences.map((c, i) => (
                <CorrespondenceChip key={`${c.kind}-${i}`} c={c} />
            ))}
        </div>
    );
}

function CorrespondenceChip({ c }: { c: Correspondence }) {
    const accent = c.kind === 'element' && c.label
        ? ELEMENT_COLOR[c.label.toLowerCase() as keyof typeof ELEMENT_COLOR] ?? KIND_ACCENT[c.kind]
        : KIND_ACCENT[c.kind];
    return (
        <div className="corr-chip" style={accent ? { ['--corr-accent' as string]: accent } : undefined}>
            {/* U+FE0E (variation selector-15) forces text presentation — without
                it Android/iOS webviews render the zodiac/planet glyphs as emoji.
                Same trick as LiveAstroTimeline (see utilities/astro/live.ts). */}
            {c.glyph && <span className="corr-glyph">{c.glyph}{'\uFE0E'}</span>}
            <div className="corr-text">
                <span className="corr-label">{c.label}</span>
                {c.sublabel && <span className="corr-sublabel">{c.sublabel}</span>}
            </div>
        </div>
    );
}
