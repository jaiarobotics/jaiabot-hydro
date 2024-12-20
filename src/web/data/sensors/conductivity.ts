export default class Conductivity {
    private conductivity: number;
    private salinity: number;

    constructor() {}

    getConductivty() {
        return this.conductivity;
    }

    setConductivty(conductivity: number) {
        this.conductivity = conductivity;
    }

    getSalinity() {
        return this.salinity;
    }

    setSalinity(salinity: number) {
        this.salinity = salinity;
    }
}
