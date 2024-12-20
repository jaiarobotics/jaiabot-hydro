import Task from "../tasks/task";

export default class Waypoint {
    private waypointID: number;
    private lat: number;
    private lon: number;
    private task: Task;
    private canMove: boolean;

    constructor() {}

    getWaypointID() {
        return this.waypointID;
    }

    setWaypointID(waypointID: number) {
        this.waypointID = waypointID;
    }

    getLat() {
        return this.lat;
    }

    setLat(lat: number) {
        this.lat = lat;
    }

    getLon() {
        return this.lon;
    }

    setLon(lon: number) {
        this.lon = lon;
    }

    getTask() {
        return this.task;
    }

    setTask(task: Task) {
        this.task = task;
    }

    getCanMove() {
        return this.canMove;
    }

    setCanMove(canMove: boolean) {
        this.canMove = canMove;
    }
}
