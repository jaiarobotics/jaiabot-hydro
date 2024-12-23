import Waypoint from "./waypoint";

export default class Waypoints {
    private waypoints: Map<number, Waypoint>;

    constructor() {
        this.waypoints = new Map<number, Waypoint>();
    }

    getWaypoints() {
        return this.waypoints;
    }

    setWaypoints(waypoints: Map<number, Waypoint>) {
        this.waypoints = waypoints;
    }

    addWaypoint(waypoint: Waypoint) {
        this.getWaypoints().set(waypoint.getWaypointID(), waypoint);
    }

    deleteWaypoint(waypointID: number) {
        this.getWaypoints().delete(waypointID);
    }

    moveWaypoint(waypointID: number, lat: number, lon: number) {
        let waypoint = this.getWaypoints().get(waypointID);
        waypoint.setLat(lat);
        waypoint.setLon(lon);
    }
}
