import './CardSequenceBackground.css';
import { proxyImageUrl } from '../../utilities/proxy-image-url';

const BACKGROUND_URL = 'https://image.api.playstation.com/vulcan/ap/rnd/202204/2111/bkE38eKm1en1mVblRmsWjmgA.png';

export function CardSequenceBackground({ objectPosition = '30%', zIndex = -1 }: { objectPosition?: string; zIndex?: number }) {
    return (
        <img
            src={proxyImageUrl(BACKGROUND_URL, window.innerWidth, window.innerHeight)}
            className="background-image"
            style={{ objectPosition, zIndex }}
        />
    );
}
