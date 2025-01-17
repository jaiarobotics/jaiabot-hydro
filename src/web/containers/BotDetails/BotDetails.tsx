import React, { useContext, useState, useEffect } from "react";

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
import { MissionStatus } from "../../types/jaia-system-types";
import BotSensors from "../../data/bots/bot-sensors";
import Bot from "../../data/bots/bot";
import GPS from "../../data/sensors/gps";
import IMU from "../../data/sensors/imu";
import PressureSensor from "../../data/sensors/pressure";
import TemperatureSensor from "../../data/sensors/temperature";
import ConductivitySensor from "../../data/sensors/conductivity";

import { GlobalSettings } from "../../missions/settings";
import { warning, info } from "../../notifications/notifications";
import { MissionInterface, RunInterface } from "../CommandControl/CommandControl";
import Mission from "../../data/missions/mission";
import { PortalBotStatus } from "../../shared/PortalStatus";
import { Command, BotStatus, MissionState, GeographicCoordinate } from "../../utils/protobuf-types";

import {
    formatLatitude,
    formatLongitude,
    formatAttitudeAngle,
    addDropdownListener,
} from "../../shared/Utilities";
import { GlobalContext, GlobalDispatchContext } from "../../context/Global/GlobalContext";
import { GlobalActions } from "../../context/Global/GlobalActions";
import { HubContext } from "../../context/Hub/HubContext";

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
import { BotContext } from "../../context/Bot/BotContext";

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

// TODO The Take Control needs a complete refactor
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

// TODO look into simplifying the parameter of this
function issueRunCommand(
    botID: number,
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
            "Are you sure you'd like to play this run for Bot: " + botID + "?",
            "Play Run",
        ).then((confirmed) => {
            if (confirmed) {
                // Set the speed values
                botRun.plan.speeds = GlobalSettings.missionPlanSpeeds;

                info("Submitted for Bot: " + botID);
                sendBotRunCommand(botRun);
                setRcMode(botID, false);
            }
        });
    });
}

function issueRCCommand(
    bot: Bot,
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
        const botID = bot.getBotID();
        const isRCActive = isRCModeActive(botID);

        if (!isRCActive) {
            let isCriticallyLowBattery = "";
            const botErrors = bot.getErrors();
            if (Array.isArray(botErrors)) {
                for (let e of botErrors) {
                    if (e === "ERROR__VEHICLE__CRITICALLY_LOW_BATTERY") {
                        isCriticallyLowBattery =
                            "***Critically Low Battery in RC Mode could jeopardize your recovery!***\n";
                    }
                }
            }

            CustomAlert.confirm(
                isCriticallyLowBattery +
                    "Are you sure you'd like to use remote control mode for Bot: " +
                    bot +
                    "?",
                "Use Remote Control Mode",
                () => {
                    console.debug("Running Remote Control:");
                    console.debug(botMission);
                    sendBotRCCommand(botMission);
                    setRcMode(botID, true);
                },
            );
        } else {
            issueCommand(botID, botCommands.stop, disableMessage);
            setRcMode(botID, false);
        }
    });
}

async function runRCMode(bot: Bot) {
    if (!bot) {
        warning("No bots selected");
        return null;
    }

    const botLat = bot.getBotSensors()?.getGPS()?.getLat();
    const botLon = bot.getBotSensors()?.getGPS()?.getLon();

    let datumLocation: GeographicCoordinate = { lat: botLat, lon: botLon };

    if (!datumLocation) {
        const warningString =
            "RC mode issued, but bot has no location. Should I use (0, 0) as the datum, which may result in unexpected waypoint behavior?";

        if (!(await CustomAlert.confirmAsync(warningString, "Use (0, 0) Datum"))) {
            return null;
        }

        datumLocation = { lat: 0, lon: 0 };
    }

    return Missions.RCMode(bot.getBotID(), datumLocation);
}

// Get the table row for the health of the vehicle
function healthRow(bot: Bot, allInfo: boolean) {
    let healthClassName =
        {
            HEALTH__OK: "healthOK",
            HEALTH__DEGRADED: "healthDegraded",
            HEALTH__FAILED: "healthFailed",
        }[bot.getHealthState()] ?? "healthOK";

    let healthStateElement = <div className={healthClassName}>{bot.getHealthState()}</div>;

    let errors = bot.getErrors() ?? [];
    let errorElements = errors.map((error) => {
        return (
            <div key={error} className="healthFailed">
                {error}
            </div>
        );
    });

    let warnings = bot.getWarnings() ?? [];
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
    mission: MissionInterface;
    run: RunInterface;
    isExpanded: DetailsExpandedState;
    downloadQueue: number[];
    closeWindow: () => void;
    takeControl: (onSuccess: () => void) => void;
    deleteSingleMission: (runId: string, disableMessage?: string) => void;
    setDetailsExpanded: (section: keyof DetailsExpandedState, expanded: boolean) => void;
    isRCModeActive: (botId: number) => boolean;
    setRcMode: (botId: number, rcMode: boolean) => void;
    toggleEditMode: (run: RunInterface) => void;
    downloadIndividualBot: (botID: Number, disableMessage: string) => void;
}

