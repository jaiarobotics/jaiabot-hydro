import Waypoints from "../waypoints";
import { waypointA, waypointB, waypointC, waypointD } from "../../tests/__mocks__/waypoints-mock";

let waypoints = new Waypoints();

test("adds first waypoint", () => {
    waypoints.addWaypoint(waypointA);
    expect(waypoints.getWaypoints().length).toBe(1);
    expect(waypoints.getWaypoint(1)).toBe(waypointA);
});

test("adds second waypoint", () => {
    waypoints.addWaypoint(waypointB);
    expect(waypoints.getWaypoints().length).toBe(2);
    expect(waypoints.getWaypoint(2)).toBe(waypointB);
});

test("adds third waypoint", () => {
    waypoints.addWaypoint(waypointC);
    expect(waypoints.getWaypoints().length).toBe(3);
    expect(waypoints.getWaypoint(3)).toBe(waypointC);
});

test("adds fourth waypoint", () => {
    waypoints.addWaypoint(waypointD);
    expect(waypoints.getWaypoints().length).toBe(4);
    expect(waypoints.getWaypoint(4)).toBe(waypointD);
});

test("deletes first waypoint", () => {
    waypoints.deleteWaypoint(1);
    expect(waypoints.getWaypoints().length).toBe(3);
    expect(waypoints.getWaypoint(1)).toBe(waypointB);
    expect(waypoints.getWaypoint(2)).toBe(waypointC);
    expect(waypoints.getWaypoint(3)).toBe(waypointD);
});

test("deletes middle waypoint", () => {
    waypoints.deleteWaypoint(2);
    expect(waypoints.getWaypoints().length).toBe(2);
    expect(waypoints.getWaypoint(1)).toBe(waypointB);
    expect(waypoints.getWaypoint(2)).toBe(waypointD);
});

test("deletes last waypoint", () => {
    waypoints.deleteWaypoint(2);
    expect(waypoints.getWaypoints().length).toBe(1);
    expect(waypoints.getWaypoint(1)).toBe(waypointB);
});
