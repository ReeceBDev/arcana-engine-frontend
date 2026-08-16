import type { AspectInfo, AstroEvent, LiveAstroData, Placement, Span } from '../../utilities/astro/types';
import {
    ASPECT_GLYPH,
    describeAspect,
    describeEvent,
    describePlacement,
    isEventLive,
    isTimeLive,
    planetGlyph,
    signGlyph,
    spanEntries,
} from '../../utilities/astro/live';

/**
 * The text report beneath the chart: live events (explicitly called out),
 * current placements, and aspects — every row ending with the span triple
 * in the fixed order peaks → stops → started.
 *
 * Shared markup for both page orientations; styles live in
 * LiveAstrologyShared.css under `.lar-*` classes.
 */
export default function LiveAstroText({ data, now }: { data: LiveAstroData; now: number }) {
    const liveEvents = data.events.filter(e => isEventLive(e, now));

    return (
        <div className="lar-report">
            <div className="lar-legend">
                peaks — mid-sign / exact aspect &nbsp;·&nbsp; ends — leaves sign / orb &nbsp;·&nbsp; began — entered sign / orb
            </div>

            <h3 className="lar-heading">Live now</h3>
            {liveEvents.length === 0
                ? <p className="lar-empty">Nothing is crossing the now band this minute — the sky takes its time.</p>
                : liveEvents.map(e => <EventRow key={e.id} e={e} now={now} live />)}

            <h3 className="lar-heading">In the sky</h3>
            {data.placements.map(p => <PlacementRow key={p.planet} p={p} now={now} />)}

            <h3 className="lar-heading">Aspects</h3>
            {data.aspects.length === 0
                ? <p className="lar-empty">No pairs within orb at the moment.</p>
                : data.aspects.map(a => <AspectRow key={`${a.planetA}-${a.planetB}-${a.aspect}`} a={a} now={now} />)}
        </div>
    );
}

function EventRow({ e, now, live }: { e: AstroEvent; now: number; live?: boolean }) {
    return (
        <div className={`lar-row${live ? ' live' : ''}`}>
            <div className="lar-row-main">
                <span className="lar-glyphs">
                    {planetGlyph(e.planet)}
                    <span className="lar-glyph-sep">{'\u2192\uFE0E'}</span>
                    {signGlyph(e.sign)}
                </span>
                <span className="lar-sentence">{describeEvent(e)}</span>
                {live && <span className="lar-live-tag">LIVE</span>}
            </div>
            <SpanBlock span={e} now={now} />
        </div>
    );
}

function PlacementRow({ p, now }: { p: Placement; now: number }) {
    const live = isTimeLive(p.startedAt, now);
    return (
        <div className={`lar-row${live ? ' live' : ''}`}>
            <div className="lar-row-main">
                <span className="lar-glyphs">
                    {planetGlyph(p.planet)}
                    <span className="lar-glyph-sep"> </span>
                    {signGlyph(p.sign)}
                </span>
                <span className="lar-sentence">{describePlacement(p)}</span>
                {p.retrograde && <span className="lar-retro-tag">{'\u211E\uFE0E'}</span>}
                {live && <span className="lar-live-tag">LIVE</span>}
            </div>
            <SpanBlock span={p} now={now} />
        </div>
    );
}

function AspectRow({ a, now }: { a: AspectInfo; now: number }) {
    return (
        <div className="lar-row">
            <div className="lar-row-main">
                <span className="lar-glyphs">
                    {planetGlyph(a.planetA)}
                    <span className="lar-glyph-sep"> </span>
                    {ASPECT_GLYPH[a.aspect]}
                    <span className="lar-glyph-sep"> </span>
                    {planetGlyph(a.planetB)}
                </span>
                <span className="lar-sentence">{describeAspect(a)}</span>
            </div>
            <SpanBlock span={a} now={now} />
        </div>
    );
}

/**
 * The span triple as small right-aligned columns at the bottom of a row:
 * tense-aware label ("begins in 1h"), then date above time. Null peaks
 * degrade to a bare "does not perfect" note.
 */
function SpanBlock({ span, now }: { span: Span; now: number }) {
    return (
        <div className="lar-span">
            {spanEntries(span, now).map(entry => (
                <div key={entry.key} className="lar-span-entry">
                    <span className="lar-span-label">{entry.label}</span>
                    {entry.date && <span className="lar-span-date">{entry.date}</span>}
                    {entry.time && <span className="lar-span-time">{entry.time}</span>}
                </div>
            ))}
        </div>
    );
}
