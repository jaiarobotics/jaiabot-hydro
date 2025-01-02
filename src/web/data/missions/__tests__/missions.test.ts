import { missions } from "../../missions/missions";
import { missionA, missionB, missionC, missionD } from "../../tests/__mocks__/mission-mock";

describe("operator adding and deleting single missions", () => {
    test("adds first mission", () => {
        missions.addMission(missionA);
        expect(missions.getMissions().length).toBe(1);
        expect(missions.getMission(1)).toBe(missionA);
    });

    test("adds second mission", () => {
        missions.addMission(missionB);
        expect(missions.getMissions().length).toBe(2);
        expect(missions.getMission(2)).toBe(missionB);
    });

    test("adds third mission", () => {
        missions.addMission(missionC);
        expect(missions.getMissions().length).toBe(3);
        expect(missions.getMission(3)).toBe(missionC);
    });

    test("adds fourth mission", () => {
        missions.addMission(missionD);
        expect(missions.getMissions().length).toBe(4);
        expect(missions.getMission(4)).toBe(missionD);
    });

    test("deletes first mission", () => {
        missions.deleteMission(1);
        expect(missions.getMissions().length).toBe(3);
        expect(missions.getMission(1)).toBe(missionB);
        expect(missions.getMission(2)).toBe(missionC);
        expect(missions.getMission(3)).toBe(missionD);
    });

    test("deletes middle mission", () => {
        missions.deleteMission(2);
        expect(missions.getMissions().length).toBe(2);
        expect(missions.getMission(1)).toBe(missionB);
        expect(missions.getMission(2)).toBe(missionD);
    });

    test("deletes last mission", () => {
        missions.deleteMission(2);
        expect(missions.getMissions().length).toBe(1);
        expect(missions.getMission(1)).toBe(missionB);
    });

    test("reset missions singleton", () => {
        // Keep as the last "test" in the suite
        missions.deleteAllMissions();
    });
});

describe("operator adding and deleting multiple missions at once", () => {
    const missionSet1 = [missionA, missionB, missionC, missionD];
    const missionSet2 = [missionB, missionC];

    test("operator adds four missions", () => {
        expect(missions.getMissions().length).toBe(0);
        missions.addMissionSet(missionSet1);
        expect(missions.getMissions().length).toBe(4);
        expect(missions.getMission(1)).toBe(missionA);
        expect(missions.getMission(2)).toBe(missionB);
        expect(missions.getMission(3)).toBe(missionC);
        expect(missions.getMission(4)).toBe(missionD);
    });

    test("operator deletes all missions", () => {
        missions.deleteAllMissions();
        expect(missions.getMissions().length).toBe(0);
    });

    test("operator appends mission set to existing missions", () => {
        expect(missions.getMissions().length).toBe(0);
        missions.addMissionSet(missionSet1);
        expect(missions.getMissions().length).toBe(4);
        missions.addMissionSet(missionSet2);
        expect(missions.getMissions().length).toBe(6);
        expect(missions.getMission(1)).toBe(missionA);
        expect(missions.getMission(2)).toBe(missionB);
        expect(missions.getMission(3)).toBe(missionC);
        expect(missions.getMission(4)).toBe(missionD);
        expect(missions.getMission(5)).toBe(missionB);
        expect(missions.getMission(6)).toBe(missionC);
    });

    test("reset missions singleton", () => {
        // Keep as the last "test" in the suite
        missions.deleteAllMissions();
    });
});
