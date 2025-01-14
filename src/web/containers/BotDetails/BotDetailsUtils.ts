// Jaia Imports
import { CommandInfo } from "../../types/commands";
import { MissionInterface, RunInterface } from "../CommandControl/CommandControl";
import { MissionState } from "../../utils/protobuf-types";
import { PortalBotStatus } from "../../shared/PortalStatus";

interface DisableInfo {
    isDisabled: boolean;
    disableMessage: string;
}

// Check if there is a mission to run
export function runMission(botId: number, mission: MissionInterface) {
    let runs = mission.runs;
    let runId = mission.botsAssignedToRuns[botId];
    let run = runs[runId];

    if (run) {
        if (mission.runIdInEditMode === run.id) {
            mission.runIdInEditMode = "";
        }
        return run.command;
    } else {
        return null;
    }
}

/**
 * Checks if a details button should be disabled
 *
 * @param bot
 * @returns boolean
 */
export function disableButton(
    command: CommandInfo,
    missionState: MissionState,
    bot?: PortalBotStatus,
    downloadQueue?: PortalBotStatus[],
) {
    let disableInfo: DisableInfo;

    disableInfo = {
        isDisabled: true,
        disableMessage: "",
    };

    const statesAvailable = command.statesAvailable;
    const statesNotAvailable = command.statesNotAvailable;
    const humanReadableAvailable = command.humanReadableAvailable;
    const humanReadableNotAvailable = command.humanReadableNotAvailable;

    const disableMessage =
        "The command: " + command.commandType + " cannot be sent because the bot";
    const disableState =
        disableMessage +
        " is in the incorrect state." +
        `${humanReadableAvailable !== "" ? "\nAvailable States: " + humanReadableAvailable + "\n" : ""}` +
        `${humanReadableNotAvailable !== "" ? "States Not Available: " + humanReadableNotAvailable + "\n" : ""}`;

    if (statesAvailable) {
        for (let stateAvailable of statesAvailable) {
            if (stateAvailable.test(missionState)) {
                disableInfo.isDisabled = false;
                break;
            }
        }
    }

    if (statesNotAvailable) {
        for (let stateNotAvailable of statesNotAvailable) {
            if (stateNotAvailable.test(missionState)) {
                disableInfo.isDisabled = true;
                break;
            }
        }
    }

    if (disableInfo.isDisabled) {
        disableInfo.disableMessage += disableState;
    }

    if (bot && downloadQueue) {
        const downloadQueueBotIds = downloadQueue.map((bot) => bot.bot_id);
        if (downloadQueueBotIds.includes(bot.bot_id)) {
            disableInfo.isDisabled = true;
            disableInfo.disableMessage +=
                disableMessage +
                " currently preparing for data offload. Check the data offload queue panel. \n";
        }
    }
    return disableInfo;
}

/**
 * Checks if clear run button should be disabled
 *
 * @param bot
 * @returns boolean
 */
export function disableClearRunButton(bot: PortalBotStatus, mission: MissionInterface) {
    let disableInfo: DisableInfo;

    disableInfo = {
        isDisabled: false,
        disableMessage: "",
    };

    if (!mission?.botsAssignedToRuns[bot.bot_id]) {
        disableInfo.disableMessage = "Cannot perform this action because there is no run to delete";
        disableInfo.isDisabled = true;
    }

    return disableInfo;
}

export function disablePlayButton(
    bot: PortalBotStatus,
    mission: MissionInterface,
    command: CommandInfo,
    missionState: MissionState,
    downloadQueue: PortalBotStatus[],
) {
    let disableInfo: DisableInfo;

    disableInfo = {
        isDisabled: false,
        disableMessage: "",
    };

    if (!mission.botsAssignedToRuns[bot.bot_id]) {
        disableInfo.disableMessage +=
            "The command: " +
            command.commandType +
            " cannot be sent because the bot because it does not have a run available\n";
        disableInfo.isDisabled = true;
    }

    if (disableButton(command, missionState).isDisabled) {
        disableInfo.disableMessage += disableButton(command, missionState).disableMessage;
        disableInfo.isDisabled = true;
    }

    const downloadQueueBotIds = downloadQueue.map((bot) => bot.bot_id);
    if (downloadQueueBotIds.includes(bot.bot_id)) {
        disableInfo.disableMessage +=
            "The command: " +
            command.commandType +
            " cannot be sent because the bot because it is in the data offload queue\n";
        disableInfo.isDisabled = true;
    }

    return disableInfo;
}

// Should probably break up BotDetailsComponent so this can be isolated from React
export function getBotRun(botId: number, runs: { [key: string]: RunInterface }) {
    try {
        for (const runId of Object.keys(runs)) {
            if (runs[runId].assigned === botId) {
                return runs[runId];
            }
        }
    } catch (error) {
        console.error("Cannot getBotRun:\n", error);
        console.log("Cannot getBotRun:\n", error);
    }
    return null;
}
