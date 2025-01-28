import { missions } from "../missions/missions";
import { bots } from "../bots/bots";

import { convertMicrosecondsToSeconds } from "../../shared/Utilities";

class MissionsManager {
    private botsToMissions: Map<number, number>;
    private missionsToBots: Map<number, number>;

    readonly UNASSIGNED_ID = -1;
    readonly STATUS_AGE_MAX_SECONDS = 30;

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

    /**
     * Assigns available Bots to open missions. The Bot and mission assignments move from low IDs to high IDs
     *
     * @returns {void}
     */
    autoAssign() {
        for (let [missionID, mission] of missions.getMissions()) {
            if (this.getBot(mission.getMissionID()) === this.UNASSIGNED_ID) {
                if (this.getNextAvailableBotID() !== this.UNASSIGNED_ID) {
                    this.assign(this.getNextAvailableBotID(), mission.getMissionID());
                }
            }
        }
    }

    /**
     * Finds the lowest Bot ID that is not assigned to a mission
     *
     * @returns {number} Bot ID or (-1) if all Bots are already assigned to missions
     */
    getNextAvailableBotID() {
        for (let [botID, bot] of bots.getBots()) {
            if (
                this.getMission(bot.getBotID()) === this.UNASSIGNED_ID &&
                convertMicrosecondsToSeconds(bot.getStatusAge()) < this.STATUS_AGE_MAX_SECONDS
            ) {
                return bot.getBotID();
            }
        }
        return this.UNASSIGNED_ID;
    }

    clear() {
        this.botsToMissions.clear();
        this.missionsToBots.clear();
    }
}

export const missionsManager = new MissionsManager();
