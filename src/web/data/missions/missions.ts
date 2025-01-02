import Mission from "./mission";

class Missions {
    private missions: Mission[];

    constructor() {
        this.missions = [];
    }

    getMissions() {
        return this.missions;
    }

    setMissions(missions: Mission[]) {
        this.missions = missions;
    }

    getMission(missionNum: number) {
        if (missionNum > 0 && missionNum <= this.getMissions().length) {
            return this.getMissions()[missionNum - 1];
        }
        return null;
    }

    addMission(mission: Mission) {
        this.getMissions().push(mission);
    }

    addMissionSet(missionSet: Mission[]) {
        this.getMissions().push(...missionSet);
    }

    deleteMission(missionNum: number) {
        let missions = this.getMissions();

        // Remove last mission in constant time
        if (missionNum === missions.length) {
            missions.pop();
        }
        // Remove other missions in linear time
        else {
            this.setMissions(
                missions.filter((mission, index) => {
                    if (index + 1 != missionNum) {
                        return mission;
                    }
                }),
            );
        }
    }

    deleteAllMissions() {
        this.setMissions([]);
    }
}

export const missions = new Missions();