// This has a lot of business logic mixed with React, try
// to separate the logic from display code
export function BotDetailsComponent(props: BotDetailsProps) {
    // TODO We will replace all uses of theses objects from Props with ones from context
    const botFromProps = props.bot;
    const missionFromProps = props.mission;

    const closeWindow = props.closeWindow;
    const takeControl = props.takeControl;
    const isExpanded = props.isExpanded;
    const deleteSingleMission = props.deleteSingleMission;
    const setDetailsExpanded = props.setDetailsExpanded;

    const globalContext = useContext(GlobalContext);
    const globalDispatch = useContext(GlobalDispatchContext);

    const hubContext = useContext(HubContext);
    const botContext = useContext(BotContext);

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

    // Pull Data from the Data Model Context
    const DEFAULT_HUB_ID = 1;
    const hub = hubContext.hubs.get(DEFAULT_HUB_ID);
    const hubGPS: GPS = hub.getHubSensors().getGPS();

    // TODO need to get the right Bot ID May need to add it as a Prop
    const bot = botContext.bots.get(1);
    const botID = bot.getBotID();

    const mission: Mission = bot.getMission();
    const missionStatus: MissionStatus = bot.getMissionStatus();

    const botSensors: BotSensors = bot.getBotSensors();
    const botGPS: GPS = botSensors.getGPS();
    const botIMU: IMU = botSensors.getIMU();
    const botPressureSensor: PressureSensor = botSensors.getPressureSensor();
    const botTemperatureSensor: TemperatureSensor = botSensors.getTemperatureSensor();
    const botConductivitySenstor: ConductivitySensor = botSensors.getCoductivitySensor();

    const statusAge = Math.max(0.0, bot.getStatusAge() / 1e6);
    let statusAgeClassName: string;

    if (statusAge > 30) {
        statusAgeClassName = "healthFailed";
    } else if (statusAge > 10) {
        statusAgeClassName = "healthDegraded";
    }

    // TODO will  need to add repeat_index to MissionStatus
    // Active Goal
    var repeatNumberString = "N/A";
    if (missionStatus.repeat_index != null) {
        repeatNumberString = `${missionStatus.repeat_index + 1}`;

        if (mission?.getRepeats() != null) {
            repeatNumberString = repeatNumberString + ` of ${mission?.getRepeats()}`;
        }
    }

    let activeGoal = missionStatus.activeGoal ?? "N/A";
    let distToGoal = missionStatus.distanceToActiveGoal ?? "N/A";

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
    if (botGPS && hubGPS) {
        const botloc = turf.point([botGPS.getLat(), botGPS.getLon()]);
        const hubloc = turf.point([hubGPS.getLat(), hubGPS.getLon()]);
        const options = { units: "meters" as turf.Units };
        distToHub = turf.rhumbDistance(botloc, hubloc, options).toFixed(1);
    }

    const missionState = missionStatus.missionState;
    takeControlFunction = takeControl;

    let linkQualityPercentage = 0;

    if (bot.getWifiLinkQuality() != undefined) {
        linkQualityPercentage = bot.getWifiLinkQuality();
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

                props.downloadIndividualBot(botID, disableMessage);
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
                    props.downloadIndividualBot(botID, disableMessage);
                }}
            >
                <Icon path={mdiDownload} title="Retry Data Offload" />
            </Button>
        );
    }

    let botOffloadPercentage = "";

    if (botID === hub.getBotOffload().bot_id) {
        botOffloadPercentage = " " + hub.getBotOffload().data_offload_percentage + "%";
    }

    // Change message for clicking on map if the bot has a run, but it is not in edit mode
    let clickOnMap = <h3 className="name">Click on the map to create waypoints</h3>;

    // TODO ** replace this with data from Context **
    // Runs are no longer a concept in JCC
    const botRun = getBotRun(botID, missionFromProps.runs) ?? false;

    if (
        !disableClearRunButton(botID, missionFromProps).isDisabled &&
        botRun &&
        botRun.id !== missionFromProps.runIdInEditMode
    ) {
        clickOnMap = <h3 className="name">Click edit toggle to create waypoints</h3>;
    }

    function getBotString() {
        return `Bot ${botID}`;
    }

    function getRunString() {
        const run = getBotRun(botID, missionFromProps.runs);
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
                                    botID,
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
                                    botID,
                                    missionFromProps,
                                    botCommands.play,
                                    missionState,
                                    props.downloadQueue,
                                ).isDisabled
                                    ? "inactive button-jcc"
                                    : "button-jcc"
                            }
                            onClick={async () => {
                                if (
                                    bot.getHealthState() === "HEALTH__FAILED" &&
                                    missionStatus.missionState !==
                                        MissionState.PRE_DEPLOYMENT__IDLE &&
                                    missionStatus.missionState !==
                                        MissionState.PRE_DEPLOYMENT__FAILED
                                ) {
                                    (await CustomAlert.confirmAsync(
                                        "Running the command may have severe consequences because the bot is in a failed health state.\n",
                                        "Confirm",
                                        "Warning",
                                    ))
                                        ? issueRunCommand(
                                              botID,
                                              runMission(botID, missionFromProps),
                                              props.setRcMode,
                                              disablePlayButton(
                                                  botID,
                                                  missionFromProps,
                                                  botCommands.play,
                                                  missionState,
                                                  props.downloadQueue,
                                              ).disableMessage,
                                          )
                                        : false;
                                } else {
                                    issueRunCommand(
                                        botID,
                                        runMission(botID, missionFromProps),
                                        props.setRcMode,
                                        disablePlayButton(
                                            botID,
                                            missionFromProps,
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
                                disableClearRunButton(botID, missionFromProps).isDisabled
                                    ? "inactive button-jcc"
                                    : "button-jcc"
                            }
                            onClick={() => {
                                deleteSingleMission(
                                    props.run?.id,
                                    disableClearRunButton(botID, missionFromProps).disableMessage,
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
                            disabled={() =>
                                getBotRun(botID, missionFromProps.runs) ? false : true
                            }
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
                                                {missionStatus.missionState?.replaceAll(
                                                    "__",
                                                    "\n",
                                                ) + botOffloadPercentage}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Battery Percentage</td>
                                            <td>{bot.getBatteryPercent()?.toFixed(prec)} %</td>
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
                                            botID,
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
                                        ${disableButton(botCommands.rcMode, missionState, botID, props.downloadQueue).isDisabled ? "inactive button-jcc" : "button-jcc"} 
                                        ${props.isRCModeActive(botID) ? "rc-active" : "rc-inactive"}
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
                                                botID,
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
                                            botID,
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
                                                    botID,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    missionStatus.missionState ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to shutdown bot: ${botID} without doing a data offload?`,
                                                        "Shutdown Bot",
                                                    ))
                                                        ? issueCommand(
                                                              botID,
                                                              botCommands.shutdown,
                                                              disableButton(
                                                                  botCommands.shutdown,
                                                                  missionState,
                                                                  botID,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        botID,
                                                        botCommands.shutdown,
                                                        disableButton(
                                                            botCommands.shutdown,
                                                            missionState,
                                                            botID,
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
                                                    botID,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    missionStatus.missionState ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to reboot bot: ${botID} without doing a data offload?`,
                                                        "Reboot Bot",
                                                    ))
                                                        ? issueCommand(
                                                              botID,
                                                              botCommands.reboot,
                                                              disableButton(
                                                                  botCommands.reboot,
                                                                  missionState,
                                                                  botID,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        botID,
                                                        botCommands.reboot,
                                                        disableButton(
                                                            botCommands.reboot,
                                                            missionState,
                                                            botID,
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
                                                    botID,
                                                    props.downloadQueue,
                                                ).isDisabled
                                                    ? "inactive button-jcc"
                                                    : "button-jcc"
                                            }
                                            onClick={async () => {
                                                if (
                                                    missionStatus.missionState ==
                                                    "IN_MISSION__UNDERWAY__RECOVERY__STOPPED"
                                                ) {
                                                    (await CustomAlert.confirmAsync(
                                                        `Are you sure you'd like to restart bot: ${botID} without doing a data offload?`,
                                                        "Restart Bot",
                                                    ))
                                                        ? issueCommand(
                                                              botID,
                                                              botCommands.restartServices,
                                                              disableButton(
                                                                  botCommands.restartServices,
                                                                  missionState,
                                                                  botID,
                                                                  props.downloadQueue,
                                                              ).disableMessage,
                                                          )
                                                        : false;
                                                } else {
                                                    issueCommand(
                                                        botID,
                                                        botCommands.restartServices,
                                                        disableButton(
                                                            botCommands.restartServices,
                                                            missionState,
                                                            botID,
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
                                                        <td>{formatLatitude(botGPS.getLat())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Longitude</td>
                                                        <td>{formatLongitude(botGPS.getLon())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>HDOP</td>
                                                        <td>{botGPS.getHDOP().toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>PDOP</td>
                                                        <td>{botGPS.getPDOP().toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ground Speed</td>
                                                        <td>
                                                            {botGPS
                                                                .getSpeedOverGround()
                                                                .toFixed(prec)}{" "}
                                                            m/s
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Course Over Ground</td>
                                                        <td>
                                                            {botGPS
                                                                .getCourseOverGround()
                                                                .toFixed(prec)}
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
                                                                botIMU.getHeading(),
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Pitch</td>
                                                        <td>
                                                            {formatAttitudeAngle(botIMU.getPitch())}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>IMU Cal</td>
                                                        <td>{botIMU.getCalibrationStatus()}</td>
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
                                                        <td>
                                                            {botTemperatureSensor
                                                                .getTemperature()
                                                                .toFixed(prec)}{" "}
                                                            °C
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Depth</td>
                                                        <td>
                                                            {botPressureSensor
                                                                .getDepth()
                                                                .toFixed(prec)}{" "}
                                                            m
                                                        </td>
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
