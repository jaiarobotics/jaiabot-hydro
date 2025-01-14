import React, { useState, useEffect } from "react";

// Jaia Imports
import { CommandInfo, botCommands } from "../../types/commands";
import {
    disableButton,
    disableClearRunButton,
    disablePlayButton,
    runMission,
    getBotRun,
} from "./BotDetailsUtils";
import { sendBotCommand, sendBotRunCommand, sendBotRCCommand } from "../../utils/command";
import JaiaToggle from "../../components/JaiaToggle/JaiaToggle";
import { Missions } from "../../missions/missions";
import { GlobalSettings } from "../../missions/settings";
import { warning, info } from "../../notifications/notifications";
import { MissionInterface, RunInterface } from "../CommandControl/CommandControl";
import { PortalHubStatus, PortalBotStatus } from "../../shared/PortalStatus";
import { Command, BotStatus, MissionState } from "../../utils/protobuf-types";
import {
    formatLatitude,
    formatLongitude,
    formatAttitudeAngle,
    addDropdownListener,
} from "../../shared/Utilities";

// Style Imports
import "./BotDetails.less";
import {
    mdiPlay,
    mdiStop,
    mdiPower,
    mdiDelete,
    mdiRestart,
    mdiSkipNext,
    mdiDownload,
    mdiRestartAlert,
    mdiCheckboxMarkedCirclePlusOutline,
} from "@mdi/js";

