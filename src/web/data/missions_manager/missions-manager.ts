class MissionsManager {
    private botsToMissions: Map<number, number>;
    private missionsToBots: Map<number, number>;

    constructor() {
        this.botsToMissions = new Map<number, number>();
        this.missionsToBots = new Map<number, number>();
    }

    getMission(botID: number) {
        return this.botsToMissions.get(botID);
    }

    getBot(missionID: number) {
        return this.missionsToBots.get(missionID);
    }

    assign(botID: number, missionID: number) {
        this.botsToMissions.set(botID, missionID);
        this.missionsToBots.set(missionID, botID);
    }
}

export const missionsManager = new MissionsManager();
