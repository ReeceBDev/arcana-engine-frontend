export function handleDateInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setShow: (v: boolean) => void,
    setError: (v: string | null) => void
) {
    const raw = e.currentTarget.value.replace(/\D/g, '').slice(0, 8);

    let v = raw;
    if (raw.length >= 4) {
        v = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length >= 2) {
        v = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }

    e.currentTarget.value = v;

    const parts = v.split('/');
    const dd = Number(parts[0]);
    const mm = Number(parts[1]);
    const yyyy = Number(parts[2]);
    const isFull = parts[2]?.length === 4;

    if (!isFull) { setShow(false); setError(null); return; }

    if (yyyy <= 1610) { setShow(false); setError('The Year must be after 1610...'); return; }
    if (mm < 1 || mm > 12) { setShow(false); setError('The Month must be between 1 and 12...'); return; }
    if (dd < 1 || dd > new Date(yyyy, mm, 0).getDate()) { setShow(false); setError(`The Day must be between 1 and ${new Date(yyyy, mm, 0).getDate()} for that month...`); return; }

    setShow(true);
    setError(null);
}

export function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
        const input = e.currentTarget;
        const v = input.value;
        if (v.endsWith('/')) {
            e.preventDefault();
            input.value = v.slice(0, -1);
        }
    }
    console.debug("User is entering into text entry:", e.key);
}