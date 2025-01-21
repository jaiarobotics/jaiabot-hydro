// Jaia Imports
import { CommandInfo } from "../../types/commands";
import { MissionInterface, RunInterface } from "../CommandControl/CommandControl";
import { MissionState } from "../../utils/protobuf-types";
import Mission from "../../data/missions/mission";

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
    botID?: number,
    downloadQueue?: number[],
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

    if (botID && downloadQueue) {
        const downloadQueueBotIds = downloadQueue;
        if (downloadQueueBotIds.includes(botID)) {
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

// TODO Rework, Runs are no longer defined in JCC
export function disableClearRunButton(mission: Mission) {
    let disableInfo: DisableInfo;

    disableInfo = {
        isDisabled: false,
        disableMessage: "",
    };

    if (!mission) {
        disableInfo.disableMessage = "Cannot perform this action because there is no run to delete";
        disableInfo.isDisabled = true;
    }

    return disableInfo;
}

export function disablePlayButton(
    botID: number,
    mission: Mission,
    command: CommandInfo,
    missionState: MissionState,
    downloadQueue: number[],
) {
    let disableInfo: DisableInfo;

    disableInfo = {
        isDisabled: false,
        disableMessage: "",
    };

    if (!mission) {
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

    const downloadQueueBotIds = downloadQueue;
    if (downloadQueueBotIds.includes(botID)) {
        disableInfo.disableMessage +=
            "The command: " +
            command.commandType +
            " cannot be sent because the bot because it is in the data offload queue\n";
        disableInfo.isDisabled = true;
    }

    return disableInfo;
}
