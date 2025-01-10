interface XYCoordinate {
    x: number;
    y: number;
}

export function angleToXY(angle: number): XYCoordinate {
    return { x: Math.cos(Math.PI / 2 - angle), y: -Math.sin(Math.PI / 2 - angle) };
}
