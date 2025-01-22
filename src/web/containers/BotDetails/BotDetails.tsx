import React, { useContext, useState, useEffect } from "react";

// Jaia Imports
import { CommandInfo, botCommands } from "../../types/commands";
import {
    disableButton,
    disableClearRunButton,
    disablePlayButton,
    runMission,
    toggleEditMode,
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
import { Command, MissionState, GeographicCoordinate } from "../../utils/protobuf-types";

import {
    formatLatitude,
    formatLongitude,
    formatAttitudeAngle,
    addDropdownListener,
} from "../../shared/Utilities";
import {
    GlobalContext,
    GlobalDispatchContext,
    BotAccordionNames,
    PodElement,
} from "../../context/Global/GlobalContext";
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
// Need to wait until we can eliminate need for the
// mission and run props
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
    botID: number;
    // TODO once all uses of missionFromProps below has been replaced this prop can be deleted
    mission: MissionInterface;
    // TODO this should not be needed, most uses refactored but not all
    // Need to incorporate some of the data in RunInterface into the data model
    // before refactoring this out
    run: RunInterface;
    // TODO download queue may be refactored, leave for now
    downloadQueue: number[];
    // TODO Think the takeControl functionality needs rework, leave for now
    takeControl: (onSuccess: () => void) => void;
    // TODO Should be able to change the data model locally, look to eliminated this prop
    // Currently using runList in CommandControl to manage, need to refactor mission or
    // other to elminate need for data in runList
    deleteSingleMission: (runId: string, disableMessage?: string) => void;
    // TODO RC Mode state is managed in CommandControl, not sure if used in any other panels.
    // CommandControl uses rcModeStatus state but also adds rcMode to the botFeature
    isRCModeActive: (botId: number) => boolean;
    setRcMode: (botId: number, rcMode: boolean) => void;
    // TODO download queue may be refactored, leave for now
    downloadIndividualBot: (botID: Number, disableMessage: string) => void;
}

