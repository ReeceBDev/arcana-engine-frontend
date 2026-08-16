import './LiveAstrologyShared.css';
import './LiveAstrologyHorizontal.css';
import { useEffect, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarHorizontal } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import LiveAstroTimeline from '../../components/LiveAstroTimeline/LiveAstroTimeline';
import LiveAstroText from './LiveAstroText';
import type { IconMode, LiveAstroData } from '../../utilities/astro/types';
import { loadLiveAstro } from '../../utilities/astro/live';

/** Icon modes cycle: planet → zodiac → superimposed (both experiments). */
const ICON_MODES: IconMode[] = ['super', 'planet', 'zodiac'];
const ICON_MODE_LABEL: Record<IconMode, string> = {
    planet: '\u2609\uFE0E Planets',
    zodiac: '\u2648\uFE0E Signs',
    super: '\u2609\uFE0E+\u2648\uFE0E Both',
};

/** How often the backend snapshot is refreshed (chart drift is local-clock). */
const REFRESH_MS = 10 * 60_000;

export default function LiveAstrologyHorizontal({ onHome }: { onHome: () => void }) {
    const [now, setNow] = useState(() => Date.now());
    const [data, setData] = useState<LiveAstroData | null>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [iconMode, setIconMode] = useState<IconMode>('super');

    // Local clock tick: drives the right-to-left drift and live-band detection.
    useEffect(() => {
        const tick = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const { data, isDemo } = await loadLiveAstro(Date.now());
            if (cancelled) return;
            setData(data);
            setIsDemo(isDemo);
        };
        load();
        const refresh = setInterval(load, REFRESH_MS);
        return () => { cancelled = true; clearInterval(refresh); };
    }, [])

    const cycleIconMode = () => {
        setIconMode(prev => ICON_MODES[(ICON_MODES.indexOf(prev) + 1) % ICON_MODES.length]);
    };

    return (
        <div className="live-astrology-horizontal live-astrology-root">
            <CardSequenceBackground />
            <TopNavBarHorizontal onHome={onHome} />
            <div className="la-header la-header-horizontal">
                <h1 className="la-title">Live Astrology</h1>
                {isDemo && <div className="la-demo-badge">demo sky</div>}
                <button className="la-icon-toggle" onClick={cycleIconMode}>
                    {ICON_MODE_LABEL[iconMode]}
                </button>
            </div>
            <div className="la-chart-holder la-chart-holder-horizontal">
                <LiveAstroTimeline events={data?.events ?? []} now={now} iconMode={iconMode} />
            </div>
            <div className="la-scroll la-scroll-horizontal">
                {data
                    ? <LiveAstroText data={data} now={now} />
                    : <p className="la-loading">Reading the sky&hellip;</p>}
            </div>
        </div>
    );
}
