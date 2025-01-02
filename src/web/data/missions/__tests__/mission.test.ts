import Mission from "../mission";
import { waypointA, waypointB, waypointC, waypointD } from "../../tests/__mocks__/waypoint-mock";

describe("operator adding and deleting single waypoints", () => {
    let mission = new Mission();

    test("adds first waypoint", () => {
        mission.addWaypoint(waypointA);
        expect(mission.getWaypoints().length).toBe(1);
        expect(mission.getWaypoint(1)).toBe(waypointA);
    });

    test("adds second waypoint", () => {
        mission.addWaypoint(waypointB);
        expect(mission.getWaypoints().length).toBe(2);
        expect(mission.getWaypoint(2)).toBe(waypointB);
    });

    test("adds third waypoint", () => {
        mission.addWaypoint(waypointC);
        expect(mission.getWaypoints().length).toBe(3);
        expect(mission.getWaypoint(3)).toBe(waypointC);
    });

    test("adds fourth waypoint", () => {
        mission.addWaypoint(waypointD);
        expect(mission.getWaypoints().length).toBe(4);
        expect(mission.getWaypoint(4)).toBe(waypointD);
    });

    test("deletes first waypoint", () => {
        mission.deleteWaypoint(1);
        expect(mission.getWaypoints().length).toBe(3);
        expect(mission.getWaypoint(1)).toBe(waypointB);
        expect(mission.getWaypoint(2)).toBe(waypointC);
        expect(mission.getWaypoint(3)).toBe(waypointD);
    });

    test("deletes middle waypoint", () => {
        mission.deleteWaypoint(2);
        expect(mission.getWaypoints().length).toBe(2);
        expect(mission.getWaypoint(1)).toBe(waypointB);
        expect(mission.getWaypoint(2)).toBe(waypointD);
    });

    test("deletes last waypoint", () => {
        mission.deleteWaypoint(2);
        expect(mission.getWaypoints().length).toBe(1);
        expect(mission.getWaypoint(1)).toBe(waypointB);
    });
});