import { Icon } from "@mdi/react";
import { ThemeProvider, createTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

// Utility Imports
import * as turf from "@turf/turf";
import { CustomAlert } from "../../shared/CustomAlert";

const rcMode = require("../../style/icons/controller.svg");

let prec = 2;

/// TODO This is also used in CommandControl
export interface DetailsExpandedState {
    quickLook: boolean;
    commands: boolean;
    advancedCommands: boolean;
    health: boolean;
    data: boolean;
    gps: boolean;
    imu: boolean;
    sensor: boolean;
    power: boolean;
    links: boolean;
}

// TODO The Take Control and RC Control logic needs a complete refactor
// This will probably go away and all of the uses of takeControlFunction
// will need rework
// Once those are reworked we can probably move more of the non-React logic
// into other files
var takeControlFunction: (onSuccess: () => void) => void;

function issueCommand(
    botId: number,
    command: CommandInfo,
    disableMessage: string,
    setRcMode?: (botId: number, rcMode: boolean) => void,
) {
    takeControlFunction(() => {
        // Exit if we have a disableMessage
        if (disableMessage !== "") {
            CustomAlert.presentAlert({ text: disableMessage });
            return;
        }

        CustomAlert.confirm(
            `Are you sure you'd like to ${command.description} bot: ${botId}?`,
            command.confirmationButtonText,
            () => {
                sendBotCommand(botId, command);
                if (setRcMode) {
                    setRcMode(botId, false);
                }
            },
        );
    });
}

function issueRunCommand(
    bot: PortalBotStatus,
    botRun: Command,
    setRcMode: (botId: number, rcMode: boolean) => void,
    disableMessage: string,
) {
    takeControlFunction(() => {
        // Exit if we have a disableMessage
        if (disableMessage !== "") {
            CustomAlert.alert(disableMessage);
            return;
        }

        CustomAlert.confirmAsync(
            "Are you sure you'd like to play this run for Bot: " + bot.bot_id + "?",
            "Play Run",
        ).then((confirmed) => {
            if (confirmed) {
                // Set the speed values
                botRun.plan.speeds = GlobalSettings.missionPlanSpeeds;

                info("Submitted for Bot: " + bot.bot_id);
                sendBotRunCommand(botRun);
                setRcMode(bot.bot_id, false);
            }
        });
    });
}

function issueRCCommand(
    bot: PortalBotStatus,
    botMission: Command,
    isRCModeActive: (botId: number) => boolean,
    setRcMode: (botId: number, rcMode: boolean) => void,
    disableMessage: string,
) {
    takeControlFunction(() => {
        // Exit if we have a disableMessage
        if (disableMessage !== "") {
            CustomAlert.alert(disableMessage);
            return;
        }

        const isRCActive = isRCModeActive(bot?.bot_id);

        if (!isRCActive) {
            let isCriticallyLowBattery = "";

            if (Array.isArray(bot?.error)) {
                for (let e of bot?.error) {
                    if (e === "ERROR__VEHICLE__CRITICALLY_LOW_BATTERY") {
                        isCriticallyLowBattery =
                            "***Critically Low Battery in RC Mode could jeopardize your recovery!***\n";
                    }
                }
            }

            CustomAlert.confirm(
                isCriticallyLowBattery +
                    "Are you sure you'd like to use remote control mode for Bot: " +
                    bot?.bot_id +
                    "?",
                "Use Remote Control Mode",
                () => {
                    console.debug("Running Remote Control:");
                    console.debug(botMission);
                    sendBotRCCommand(botMission);
                    setRcMode(bot.bot_id, true);
                },
            );
        } else {
            issueCommand(bot.bot_id, botCommands.stop, disableMessage);
            setRcMode(bot.bot_id, false);
        }
    });
}

// TODO only used in this file, used by React Element
async function runRCMode(bot: PortalBotStatus) {
    const botId = bot.bot_id;
    if (!botId) {
        warning("No bots selected");
        return null;
    }

    let datumLocation = bot?.location;

    if (!datumLocation) {
        const warningString =
            "RC mode issued, but bot has no location. Should I use (0, 0) as the datum, which may result in unexpected waypoint behavior?";

        if (!(await CustomAlert.confirmAsync(warningString, "Use (0, 0) Datum"))) {
            return null;
        }

        datumLocation = { lat: 0, lon: 0 };
    }

    return Missions.RCMode(botId, datumLocation);
}

// Get the table row for the health of the vehicle
// TODO Only used in this file, see if we can separate the React code from the non-React
function healthRow(bot: BotStatus, allInfo: boolean) {
    let healthClassName =
        {
            HEALTH__OK: "healthOK",
            HEALTH__DEGRADED: "healthDegraded",
            HEALTH__FAILED: "healthFailed",
        }[bot.health_state] ?? "healthOK";

    let healthStateElement = <div className={healthClassName}>{bot.health_state}</div>;

    let errors = bot.error ?? [];
    let errorElements = errors.map((error) => {
        return (
            <div key={error} className="healthFailed">
                {error}
            </div>
        );
    });

    let warnings = bot.warning ?? [];
    let warningElements = warnings.map((warning) => {
        return (
            <div key={warning} className="healthDegraded">
                {warning}
            </div>
        );
    });

    if (allInfo) {
        return (
            <tr>
                <td>Health</td>
                <td>
                    {healthStateElement}
                    {errorElements}
                    {warningElements}
                </td>
            </tr>
        );
    } else {
        return (
            <tr>
                <td>Health</td>
                <td>{healthStateElement}</td>
            </tr>
        );
    }
}

export interface BotDetailsProps {
    bot: PortalBotStatus;
    hub: PortalHubStatus;
    mission: MissionInterface;
    run: RunInterface;
    isExpanded: DetailsExpandedState;
    downloadQueue: PortalBotStatus[];
    closeWindow: () => void;
    takeControl: (onSuccess: () => void) => void;
    deleteSingleMission: (runId: string, disableMessage?: string) => void;
    setDetailsExpanded: (section: keyof DetailsExpandedState, expanded: boolean) => void;
    isRCModeActive: (botId: number) => boolean;
    setRcMode: (botId: number, rcMode: boolean) => void;
    toggleEditMode: (run: RunInterface) => void;
    downloadIndividualBot: (bot: PortalBotStatus, disableMessage: string) => void;
}

// TODO Used here and in CommandControl
// This has a lot of business logic mixed with React, try
// to separate the logic from display code
export function BotDetailsComponent(props: BotDetailsProps) {
    const bot = props.bot;
    const hub = props.hub;
    const mission = props.mission;
    const closeWindow = props.closeWindow;
    const takeControl = props.takeControl;
    const isExpanded = props.isExpanded;
    const deleteSingleMission = props.deleteSingleMission;
    const setDetailsExpanded = props.setDetailsExpanded;

    if (!bot) {
        return <div></div>;
    }

    const [accordionTheme, setAccordionTheme] = useState(
        createTheme({
            transitions: {
                create: () => "none",
            },
        }),
    );

    useEffect(() => {
        addDropdownListener("accordionContainer", "botDetailsAccordionContainer", 30);
    }, []);

    const statusAge = Math.max(0.0, bot.portalStatusAge / 1e6);
    let statusAgeClassName: string;

    if (statusAge > 30) {
        statusAgeClassName = "healthFailed";
    } else if (statusAge > 10) {
        statusAgeClassName = "healthDegraded";
    }

    // Active Goal
    var repeatNumberString = "N/A";
    if (bot.repeat_index != null) {
        repeatNumberString = `${bot.repeat_index + 1}`;

        if (bot.active_mission_plan?.repeats != null) {
            repeatNumberString = repeatNumberString + ` of ${bot.active_mission_plan?.repeats}`;
        }
    }

    let activeGoal = bot.active_goal ?? "N/A";
    let distToGoal = bot.distance_to_active_goal ?? "N/A";

    if (activeGoal !== "N/A" && distToGoal === "N/A") {
        distToGoal = "Distance To Goal > 1000";
    } else if (activeGoal !== "N/A" && distToGoal !== "N/A") {
        distToGoal = distToGoal + " m";
    } else if (activeGoal === "N/A" && distToGoal !== "N/A") {
        activeGoal = "Recovery";
        distToGoal = distToGoal + " m";
    }

    // Distance from hub
    let distToHub = "N/A";
    if (bot?.location && hub?.location) {
        const botloc = turf.point([bot.location.lon, bot.location.lat]);
        const hubloc = turf.point([hub.location.lon, hub.location.lat]);
        const options = { units: "meters" as turf.Units };
        distToHub = turf.rhumbDistance(botloc, hubloc, options).toFixed(1);
    }

    const missionState = bot.mission_state;
    takeControlFunction = takeControl;

    let linkQualityPercentage = 0;

    if (bot?.wifi_link_quality_percentage != undefined) {
        linkQualityPercentage = bot?.wifi_link_quality_percentage;
    }

    let dataOffloadButton = (
        <Button
            className={
                disableButton(botCommands.recover, missionState).isDisabled ||
                !linkQualityPercentage
                    ? "inactive button-jcc"
                    : "button-jcc"
            }
            onClick={() => {
                let disableMessage = disableButton(
                    botCommands.recover,
                    missionState,
                ).disableMessage;

                if (!linkQualityPercentage) {
                    disableMessage +=
                        "The command: " +
                        botCommands.recover.commandType +
                        " cannot be sent because the bot is not connected to Wifi (Check Link Quality in Quick Look)";
                }

                props.downloadIndividualBot(bot, disableMessage);
            }}
        >
            <Icon path={mdiDownload} title="Data Offload" />
        </Button>
    );

    if (disableButton(botCommands.recover, missionState).isDisabled) {
        dataOffloadButton = (
            <Button
                className={
                    disableButton(botCommands.retryDataOffload, missionState).isDisabled ||
                    !linkQualityPercentage
                        ? "inactive button-jcc"
                        : "button-jcc"
                }
                onClick={() => {
                    let disableMessage = disableButton(
                        botCommands.retryDataOffload,
                        missionState,
                    ).disableMessage;

                    if (!linkQualityPercentage) {
                        disableMessage +=
                            "The command: " +
                            botCommands.retryDataOffload.commandType +
                            " cannot be sent because the bot is not connected to Wifi (Check Link Quality in Quick Look)";
                    }

                    props.downloadIndividualBot(bot, disableMessage);
                }}
            >
                <Icon path={mdiDownload} title="Retry Data Offload" />
            </Button>
        );
    }

    let botOffloadPercentage = "";

    if (bot.bot_id === hub?.bot_offload?.bot_id) {
        botOffloadPercentage = " " + hub.bot_offload?.data_offload_percentage + "%";
    }

    // Change message for clicking on map if the bot has a run, but it is not in edit mode
    let clickOnMap = <h3 className="name">Click on the map to create waypoints</h3>;
    const botRun = getBotRun(bot.bot_id, mission.runs) ?? false;

    if (
        !disableClearRunButton(bot, mission).isDisabled &&
        botRun &&
        botRun.id !== mission.runIdInEditMode
    ) {
        clickOnMap = <h3 className="name">Click edit toggle to create waypoints</h3>;
    }

    function getBotString() {
        return `Bot ${bot.bot_id}`;
    }

    function getRunString() {
        const run = getBotRun(bot.bot_id, mission.runs);
        return run?.name ?? "No Run";
    }

    /**
     * Checks if bot is logging
     *
     * @returns {boolean} The bot logging status
     */
    function isBotLogging() {
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

    return (
        <React.Fragment>
            <div id="botDetailsBox">
                <div className="botDetailsHeading">
                    <div className="titleBar">
                        <h2 className="botName">{getBotString()}</h2>
                        <h4 className="runName">{getRunString()}</h4>
                        <div onClick={() => closeWindow()} className="closeButton">
                            ⨯
                        </div>
                    </div>
                    {clickOnMap}
                    <div className="botDetailsToolbar">
                        <Button
                            className={
                                disableButton(botCommands.stop, missionState).isDisabled
                                    ? "inactive button-jcc"
                                    : " button-jcc stopMission"
                            }
                            onClick={() => {
                                issueCommand(
                                    bot.bot_id,
                                    botCommands.stop,
                                    disableButton(botCommands.stop, missionState).disableMessage,
                                    props.setRcMode,
                                );
                            }}
                        >
                            <Icon path={mdiStop} title="Stop Mission" />
                        </Button>
                        <Button
                            className={
                                disablePlayButton(
                                    bot,
                                    mission,
                                    botCommands.play,
                                    missionState,
                                    props.downloadQueue,
                                ).isDisabled
                                    ? "inactive button-jcc"
                                    : "button-jcc"
                            }
                            onClick={async () => {
                                if (
                                    bot.health_state === "HEALTH__FAILED" &&
                                    bot.mission_state !== MissionState.PRE_DEPLOYMENT__IDLE &&
                                    bot.mission_state !== MissionState.PRE_DEPLOYMENT__FAILED
                                ) {
                                    (await CustomAlert.confirmAsync(
                                        "Running the command may have severe consequences because the bot is in a failed health state.\n",
                                        "Confirm",
                                        "Warning",
                                    ))
                                        ? issueRunCommand(
                                              bot,
                                              runMission(bot.bot_id, mission),
                                              props.setRcMode,
                                              disablePlayButton(
                                                  bot,
                                                  mission,
                                                  botCommands.play,
                                                  missionState,
                                                  props.downloadQueue,
                                              ).disableMessage,
                                          )
                                        : false;
                                } else {
                                    issueRunCommand(
                                        bot,
                                        runMission(bot.bot_id, mission),
                                        props.setRcMode,
                                        disablePlayButton(
                                            bot,
                                            mission,
                                            botCommands.play,
                                            missionState,
                                            props.downloadQueue,
                                        ).disableMessage,
                                    );
                                }
                            }}
                        >
                            <Icon path={mdiPlay} title="Run Mission" />
                        </Button>
                        <Button
                            className={
                                disableClearRunButton(bot, mission).isDisabled
                                    ? "inactive button-jcc"
                                    : "button-jcc"
                            }
                            onClick={() => {
                                deleteSingleMission(
                                    props.run?.id,
                                    disableClearRunButton(bot, mission).disableMessage,
                                );
                            }}
                        >
                            <Icon path={mdiDelete} title="Clear Mission" />
                        </Button>

                        <JaiaToggle
                            checked={() => props.mission.runIdInEditMode === props.run?.id}
                            onClick={() => props.toggleEditMode(props.run)}
                            label="Edit"
                            title="ToggleEditMode"
                            disabled={() => (getBotRun(bot.bot_id, mission.runs) ? false : true)}
                        />
                    </div>
                </div>
                <div id="botDetailsAccordionContainer">
                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={isExpanded.quickLook}
                            onChange={(event, expanded) => {
                                setDetailsExpanded("quickLook", expanded);
                            }}
                            className="accordionContainer"
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Quick Look</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <table>
                                    <tbody>
                                        <tr className={statusAgeClassName}>
                                            <td>Status Age</td>
                                            <td>{statusAge.toFixed(0)} s</td>
                                        </tr>
                                        <tr>
                                            <td>Mission State</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {bot.mission_state?.replaceAll("__", "\n") +
                                                    botOffloadPercentage}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Battery Percentage</td>
                                            <td>{bot.battery_percent?.toFixed(prec)} %</td>
                                        </tr>
                                        <tr>
                                            <td>Repeat Number</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {repeatNumberString}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Active Goal</td>
                                            <td style={{ whiteSpace: "pre-line" }}>{activeGoal}</td>
                                        </tr>
                                        <tr>
                                            <td>Distance to Goal</td>
                                            <td style={{ whiteSpace: "pre-line" }}>{distToGoal}</td>
                                        </tr>
                                        <tr>
                                            <td>Distance from Hub</td>
                                            <td>{distToHub} m</td>
                                        </tr>
                                        <tr>
                                            <td>Wi-Fi Link Quality</td>
                                            <td>{linkQualityPercentage + " %"}</td>
                                        </tr>
                                        <tr>
                                            <td>Data Logging</td>
                                            <td>{isBotLogging().toString().toUpperCase()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>

                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={isExpanded.commands}
                            onChange={(event, expanded) => {
                                setDetailsExpanded("commands", expanded);
                            }}
                            className="accordionContainer"
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Commands</Typography>
                            </AccordionSummary>
                            <AccordionDetails className="botDetailsCommands">
                                <Button
                                    className={
                                        disableButton(botCommands.active, missionState).isDisabled
                                            ? "inactive button-jcc"
                                            : "button-jcc"
                                    }
                                    onClick={() => {
                                        issueCommand(
                                            bot.bot_id,
                                            botCommands.active,
                                            disableButton(botCommands.active, missionState)
                                                .disableMessage,
                                        );
                                    }}
                                >
                                    <Icon
                                        path={mdiCheckboxMarkedCirclePlusOutline}
                                        title="System Check"
                                    />
                                </Button>

                                <Button
                                    className={`
                                        ${disableButton(botCommands.rcMode, missionState, bot, props.downloadQueue).isDisabled ? "inactive button-jcc" : "button-jcc"} 
                                        ${props.isRCModeActive(bot?.bot_id) ? "rc-active" : "rc-inactive"}
                                        `}
                                    onClick={async () => {
                                        issueRCCommand(
                                            bot,
                                            await runRCMode(bot),
                                            props.isRCModeActive,
                                            props.setRcMode,
                                            disableButton(
                                                botCommands.rcMode,
                                                missionState,
                                                bot,
                                                props.downloadQueue,
                                            ).disableMessage,
                                        );
                                    }}
                                >
                                    <img src={rcMode} alt="Activate RC Mode" title="RC Mode"></img>
                                </Button>

                                <Button
                                    className={
                                        disableButton(botCommands.nextTask, missionState).isDisabled
                                            ? "inactive button-jcc"
                                            : "button-jcc"
                                    }
                                    onClick={() => {
                                        issueCommand(
                                            bot.bot_id,
                                            botCommands.nextTask,
                                            disableButton(botCommands.nextTask, missionState)
                                                .disableMessage,
                                        );
                                    }}
                                >
                                    <Icon path={mdiSkipNext} title="Next Task" />
                                </Button>

                                {dataOffloadButton}

                                <Accordion
                                    expanded={isExpanded.advancedCommands}
                                    onChange={(event, expanded) => {
                                        setDetailsExpanded("advancedCommands", expanded);
                                    }}
                                    className="accordionContainer"
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <Typography>Advanced Commands</Typography>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        <Button
                                            className={
                                                disableButton(
                                                    botCommands.shutdown,
                                                    missionState,
                                                    bot,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    bot.mission_state ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to shutdown bot: ${bot.bot_id} without doing a data offload?`,
                                                        "Shutdown Bot",
                                                    ))
                                                        ? issueCommand(
                                                              bot.bot_id,
                                                              botCommands.shutdown,
                                                              disableButton(
                                                                  botCommands.shutdown,
                                                                  missionState,
                                                                  bot,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        bot.bot_id,
                                                        botCommands.shutdown,
                                                        disableButton(
                                                            botCommands.shutdown,
                                                            missionState,
                                                            bot,
                                                            props.downloadQueue,
                                                        ).disableMessage,
                                                    );
                                                }
                                            }}
                                        >
                                            <Icon path={mdiPower} title="Shutdown" />
                                        </Button>
                                        <Button
                                            className={
                                                disableButton(
                                                    botCommands.reboot,
                                                    missionState,
                                                    bot,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    bot.mission_state ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to reboot bot: ${bot.bot_id} without doing a data offload?`,
                                                        "Reboot Bot",
                                                    ))
                                                        ? issueCommand(
                                                              bot.bot_id,
                                                              botCommands.reboot,
                                                              disableButton(
                                                                  botCommands.reboot,
                                                                  missionState,
                                                                  bot,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        bot.bot_id,
                                                        botCommands.reboot,
                                                        disableButton(
                                                            botCommands.reboot,
                                                            missionState,
                                                            bot,
                                                            props.downloadQueue,
                                                        ).disableMessage,
                                                    );
                                                }
                                            }}
                                        >
                                            <Icon path={mdiRestartAlert} title="Reboot" />
                                        </Button>
                                        <Button
                                            className={
                                                disableButton(
                                                    botCommands.restartServices,
                                                    missionState,
                                                    bot,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    bot.mission_state ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to restart bot: ${bot.bot_id} without doing a data offload?`,
                                                        "Restart Bot",
                                                    ))
                                                        ? issueCommand(
                                                              bot.bot_id,
                                                              botCommands.restartServices,
                                                              disableButton(
                                                                  botCommands.restartServices,
                                                                  missionState,
                                                                  bot,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        bot.bot_id,
                                                        botCommands.restartServices,
                                                        disableButton(
                                                            botCommands.restartServices,
                                                            missionState,
                                                            bot,
                                                            props.downloadQueue,
                                                        ).disableMessage,
                                                    );
                                                }
                                            }}
                                        >
                                            <Icon path={mdiRestart} title="Restart Services" />
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>

                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={isExpanded.health}
                            onChange={(event, expanded) => {
                                setDetailsExpanded("health", expanded);
                            }}
                            className="accordionContainer"
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Health</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <table>
                                    <tbody>{healthRow(bot, true)}</tbody>
                                </table>
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>

                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={isExpanded.data}
                            onChange={(event, expanded) => {
                                setDetailsExpanded("data", expanded);
                            }}
                            className="accordionContainer"
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Data</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <ThemeProvider theme={accordionTheme}>
                                    <Accordion
                                        expanded={isExpanded.gps}
                                        onChange={(event, expanded) => {
                                            setDetailsExpanded("gps", expanded);
                                        }}
                                        className="nestedAccordionContainer"
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>GPS</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td>Latitude</td>
                                                        <td>{formatLatitude(bot.location?.lat)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Longitude</td>
                                                        <td>
                                                            {formatLongitude(bot.location?.lon)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>HDOP</td>
                                                        <td>{bot.hdop?.toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>PDOP</td>
                                                        <td>{bot.pdop?.toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ground Speed</td>
                                                        <td>
                                                            {bot.speed?.over_ground?.toFixed(prec)}{" "}
                                                            m/s
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Course Over Ground</td>
                                                        <td>
                                                            {bot.attitude?.course_over_ground?.toFixed(
                                                                prec,
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </AccordionDetails>
                                    </Accordion>
                                </ThemeProvider>

                                <ThemeProvider theme={accordionTheme}>
                                    <Accordion
                                        expanded={isExpanded.imu}
                                        onChange={(event, expanded) => {
                                            setDetailsExpanded("imu", expanded);
                                        }}
                                        className="nestedAccordionContainer"
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>IMU</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td>Heading</td>
                                                        <td>
                                                            {formatAttitudeAngle(
                                                                bot.attitude?.heading,
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Pitch</td>
                                                        <td>
                                                            {formatAttitudeAngle(
                                                                bot.attitude?.pitch,
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>IMU Cal</td>
                                                        <td>{bot?.calibration_status}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </AccordionDetails>
                                    </Accordion>
                                </ThemeProvider>

                                <ThemeProvider theme={accordionTheme}>
                                    <Accordion
                                        expanded={isExpanded.sensor}
                                        onChange={(event, expanded) => {
                                            setDetailsExpanded("sensor", expanded);
                                        }}
                                        className="nestedAccordionContainer"
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>Sensors</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td>Temperature</td>
                                                        <td>{bot.temperature?.toFixed(prec)} °C</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Depth</td>
                                                        <td>{bot.depth?.toFixed(prec)} m</td>
                                                    </tr>
                                                    {/* <tr>
                                                        <td>Salinity</td>
                                                        <td>
                                                            {bot.salinity?.toFixed(prec)} PSU(ppt)
                                                        </td>
                                                    </tr> */}
                                                </tbody>
                                            </table>
                                        </AccordionDetails>
                                    </Accordion>
                                </ThemeProvider>
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>
                </div>
            </div>
        </React.Fragment>
    );
}
