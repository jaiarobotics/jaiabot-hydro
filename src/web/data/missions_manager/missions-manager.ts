class MissionsManager {
    private botsToMissions: Map<number, number>;
    private missionsToBots: Map<number, number>;

    readonly UNASSIGNED_ID = -1;

    constructor() {
        this.botsToMissions = new Map<number, number>();
        this.missionsToBots = new Map<number, number>();
    }

    getMission(botID: number) {
        return this.botsToMissions.get(botID) ?? this.UNASSIGNED_ID;
    }

    getBot(missionID: number) {
        return this.missionsToBots.get(missionID) ?? this.UNASSIGNED_ID;
    }

    assign(botID: number, missionID: number) {
        // Reset Bot previously assigned to mission
        const previousBotAssignment = this.getBot(missionID);

        if (previousBotAssignment) {
            this.botsToMissions.set(previousBotAssignment, this.UNASSIGNED_ID);
        }

        // We do not need a key of (-1) in the botsToMissions map
        if (botID !== this.UNASSIGNED_ID) {
            this.botsToMissions.set(botID, missionID);
        }

        this.missionsToBots.set(missionID, botID);
    }
}

export const missionsManager = new MissionsManager();
