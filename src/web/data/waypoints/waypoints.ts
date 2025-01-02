import Waypoint from "./waypoint";

export default class Waypoints {
    private waypoints: Waypoint[];

    constructor() {
        this.waypoints = [];
    }

    getWaypoints() {
        return this.waypoints;
    }

    setWaypoints(waypoints: Waypoint[]) {
        this.waypoints = waypoints;
    }

    getWaypoint(waypointNum: number) {
        if (waypointNum > 0 && waypointNum <= this.getWaypoints().length) {
            return this.getWaypoints()[waypointNum - 1];
        }
        return null;
    }

    addWaypoint(waypoint: Waypoint) {
        this.getWaypoints().push(waypoint);
    }

    deleteWaypoint(waypointNum: number) {
        let waypoints = this.getWaypoints();

        // Remove last waypoint in constant time
        if (waypointNum === waypoints.length) {
            waypoints.pop();
        }
        // Remove other waypoints in linear time
        else {
            this.setWaypoints(
                waypoints.filter((waypoint, index) => {
                    if (index + 1 != waypointNum) {
                        return waypoint;
                    }
                }),
            );
        }
    }
}
