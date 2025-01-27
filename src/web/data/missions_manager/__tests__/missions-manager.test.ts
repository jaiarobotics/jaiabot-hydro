import { missionsManager } from "../missions-manager";

test("Assign two Bots to two different missions then swap assignments", () => {
    let botID1 = 1;
    let missionID1 = 1;

    let botID2 = 2;
    let missionID2 = 2;

    let botIDUnassigned = -1;

    // Assign Bot 1 to Mission 1
    missionsManager.assign(botID1, missionID1);
    expect(missionsManager.getBot(missionID1)).toBe(botID1);
    expect(missionsManager.getMission(botID1)).toBe(missionID1);

    // Assign Bot 2 to Mission 2
    missionsManager.assign(botID2, missionID2);
    expect(missionsManager.getBot(missionID2)).toBe(botID2);
    expect(missionsManager.getMission(botID2)).toBe(missionID2);

    // Unassign Bot 2 from Mission 2
    missionsManager.assign(botIDUnassigned, missionID2);
    expect(missionsManager.getBot(missionID2)).toBe(botIDUnassigned);

    // Assign Bot 2 to Mission 1
    missionsManager.assign(botID2, missionID1);
    expect(missionsManager.getBot(missionID1)).toBe(botID2);
    expect(missionsManager.getMission(botID2)).toBe(missionID1);

    // Assign Bot 1 to Mission 2
    missionsManager.assign(botID1, missionID2);
    expect(missionsManager.getBot(missionID2)).toBe(botID1);
    expect(missionsManager.getMission(botID1)).toBe(missionID2);
});
