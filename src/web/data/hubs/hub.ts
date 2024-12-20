import {
    BotOffloadData,
    Error,
    GeographicCoordinate,
    HealthState,
    LinuxHardwareStatus,
    Warning,
} from "../../utils/protobuf-types";

export class Hub {
    private hubID: number;
    private fleetID: number;
    private healthState: HealthState;
    private errors: Error[];
    private warnings: Warning[];
    private location: GeographicCoordinate;
    private linuxHardwareStatus: LinuxHardwareStatus;
    private botOffload: BotOffloadData;
    private statusAge: number;

    constructor() {}

    getHubID() {
        return this.hubID;
    }

    setHubID(hubID: number) {
        this.hubID = hubID;
    }

    getFleetID() {
        return this.fleetID;
    }

    setFleetID(fleetID: number) {
        this.fleetID = fleetID;
    }

    getHealthState() {
        return this.healthState;
    }

    setHealthState(healthState: HealthState) {
        this.healthState = healthState;
    }

    getErrors() {
        return this.errors;
    }

    setErrors(errors: Error[]) {
        this.errors = errors;
    }

    getWarnings() {
        return this.warnings;
    }

    setWarnings(warnings: Warning[]) {
        this.warnings = warnings;
    }

    getLocation() {
        return this.location;
    }

    setLocation(location: GeographicCoordinate) {
        this.location = location;
    }

    getLinuxHardwareStatus() {
        return this.linuxHardwareStatus;
    }

    setLinuxHardwareStatus(linuxHardwareStatus: LinuxHardwareStatus) {
        this.linuxHardwareStatus = linuxHardwareStatus;
    }

    getBotOffload() {
        return this.botOffload;
    }

    setBotOffload(botOffload: BotOffloadData) {
        this.botOffload = botOffload;
    }

    getStatusAge() {
        return this.statusAge;
    }

    setStatusAge(statusAge: number) {
        this.statusAge = statusAge;
    }
}
