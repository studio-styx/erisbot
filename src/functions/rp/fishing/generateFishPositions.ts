
export type FishPosition = { x: number, y: number, caught: boolean };

export function generateFishPositions(count: number = 5): FishPosition[] {
    const positions: FishPosition[] = [];
    const maxX = 16;
    const maxY = 6;
    
    for (let i = 0; i < count; i++) {
        const data = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY),
            caught: false
        }

        if (positions.some(pos => pos.x === data.x && pos.y === data.y)) {
            i--;
            continue;
        }
        
        if (data.x === 0 && data.y === 0) {
            i--;
            continue;
        }

        positions.push(data);
    }
    
    return positions;
}