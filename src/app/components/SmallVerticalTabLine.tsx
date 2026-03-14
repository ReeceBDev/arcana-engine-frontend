import type { Property } from 'csstype';

export default function SmallVerticalTabLine({horizontalPadding, colour}: {horizontalPadding: number; colour: Property.Color}) {
    return (
        <div style={{ padding: horizontalPadding, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 4 }} />
            <div style={{ flex: 1, width: 1.2, backgroundColor: colour}} />
            <div style={{ flex: 4 }} />
        </div>
    )
}