// TODO This has a lot of business logic mixed with React, try
// to separate the logic from display code
export function BotDetailsComponent(props: BotDetailsProps) {
    // TODO We will replace all uses of theses objects from Props with ones from context
    const missionFromProps = props.mission;

    const takeControl = props.takeControl;
    const deleteSingleMission = props.deleteSingleMission;

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

    if (
        botContext === null ||
        hubContext === null ||
        globalContext.shownDetails != PodElement.BOT
    ) {
        return <div></div>;
    }

    // Pull Data from the Data Model Context
    const DEFAULT_HUB_ID = 1;
    const hub = hubContext.hubs.get(DEFAULT_HUB_ID);
    const hubGPS: GPS = hub.getHubSensors().getGPS();

    const botID = props.botID;
    const bot = botContext.bots.get(botID);
    if (!bot) {
        return <div></div>;
    }

    const mission: Mission = bot.getMission();
    const missionStatus: MissionStatus = bot.getMissionStatus();

    const botSensors: BotSensors = bot.getBotSensors();
    const botGPS: GPS = botSensors?.getGPS();
    const botIMU: IMU = botSensors?.getIMU();
    const botPressureSensor: PressureSensor = botSensors?.getPressureSensor();
    const botTemperatureSensor: TemperatureSensor = botSensors?.getTemperatureSensor();
    const botConductivitySenstor: ConductivitySensor = botSensors?.getCoductivitySensor();

    const statusAge = Math.max(0.0, bot.getStatusAge() / 1e6);
    let statusAgeClassName: string;

    if (statusAge > 30) {
        statusAgeClassName = "healthFailed";
    } else if (statusAge > 10) {
        statusAgeClassName = "healthDegraded";
    }

    // Active Goal
    var repeatNumberString = "N/A";
    if (missionStatus?.repeat_index != null) {
        repeatNumberString = `${missionStatus.repeat_index + 1}`;

        if (mission?.getRepeats() != null) {
            repeatNumberString = repeatNumberString + ` of ${mission?.getRepeats()}`;
        }
    }

    let activeGoal = missionStatus?.activeGoal ?? "N/A";
    let distToGoal = missionStatus?.distanceToActiveGoal ?? "N/A";

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

    const missionState = missionStatus?.missionState;
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

    if (botID === hub.getBotOffload()?.bot_id) {
        botOffloadPercentage = " " + hub.getBotOffload().data_offload_percentage + "%";
    }

    // Change message for clicking on map if the bot has a run, but it is not in edit mode
    let clickOnMap = <h3 className="name">Click on the map to create waypoints</h3>;

    if (!mission?.getCanEdit()) {
        clickOnMap = <h3 className="name">Click edit toggle to create waypoints</h3>;
    }

    function getBotString() {
        return `Bot ${botID}`;
    }

    function getRunString() {
        return mission?.getMissionID() ?? "No Run";
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

    /**
     * Dispatches an action to close the HubDetails panel
     *
     * @returns {void}
     */
    function handleClosePanel() {
        globalDispatch({ type: GlobalActions.CLOSED_DETAILS });
    }

    return (
        <React.Fragment>
            <div id="botDetailsBox">
                <div className="botDetailsHeading">
                    <div className="titleBar">
                        <h2 className="botName">{getBotString()}</h2>
                        <h4 className="runName">{getRunString()}</h4>
                        <div className="closeButton" onClick={handleClosePanel}>
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
                                    bot.getHealthState() === "HEALTH__FAILED" &&
                                    missionStatus?.missionState !==
                                        MissionState.PRE_DEPLOYMENT__IDLE &&
                                    missionStatus?.missionState !==
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
                                                  mission,
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
                                disableClearRunButton(mission).isDisabled
                                    ? "inactive button-jcc"
                                    : "button-jcc"
                            }
                            onClick={() => {
                                deleteSingleMission(
                                    props.run?.id,
                                    disableClearRunButton(mission).disableMessage,
                                );
                            }}
                        >
                            <Icon path={mdiDelete} title="Clear Mission" />
                        </Button>

                        <JaiaToggle
                            checked={() => mission?.getCanEdit()}
                            onClick={() => toggleEditMode(mission)}
                            label="Edit"
                            title="ToggleEditMode"
                            disabled={() => (!mission ? true : false)}
                        />
                    </div>
                </div>
                <div id="botDetailsAccordionContainer">
                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={globalContext.botAccordionStates.quickLook}
                            onChange={() =>
                                globalDispatch({
                                    type: GlobalActions.CLICKED_BOT_ACCORDION,
                                    botAccordionName: BotAccordionNames.QUICKLOOK,
                                })
                            }
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
                                                {missionStatus?.missionState?.replaceAll(
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
                            expanded={globalContext.botAccordionStates.commands}
                            onChange={() =>
                                globalDispatch({
                                    type: GlobalActions.CLICKED_BOT_ACCORDION,
                                    botAccordionName: BotAccordionNames.COMMANDS,
                                })
                            }
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
                                    expanded={globalContext.botAccordionStates.advancedCommands}
                                    onChange={() =>
                                        globalDispatch({
                                            type: GlobalActions.CLICKED_BOT_ACCORDION,
                                            botAccordionName: BotAccordionNames.ADVANCEDCOMMANDS,
                                        })
                                    }
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
                                                    missionStatus?.missionState ==
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
                                                    missionStatus?.missionState ==
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
                                                    missionStatus?.missionState ==
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
                            expanded={globalContext.botAccordionStates.health}
                            onChange={() =>
                                globalDispatch({
                                    type: GlobalActions.CLICKED_BOT_ACCORDION,
                                    botAccordionName: BotAccordionNames.HEALTH,
                                })
                            }
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
                            expanded={globalContext.botAccordionStates.data}
                            onChange={() =>
                                globalDispatch({
                                    type: GlobalActions.CLICKED_BOT_ACCORDION,
                                    botAccordionName: BotAccordionNames.DATA,
                                })
                            }
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
                                        expanded={globalContext.botAccordionStates.GPS}
                                        onChange={() =>
                                            globalDispatch({
                                                type: GlobalActions.CLICKED_BOT_ACCORDION,
                                                botAccordionName: BotAccordionNames.GPS,
                                            })
                                        }
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
                                                        <td>{formatLatitude(botGPS?.getLat())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Longitude</td>
                                                        <td>{formatLongitude(botGPS?.getLon())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>HDOP</td>
                                                        <td>{botGPS?.getHDOP()?.toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>PDOP</td>
                                                        <td>{botGPS?.getPDOP()?.toFixed(prec)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ground Speed</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getSpeedOverGround()
                                                                ?.toFixed(prec)}{" "}
                                                            m/s
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Course Over Ground</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getCourseOverGround()
                                                                ?.toFixed(prec)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </AccordionDetails>
                                    </Accordion>
                                </ThemeProvider>

                                <ThemeProvider theme={accordionTheme}>
                                    <Accordion
                                        expanded={globalContext.botAccordionStates.imu}
                                        onChange={() =>
                                            globalDispatch({
                                                type: GlobalActions.CLICKED_BOT_ACCORDION,
                                                botAccordionName: BotAccordionNames.IMU,
                                            })
                                        }
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
                                                                botIMU?.getHeading(),
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Pitch</td>
                                                        <td>
                                                            {formatAttitudeAngle(
                                                                botIMU?.getPitch(),
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>IMU Cal</td>
                                                        <td>{botIMU?.getCalibrationStatus()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </AccordionDetails>
                                    </Accordion>
                                </ThemeProvider>

                                <ThemeProvider theme={accordionTheme}>
                                    <Accordion
                                        expanded={globalContext.botAccordionStates.sensor}
                                        onChange={() =>
                                            globalDispatch({
                                                type: GlobalActions.CLICKED_BOT_ACCORDION,
                                                botAccordionName: BotAccordionNames.SENSOR,
                                            })
                                        }
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
                                                                ?.getTemperature()
                                                                ?.toFixed(prec)}{" "}
                                                            °C
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Depth</td>
                                                        <td>
                                                            {botPressureSensor
                                                                ?.getDepth()
                                                                ?.toFixed(prec)}{" "}
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
