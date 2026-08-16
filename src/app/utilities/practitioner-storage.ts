import type { Practitioner } from '../../types/practitioner';

const STORAGE_KEY = 'practitioners';
const SEEN_KEY = 'practitioners_seen';

export function loadPractitioners(): Practitioner[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        console.debug('[Practitioners] Loaded', list.length, 'practitioners:', list);
        return list;
    } catch {
        console.debug('[Practitioners] Failed to load, returning empty list');
        return [];
    }
}

export function savePractitioners(practitioners: Practitioner[]) {
    console.debug('[Practitioners] Saving', practitioners.length, 'practitioners:', practitioners);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(practitioners));
}

export function createPractitioner(): Practitioner {
    const practitioner: Practitioner = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };
    console.debug('[Practitioners] Creating new practitioner:', practitioner);
    const list = loadPractitioners();
    list.unshift(practitioner);
    savePractitioners(list);
    setHasNewPractitioners(true);
    return practitioner;
}

export function updatePractitioner(id: string, updates: Partial<Pick<Practitioner, 'birthDate' | 'name' | 'birthTime' | 'birthLocation' | 'birthLatitude' | 'birthLongitude' | 'birthTimezone'>>) {
    console.debug('[Practitioners] Updating practitioner', id, 'with:', updates);
    const list = loadPractitioners();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        console.debug('[Practitioners] Updated practitioner:', list[idx]);
        savePractitioners(list);
    } else {
        console.debug('[Practitioners] Practitioner not found for update:', id);
    }
}

export function deduplicatePractitioners(): Practitioner[] {
    const list = loadPractitioners();
    console.debug('[Practitioners] Deduplicating', list.length, 'practitioners');
    list.sort((a, b) => b.createdAt - a.createdAt);

    const seen = new Set<string>();
    const deduped: Practitioner[] = [];
    const removed: Practitioner[] = [];

    for (const p of list) {
        const key = `${p.birthDate ?? ''}|${p.name ?? ''}`;
        if (key === '|') {
            console.debug('[Practitioners] Skipping empty practitioner:', p.id);
            removed.push(p);
            continue;
        }
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(p);
        } else {
            console.debug('[Practitioners] Removing duplicate:', p.id, 'key:', key);
            removed.push(p);
        }
    }

    console.debug('[Practitioners] Deduplication result:', deduped.length, 'kept,', removed.length, 'removed');
    console.debug('[Practitioners] Final list:', deduped);
    savePractitioners(deduped);
    return deduped;
}

export function hasNewPractitioners(): boolean {
    return localStorage.getItem(SEEN_KEY) === 'true';
}

export function setHasNewPractitioners(value: boolean) {
    localStorage.setItem(SEEN_KEY, value ? 'true' : 'false');
}

export function formatDOB(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}
