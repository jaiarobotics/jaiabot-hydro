import { missions } from "../../missions/missions";
import {
    missionA,
    missionB,
    missionC,
    missionD,
    missionE,
    missionF,
} from "../../tests/__mocks__/mission-mock";

describe("operator adding and deleting single missions", () => {
    test("adds first mission", () => {
        missions.addMission(missionA);
        expect(missions.getMissions().size).toBe(1);
        expect(missions.getMission(1).getMissionID()).toBe(missionA.getMissionID());
    });

    test("adds second mission", () => {
        missions.addMission(missionB);
        expect(missions.getMissions().size).toBe(2);
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
    });

    test("adds third mission", () => {
        missions.addMission(missionC);
        expect(missions.getMissions().size).toBe(3);
        expect(missions.getMission(3).getMissionID()).toBe(missionC.getMissionID());
    });

    test("adds fourth mission", () => {
        missions.addMission(missionD);
        expect(missions.getMissions().size).toBe(4);
        expect(missions.getMission(4).getMissionID()).toBe(missionD.getMissionID());
    });

    test("deletes first mission", () => {
        missions.deleteMission(1);
        expect(missions.getMissions().size).toBe(3);
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
        expect(missions.getMission(3).getMissionID()).toBe(missionC.getMissionID());
        expect(missions.getMission(4).getMissionID()).toBe(missionD.getMissionID());
    });

    test("deletes middle mission", () => {
        missions.deleteMission(3);
        expect(missions.getMissions().size).toBe(2);
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
        expect(missions.getMission(4).getMissionID()).toBe(missionD.getMissionID());
    });

    test("deletes last mission", () => {
        missions.deleteMission(4);
        expect(missions.getMissions().size).toBe(1);
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
    });

    test("reset missions singleton", () => {
        // Keep as the last "test" in the suite
        missions.deleteAllMissions();
    });
});

describe("operator adding and deleting multiple missions at once", () => {
    const missionSet1 = [missionA, missionB, missionC, missionD];
    const missionSet2 = [missionE, missionF];

    test("operator adds four missions", () => {
        expect(missions.getMissions().size).toBe(0);
        missions.addMissionSet(missionSet1);
        expect(missions.getMissions().size).toBe(4);
        expect(missions.getMission(1).getMissionID()).toBe(missionA.getMissionID());
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
        expect(missions.getMission(3).getMissionID()).toBe(missionC.getMissionID());
        expect(missions.getMission(4).getMissionID()).toBe(missionD.getMissionID());
    });

    test("operator deletes all missions", () => {
        missions.deleteAllMissions();
        expect(missions.getMissions().size).toBe(0);
    });

    test("operator appends mission set to existing missions", () => {
        expect(missions.getMissions().size).toBe(0);
        missions.addMissionSet(missionSet1);
        expect(missions.getMissions().size).toBe(4);
        missions.addMissionSet(missionSet2);
        expect(missions.getMissions().size).toBe(6);
        expect(missions.getMission(1).getMissionID()).toBe(missionA.getMissionID());
        expect(missions.getMission(2).getMissionID()).toBe(missionB.getMissionID());
        expect(missions.getMission(3).getMissionID()).toBe(missionC.getMissionID());
        expect(missions.getMission(4).getMissionID()).toBe(missionD.getMissionID());
        expect(missions.getMission(5).getMissionID()).toBe(missionE.getMissionID());
        expect(missions.getMission(6).getMissionID()).toBe(missionF.getMissionID());
    });

    test("reset missions singleton", () => {
        // Keep as the last "test" in the suite
        missions.deleteAllMissions();
    });
});
