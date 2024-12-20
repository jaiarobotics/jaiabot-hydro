export default class Pressure {
    private pressure: number;
    private depth: number;

    constructor() {}

    getPressure() {
        return this.pressure;
    }

    setPressure(pressure: number) {
        this.pressure = pressure;
    }

    getDepth() {
        return this.depth;
    }

    setDepth(depth: number) {
        this.depth = depth;
    }
}
