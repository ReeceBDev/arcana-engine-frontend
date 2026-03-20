export const reverseCustomEasePath = (path: string): string => {
    const flip = (n: number) => parseFloat((1 - n).toFixed(6));

    // Remove the M command and split into cubic bezier segments
    const withoutM = path.replace(/^M[\d.,\s]+C\s*/, '').trim();

    // Split into groups of 6 numbers (x1,y1 x2,y2 x,y per segment)
    const numbers = withoutM.match(/[\d.]+/g)!.map(Number);

    const segments: { cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number }[] = [];
    for (let i = 0; i < numbers.length; i += 6) {
        segments.push({
            cp1x: numbers[i],
            cp1y: numbers[i + 1],
            cp2x: numbers[i + 2],
            cp2y: numbers[i + 3],
            ex:   numbers[i + 4],
            ey:   numbers[i + 5],
        });
    }

    // Reconstruct full points including start (implicitly 0,0 from M)
    const points: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    segments.forEach(s => {
        points.push({ x: s.cp1x, y: s.cp1y });
        points.push({ x: s.cp2x, y: s.cp2y });
        points.push({ x: s.ex,   y: s.ey   });
    });

    // Flip all points and reverse order
    const flipped = points.map(p => ({ x: flip(p.x), y: flip(p.y) }));
    flipped.reverse();

    // Rebuild segments
    const reversedSegments: { cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number }[] = [];
    for (let i = 1; i < flipped.length; i += 3) {
        reversedSegments.push({
            cp1x: flipped[i].x,
            cp1y: flipped[i].y,
            cp2x: flipped[i + 1].x,
            cp2y: flipped[i + 1].y,
            ex:   flipped[i + 2].x,
            ey:   flipped[i + 2].y,
        });
    }

    // Build path string
    const start = flipped[0];
    let result = `M${start.x},${start.y} C`;
    result += reversedSegments.map(s =>
        `${s.cp1x},${s.cp1y} ${s.cp2x},${s.cp2y} ${s.ex},${s.ey}`
    ).join(' ');

    return result;
};