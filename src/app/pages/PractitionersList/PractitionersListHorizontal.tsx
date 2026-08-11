import './PractitionersListHorizontal.css';
import { useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import type { Practitioner } from '../../../types/practitioner';
import { formatDOB } from '../../utilities/practitioner-storage';

export default function PractitionersListHorizontal({
    practitioners,
    onClose,
    onSelect,
    onClearAll,
}: {
    practitioners: Practitioner[];
    onClose: () => void;
    onSelect: (practitioner: Practitioner) => void;
    onClearAll: () => void;
}) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="practitioners-list-horizontal">
        <div className="practitioners-overlay">
            <CardSequenceBackground />
            <div className="practitioners-backdrop" onClick={onClose} />
            <div className="practitioners-panel">
                <div className="practitioners-top-bar">
                    <button className="practitioners-back" onClick={onClose}>←</button>
                    <button className="practitioners-bin" onClick={() => setShowConfirm(true)}>🗑</button>
                </div>
                <div className="practitioners-header">
                    <p className="practitioners-title">Past Practitioners</p>
                    <div className="practitioners-divider" />
                </div>
                <div className="practitioners-body">
                    {practitioners.length === 0 ? (
                        <p className="practitioners-empty">No practitioners yet.</p>
                    ) : (
                        practitioners.map(p => (
                            <div key={p.id} className="practitioner-row" onClick={() => onSelect(p)}>
                                <span className="practitioner-label">
                                    {p.name || (p.birthDate ? formatDOB(p.birthDate) : 'Unknown')}
                                </span>
                                <div className="practitioner-row-divider" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showConfirm && (
                <>
                    <div className="confirm-backdrop" onClick={() => setShowConfirm(false)} />
                    <div className="confirm-dialog">
                        <p className="confirm-title">Clear all Practitioner Data</p>
                        <div className="confirm-divider" />
                        <p className="confirm-message">This will clear all data permanently. Are you sure?</p>
                        <div className="confirm-actions">
                            <button className="confirm-yes" onClick={() => { setShowConfirm(false); onClearAll(); }}>Yes</button>
                            <button className="confirm-no" onClick={() => setShowConfirm(false)}>No</button>
                        </div>
                    </div>
                </>
            )}
        </div>
        </div>
    );
}
