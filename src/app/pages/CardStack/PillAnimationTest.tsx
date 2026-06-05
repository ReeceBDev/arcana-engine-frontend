/**
 * Isolated animation sandbox — proves pill fold/unfold before integrating.
 * Two buttons: one slides text UP and fades out, swaps content, slides new content DOWN in.
 */
import { useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const LINES_A = [
    'The outward face you present to the world — the mask and the mirror.',
    'This card reveals the persona shaped by your date of birth.',
    'Derived from the numerological reduction of your birthday.',
];

const LINES_B = [
    'Archetype body text — the inner nature beneath the personality.',
    'Where the Personality Card is the mask, this is the face behind it.',
];

export default function PillAnimationTest() {
    const [showA, setShowA] = useState(true);
    const textRef = useRef<HTMLDivElement>(null);
    // Set by the click handler so useLayoutEffect knows new content just landed
    const pendingIn = useRef(false);

    // Fires synchronously after DOM update, before browser paints.
    // New content is already in the DOM — snap to invisible then animate in.
    useLayoutEffect(() => {
        if (!pendingIn.current) return;
        pendingIn.current = false;
        const el = textRef.current;
        if (!el) return;
        gsap.fromTo(el,
            { opacity: 0, y: -24 },
            { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }
        );
    }, [showA]);

    function animateOut(then: () => void) {
        const el = textRef.current;
        if (!el) return;
        gsap.to(el, {
            opacity: 0,
            y: -24,
            duration: 0.28,
            ease: 'power2.in',
            onComplete: () => {
                gsap.set(el, { clearProps: 'all' });
                then();
            }
        });
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 40, gap: 24, background: '#111', minHeight: '100vh', color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h3 style={{ margin: 0 }}>Pill animation test</h3>

            {/* Simulated pill */}
            <button
                onClick={() => animateOut(() => {
                    pendingIn.current = true;
                    setShowA(prev => !prev);
                })}
                style={{
                    borderRadius: 999, padding: '6px 20px',
                    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.4)',
                    color: 'white', cursor: 'pointer', fontSize: 14
                }}
            >
                {showA ? 'Show Archetype' : 'Show Descriptor'}
            </button>

            {/* Text block being animated */}
            <div ref={textRef} style={{ maxWidth: 340, textAlign: 'center', lineHeight: 1.6 }}>
                {showA
                    ? LINES_A.map((l, i) => <p key={i} style={{ margin: '6px 0' }}>{l}</p>)
                    : LINES_B.map((l, i) => <p key={i} style={{ margin: '6px 0' }}>{l}</p>)
                }
            </div>
        </div>
    );
}
