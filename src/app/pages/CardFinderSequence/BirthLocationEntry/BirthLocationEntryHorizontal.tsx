import './BirthLocationEntryHorizontal.css';
import { useState } from "react";
import { BottomNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/CardSequenceBottomNavBar';
import { CardSequenceBackground } from '../../../components/CardSequenceBackground/CardSequenceBackground';
import cerebus from 'url:../../../../assets/images/cerebus.webp';
import { TopNavBarHorizontal } from '../../../components/CardSequenceBottomNavBar/TopNavBar';
import { type City, loadCities, searchCities, formatCityLabel } from '../../../utilities/citySearch';

export default function BirthLocationEntryHorizontal({ onHome, onSkip, onNext, onBack = undefined, showNext = false, showSkip = false, onSubmit }: {
    onHome: () => void;
    onSkip: () => void;
    onNext: () => void;
    onBack?: () => void;
    showNext?: boolean;
    showSkip?: boolean;
    onSubmit?: (city: City) => void;
}) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [selected, setSelected] = useState<City | null>(null);

    const onType = (value: string) => {
        console.debug('[BirthLocationEntry] onType: value="' + value + '"');
        setQuery(value);
        setSelected(null);
        if (!value.trim()) { console.debug('[BirthLocationEntry] onType: empty query, clearing suggestions'); setSuggestions([]); return; }
        const cities = loadCities();          // cached after first call
        const matches = searchCities(value, cities);
        console.debug('[BirthLocationEntry] onType: setting', matches.length, 'suggestions');
        setSuggestions(matches);
    };

    const onPick = (city: City) => {
        console.debug('[BirthLocationEntry] onPick:', city);
        setSelected(city);
        setQuery(formatCityLabel(city));
        setSuggestions([]);
    };

    // Enter on the input with suggestions visible → autocomplete the top result.
    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            onPick(suggestions[0]);
        }
    };

    const handleSubmit = () => {
        if (selected) onSubmit?.(selected);
        onNext();
    };

    return (
        <div className="birth-location-entry-horizontal">
            <CardSequenceBackground objectPosition="center" />
            {suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((c) => (
                        <li key={`${c.name}-${c.country}`}>
                            <button type="button" onClick={() => onPick(c)}>
                                {formatCityLabel(c)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">

                    <p className="input-prompt">Where were you born?</p>
                    <div className="autocomplete">
                        <input
                            type="text"
                            className="birth-input"
                            value={query}
                            autoComplete="off"
                            onChange={e => onType(e.currentTarget.value)}
                            onKeyDown={onInputKeyDown}
                        />
                    </div>
                    <p className="instructions">Search for your Birthplace...</p>

                    {selected && (
                        <button className="continue-button" onClick={handleSubmit}>
                            ~ Click to Submit ~
                        </button>
                    )}
                </div>
                <img src={cerebus} className="bottom-image" />
            </div>
            <BottomNavBarHorizontal onBack={onBack} onSkip={onSkip} onNext={onNext} showNext={showNext} showSkip={showSkip} skipLabel="Skip for now..." />
        </div>
    );
}
