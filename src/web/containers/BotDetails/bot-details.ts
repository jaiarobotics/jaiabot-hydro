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

// Utility Imports
import * as turf from "@turf/turf";

interface DisableInfo {
    isDisabled: boolean;
    disableMessage: string;
}

/**
 * Provides a bots status age in seconds
 *
 * @param {Bot} bot Bot object
 * @returns {number} status age in seconds
 */
export function getStatusAgeSeconds(bot: Bot) {
    return Math.max(0.0, bot.getStatusAge() / 1e6);
}

/**
 * Provides class name for status age
 *
 * @param {Bot} bot Bot object
 * @returns {string} status age class name
 */
export function getStatusAgeClass(bot: Bot) {
    const statusAge = getStatusAgeSeconds(bot);
    let statusAgeClassName: string;

    if (statusAge > 30) {
        statusAgeClassName = "healthFailed";
    } else if (statusAge > 10) {
        statusAgeClassName = "healthDegraded";
    }
    return statusAgeClassName;
}

/**
 * Provides distance from hub
 *
 * @param {Bot} bot Bot object
 * @param {Hub} hub Hub object
 * @returns {string} Distance between bot and hub in meters
 */
export function getDistToHub(bot: Bot, hub: Hub) {
    const botGPS: GPS = bot.getBotSensors().getGPS();
    const hubGPS: GPS = hub.getHubSensors().getGPS();

    let distToHub = "N/A";
    if (botGPS && hubGPS) {
        const botLocation = turf.point([botGPS.getLat(), botGPS.getLon()]);
        const hubLocation = turf.point([hubGPS.getLat(), hubGPS.getLon()]);
        const options = { units: "meters" as turf.Units };
        distToHub = turf.rhumbDistance(botLocation, hubLocation, options).toFixed(1);
    }
    return distToHub;
}

/**
 * Provides helper text for creating waypoints
 *
 * @param {Mission} mission object
 * @returns {string} Message describing how to create waypoints
 *
 * @notes Edit mode toggle and related items not functional
 *         until more functionality is add to the mission management
 */
export function getWaypontHelperText(mission: Mission) {
    if (!mission || mission.getCanEdit()) {
        return "Click on the map to create waypoints";
    }
    return "Click edit toggle to create waypoint";
}

/**
 * Provides off load percentage
 *
 * @param {number} botID Id of bot
 * @param {Hub} hub Hub object
 *
 * @returns {string} Offload progress in percent
 */
export function getBotOffloadPercent(botID: number, hub: Hub) {
    let botOffloadPercentage = "";

    if (botID === hub.getBotOffload()?.bot_id) {
        botOffloadPercentage = " " + hub.getBotOffload().data_offload_percentage + "%";
    }
    return botOffloadPercentage;
}

/**
 * Provides repeat progress message
 *
 * @param {Mission} mission Mission object
 * @param {MissionStatus} missionStatus Mission Status object
 *
 * @returns {string} Repeat progress
 */
export function getRepeatProgress(mission: Mission, missionStatus: MissionStatus) {
    let repeatProgressString = "N/A";
    if (missionStatus?.repeat_index != null) {
        repeatProgressString = `${missionStatus.repeat_index + 1}`;
        repeatProgressString = repeatProgressString + ` of ${mission?.getRepeats()}`;
    }
    return repeatProgressString;
}

/**
 * Checks if bot is logging
 *
 * @param {MissionState} missionState Mission State object
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
 * @param {MissionStatus} missionStatus Mission Status object
 *
 * @returns {string , string} Tuple containg the active goal and distance to it
 *
 * @notes When Mission Status is reworked to remove Runs from the vocabulary
 *        We should add logic to the new Mission Status to make this simpler
 *        alleviating need to return a tuple
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
/**
 * Creates a run command
 *
 * @param {number} botId Bot ID
 * @param {MissionInterface} Mission Mission Interface object
 *
 * @returns {Command} Command to run the mission
 *
 * @notes This is based on RunInterface which is likely to change
 *        and this will be reworked
 */
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
 *
 * @notes Look for ways to simplify this when working
 *        on the Notifications processing
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
 *
 * @notes Runs are no longer defined in JCC data model, this will need rework
 */
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

/**
 * Checks if play button should be disabled
 *
 * @param {number} botID ID of selected bot
 * @param {Mission} mission Current mission
 * @param {CommandInfo} command Command and information associated with it
 * @param {MissionState} missionState State of current mission
 * @param {number[]} downloadQueue Download Queue for selected bot
 *
 * @returns boolean
 *
 * @notes Runs are no longer defined in JCC data model, this will need rework
 */
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
/**
 * Toggles edit mode of a mission
 * @param {Mission} mission Mission object
 * @returns {void}
 *
 * @notes function will not work until Mission Management is refactored
 *         missions are not being added to bots in the data model yet
 */
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
