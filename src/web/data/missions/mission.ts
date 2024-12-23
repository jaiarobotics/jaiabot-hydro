import Waypoints from "../waypoints/waypoints";

export default class Mission {
    private missionID: number;
    private waypoints: Waypoints;
    private repeats: number;
    private canEdit: boolean;
    private isBotAssigned: boolean;

    constructor() {}

    getMissionID() {
        return this.missionID;
    }

    setMissionID(missionID: number) {
        this.missionID = missionID;
    }

    getWaypoints() {
        return this.waypoints;
    }

    setWaypoints(waypoints: Waypoints) {
        this.waypoints = waypoints;
    }

    getRepeats() {
        return this.repeats;
    }

    setRepeats(repeats: number) {
        this.repeats = repeats;
    }

    getCanEdit() {
        return this.canEdit;
    }

    setCanEdit(canEdit: boolean) {
        this.canEdit = canEdit;
    }

    getIsBotAssigned() {
        return this.isBotAssigned;
    }

    setBotAssigned(isBotAssigned: boolean) {
        this.isBotAssigned = isBotAssigned;
    }
}
