// Jaia Imports
import { CommandInfo } from "../../types/commands";
import { MissionInterface, RunInterface } from "../CommandControl/CommandControl";
import { MissionState } from "../../utils/protobuf-types";
import { MissionStatus } from "../../types/jaia-system-types";
import Mission from "../../data/missions/mission";
import Waypoint from "../../data/waypoints/waypoint";
import Bot from "../../data/bots/bot";
import GPS from "../../data/sensors/gps";
import Hub from "../../data/hubs/hub";

import { HubContext } from "../../context/Hub/HubContext";

// Utility Imports
import * as turf from "@turf/turf";

/**
 * Provides class name and status age
 *
 * @returns { string , string }
 */

export function getStatusAge(bot: Bot) {
    const statusAge = Math.max(0.0, bot.getStatusAge() / 1e6);
    let statusAgeClassName: string;

    if (statusAge > 30) {
        statusAgeClassName = "healthFailed";
    } else if (statusAge > 10) {
        statusAgeClassName = "healthDegraded";
    }
    return { statusAge, statusAgeClassName };
}

/**
 * Provides distance from hub
 *
 * @returns {string}
 */
export function getDistToHub(bot: Bot, hub: Hub) {
    const botGPS: GPS = bot.getBotSensors().getGPS();
    const hubGPS: GPS = hub.getHubSensors().getGPS();

    let distToHub = "N/A";
    if (botGPS && hubGPS) {
        const botloc = turf.point([botGPS.getLat(), botGPS.getLon()]);
        const hubloc = turf.point([hubGPS.getLat(), hubGPS.getLon()]);
        const options = { units: "meters" as turf.Units };
        distToHub = turf.rhumbDistance(botloc, hubloc, options).toFixed(1);
    }
    return distToHub;
}

/**
 * Provides message for clicking on map
 *
 * @returns {string}
 */
// TODO Edit mode toggle and related items not functional
// until more functionality is add to the mission management
export function getClickOnMapString(mission: Mission) {
    let editString = "";
    if (mission?.getCanEdit()) {
        editString = "Click on the map to create waypoints";
    } else {
        editString = "Click edit toggle to create waypoint";
    }
    return editString;
}

/**
 * Provides off load percentage
 *
 * @returns {string}
 */
export function getBotOffloadPctString(botID: number, hub: Hub) {
    let botOffloadPercentage = "";

    if (botID === hub.getBotOffload()?.bot_id) {
        botOffloadPercentage = " " + hub.getBotOffload().data_offload_percentage + "%";
    }
    return botOffloadPercentage;
}

/**
 * Provides repeat status message
 *
 * @returns {string}
 */
export function getRepeatNumberString(mission: Mission, missionStatus: MissionStatus) {
    var repeatNumberString = "N/A";
    if (missionStatus?.repeat_index != null) {
        repeatNumberString = `${missionStatus.repeat_index + 1}`;

        if (mission?.getRepeats() != null) {
            repeatNumberString = repeatNumberString + ` of ${mission?.getRepeats()}`;
        }
    }
    return repeatNumberString;
}

/**
 * Checks if bot is logging
 *
 * @returns {boolean} The bot logging status
 */
export function isBotLogging(missionState: MissionState) {
    let botLogging = true;
    if (
        missionState == "PRE_DEPLOYMENT__IDLE" ||
        missionState == "PRE_DEPLOYMENT__FAILED" ||
        missionState?.startsWith("POST_DEPLOYMENT__")
    ) {
        botLogging = false;
    }
    return botLogging;
}

/**
 * Provides Active wapoint name and distance
 *
 * @returns {string , string}
 */

export function getActiveWptStrings(missionStatus: MissionStatus) {
    let activeWptString = missionStatus.activeGoal ?? "N/A";
    let distToWpt = missionStatus.distanceToActiveGoal ?? "N/A";

    if (activeWptString !== "N/A" && distToWpt === "N/A") {
        distToWpt = "Distance To Goal > 1000";
    } else if (activeWptString !== "N/A" && distToWpt !== "N/A") {
        distToWpt = distToWpt + " m";
    } else if (activeWptString === "N/A" && distToWpt !== "N/A") {
        activeWptString = "Recovery";
        distToWpt = distToWpt + " m";
    }

    return { activeWptString, distToWpt };
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

interface DisableInfo {
    isDisabled: boolean;
    disableMessage: string;
}

/**
 * Checks if a details button should be disabled
 *
 * @param bot
 * @returns boolean
 */
// TODO Look for ways to simplify this
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

// TODO function will not work until Mission Management is refactored
// missions are not being added to bots in the data model yet
export function toggleEditMode(mission: Mission) {
    if (!mission) return;
    const canEdit = mission.getCanEdit();
    if (canEdit) {
        // if toggling off reset all waypoint move status
        const waypoints: Waypoint[] = mission.getWaypoints();
        waypoints.forEach((element) => {
            element.setCanMoveOnMap(false);
        });
    }
    mission.setCanEdit(!canEdit);
}
