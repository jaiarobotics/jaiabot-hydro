import Mission from "./mission";

class Missions {
    private missions: Map<number, Mission>;

    constructor() {
        this.missions = new Map<number, Mission>();
    }

    getMissions() {
        return this.missions;
    }

    setMissions(missions: Map<number, Mission>) {
        this.missions = missions;
    }

    addMission(mission: Mission) {
        this.getMissions().set(mission.getMissionID(), mission);
    }

    addMissions(missions: Map<number, Mission>) {}

    deleteMission(missionID: number) {
        this.getMissions().delete(missionID);
    }

    deleteAllMissions() {
        const missionIDs = this.getMissions().keys();
        for (let missionID of missionIDs) {
            this.deleteMission(missionID);
        }
    }
}

export const missions = new Missions();
