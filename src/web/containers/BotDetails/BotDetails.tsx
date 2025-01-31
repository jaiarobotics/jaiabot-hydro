import React, { useContext, useState, useEffect } from "react";

// Jaia Imports
import { CommandInfo, botCommands } from "../../types/commands";
import {
    getStatusAgeSeconds,
    getStatusAgeClass,
    getDistToHub,
    getWaypontHelperText,
    getBotOffloadPercent,
    getRepeatProgress,
    getActiveWptStrings,
    isBotLogging,
    disableButton,
    disableClearRunButton,
    disablePlayButton,
    runMission,
    toggleEditMode,
} from "./bot-details";
import { sendBotCommand, sendBotRunCommand, sendBotRCCommand } from "../../utils/command";
import JaiaToggle from "../../components/JaiaToggle/JaiaToggle";
import { Missions } from "../../missions/missions";
import { missionsManager } from "../../data/missions_manager/missions-manager";
import { MissionStatus } from "../../types/jaia-system-types";
import BotSensors from "../../data/bots/bot-sensors";
import Bot from "../../data/bots/bot";
import GPS from "../../data/sensors/gps";
import IMU from "../../data/sensors/imu";

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
    GlobalAction,
    BotAccordionNames,
    NodeType,
} from "../../context/Global/GlobalContext";
import { JaiaSystemContext } from "../../context/JaiaSystem/JaiaSystemContext";

import { GlobalActions } from "../../context/Global/GlobalActions";

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
import { CustomAlert } from "../../shared/CustomAlert";
import { missions } from "../../data/missions/missions";

const rcMode = require("../../style/icons/controller.svg");

export interface BotDetailsProps {
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

export function BotDetails(props: BotDetailsProps) {
    // TODO We will replace of these old objects from Props with ones from context
    const missionFromProps = props.mission;

    const takeControl = props.takeControl;
    const deleteSingleMission = props.deleteSingleMission;
    takeControlFunction = props.takeControl;
    // End Old code

    const globalContext = useContext(GlobalContext);
    const globalDispatch: React.Dispatch<GlobalAction> = useContext(GlobalDispatchContext);

    const jaiaSystemContext = useContext(JaiaSystemContext);

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
        jaiaSystemContext === null ||
        globalContext === null ||
        globalContext.visibleDetails != NodeType.BOT ||
        globalContext.selectedNode.type != NodeType.BOT
    ) {
        return <div></div>;
    }

    // Pull Data from the Context
    const DEFAULT_HUB_ID = 1;
    const hub = jaiaSystemContext.hubs.get(DEFAULT_HUB_ID);

    const botID = globalContext.selectedNode.id;
    const bot = jaiaSystemContext.bots.get(botID);

    // Make sure we have a bot
    if (!bot) {
        return <div></div>;
    }

    // TODO some mission related code was changed to use the mission
    // from globalContext but the management of missions in globablContext
    // is not complete.  getMissionID will return -1 untill it is done
    // known bugs affected by this include
    // Edit Mode Toggle, Play Button etc
    let mission: Mission;
    const missionID = missionsManager.getMissionID(botID);
    if (missionID != missionsManager.UNASSIGNED_ID) {
        mission = missions.getMission(missionID);
    }

    const missionStatus: MissionStatus = bot.getMissionStatus();
    const botSensors: BotSensors = bot.getBotSensors();
    const botGPS: GPS = botSensors?.getGPS();
    const botIMU: IMU = botSensors?.getIMU();

    const missionState = missionStatus?.missionState;

    let displayPrecision = 2;

    /**
     * Provides data offload button
     *
     * @returns {React.Fragment} data offload button HTML
     */
    function dataOffloadButton() {
        // TODO This logic should be cleaned up and simplified
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
        return dataOffloadButton;
    }

    /**
     * Provides Health Row
     *
     * @returns {React.Fragment} Health row HTML
     */
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

    /**
     * Dispatches an action to close the BotDetails panel
     *
     * @returns {void}
     */
    function handleClosePanel() {
        globalDispatch({ type: GlobalActions.CLOSED_DETAILS });
    }

    /**
     * Dispatches an action to toggle accordion states
     *
     * @returns {void}
     */
    function handleAccordionClick(accordionName: BotAccordionNames) {
        globalDispatch({
            type: GlobalActions.CLICKED_BOT_ACCORDION,
            botAccordionName: accordionName,
        });
    }

    /**
     * Handles System Check Button Click
     *
     * @returns {void}
     */
    function handleSystemCheckClick() {
        issueCommand(
            botID,
            botCommands.active,
            disableButton(botCommands.active, missionState).disableMessage,
        );
    }

    /**
     * Handles Stop Mission Button Click
     *
     * @returns {void}
     */
    function handleStopMissionClick() {
        issueCommand(
            botID,
            botCommands.stop,
            disableButton(botCommands.stop, missionState).disableMessage,
            props.setRcMode,
        );
    }

    /**
     * Handles Activate RC Button Click
     *
     * @returns {void}
     */
    async function handleActivateRCClick() {
        issueRCCommand(
            bot,
            await runRCMode(bot),
            props.isRCModeActive,
            props.setRcMode,
            disableButton(botCommands.rcMode, missionState, botID, props.downloadQueue)
                .disableMessage,
        );
    }

    /**
     * Handles Next Task Button Click
     *
     * @returns {void}
     */
    function handleNextTaskClick() {
        issueCommand(
            botID,
            botCommands.nextTask,
            disableButton(botCommands.nextTask, missionState).disableMessage,
        );
    }

    /**
     * Handles Play Button Click
     *
     * @returns {void}
     */
    async function handlePlayButtonClick() {
        if (
            bot.getHealthState() === "HEALTH__FAILED" &&
            missionStatus?.missionState !== MissionState.PRE_DEPLOYMENT__IDLE &&
            missionStatus?.missionState !== MissionState.PRE_DEPLOYMENT__FAILED
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
    }

    /**
     * Handles Shut Down Bot Click
     *
     * @returns {void}
     */
    async function handleBotShutDownClick() {
        if (missionStatus?.missionState == "IN_MISSION__UNDERWAY__RECOVERY__STOPPED") {
            (await CustomAlert.confirmAsync(
                `Are you sure you'd like to shutdown bot: ${botID} without doing a data offload?`,
                "Shutdown Bot",
            ))
                ? issueCommand(
                      botID,
                      botCommands.shutdown,
                      disableButton(botCommands.shutdown, missionState, botID, props.downloadQueue)
                          .disableMessage,
                  )
                : false;
        } else {
            issueCommand(
                botID,
                botCommands.shutdown,
                disableButton(botCommands.shutdown, missionState, botID, props.downloadQueue)
                    .disableMessage,
            );
        }
    }

    /**
     * Handles Reboot Bot Click
     *
     * @returns {void}
     */
    async function handleRebootBotClick() {
        if (missionStatus?.missionState == "IN_MISSION__UNDERWAY__RECOVERY__STOPPED") {
            (await CustomAlert.confirmAsync(
                `Are you sure you'd like to reboot bot: ${botID} without doing a data offload?`,
                "Reboot Bot",
            ))
                ? issueCommand(
                      botID,
                      botCommands.reboot,
                      disableButton(botCommands.reboot, missionState, botID, props.downloadQueue)
                          .disableMessage,
                  )
                : false;
        } else {
            issueCommand(
                botID,
                botCommands.reboot,
                disableButton(botCommands.reboot, missionState, botID, props.downloadQueue)
                    .disableMessage,
            );
        }
    }

    /**
     * Handles Restart Bot Services Click
     *
     * @returns {void}
     */
    async function handleRestartBotClick() {
        if (missionStatus?.missionState == "IN_MISSION__UNDERWAY__RECOVERY__STOPPED") {
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
                disableButton(botCommands.restartServices, missionState, botID, props.downloadQueue)
                    .disableMessage,
            );
        }
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

    return (
        <React.Fragment>
            <div id="botDetailsBox">
                <div className="botDetailsHeading">
                    <div className="titleBar">
                        <h2 className="botName">{`Bot ${botID}`}</h2>
                        <h4 className="runName">{mission?.getMissionID() ?? "No Run"}</h4>
                        <div
                            className="closeButton"
                            onClick={() => {
                                handleClosePanel();
                            }}
                        >
                            ⨯
                        </div>
                    </div>
                    <h3 className="name">{getWaypontHelperText(mission)}</h3>
                    <div className="botDetailsToolbar">
                        <Button
                            className={
                                disableButton(botCommands.stop, missionState).isDisabled
                                    ? "inactive button-jcc"
                                    : " button-jcc stopMission"
                            }
                            onClick={() => {
                                handleStopMissionClick();
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
                            onClick={() => {
                                handlePlayButtonClick();
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
                            onChange={() => {
                                handleAccordionClick(BotAccordionNames.QUICKLOOK);
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
                                        <tr className={getStatusAgeClass(bot)}>
                                            <td>Status Age</td>
                                            <td>{getStatusAgeSeconds(bot).toFixed(0)} s</td>
                                        </tr>
                                        <tr>
                                            <td>Mission State</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {missionStatus?.missionState?.replaceAll(
                                                    "__",
                                                    "\n",
                                                ) + getBotOffloadPercent(botID, hub)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Battery Percentage</td>
                                            <td>
                                                {bot.getBatteryPercent()?.toFixed(displayPrecision)}{" "}
                                                %
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Repeat Number</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {getRepeatProgress(mission, missionStatus)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Active Goal</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {getActiveWptStrings(missionStatus).activeWptString}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Distance to Goal</td>
                                            <td style={{ whiteSpace: "pre-line" }}>
                                                {getActiveWptStrings(missionStatus).distToWpt}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Distance from Hub</td>
                                            <td>{getDistToHub(bot, hub)} m</td>
                                        </tr>
                                        <tr>
                                            <td>Wi-Fi Link Quality</td>
                                            <td>{bot.getWifiLinkQuality() + " %"}</td>
                                        </tr>
                                        <tr>
                                            <td>Data Logging</td>
                                            <td>
                                                {isBotLogging(missionState)
                                                    .toString()
                                                    .toUpperCase()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>

                    <ThemeProvider theme={accordionTheme}>
                        <Accordion
                            expanded={globalContext.botAccordionStates.commands}
                            onChange={() => {
                                handleAccordionClick(BotAccordionNames.COMMANDS);
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
                                        handleSystemCheckClick();
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
                                        handleActivateRCClick();
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
                                        handleNextTaskClick();
                                    }}
                                >
                                    <Icon path={mdiSkipNext} title="Next Task" />
                                </Button>

                                {dataOffloadButton()}

                                <Accordion
                                    expanded={globalContext.botAccordionStates.advancedCommands}
                                    onChange={() => {
                                        handleAccordionClick(BotAccordionNames.ADVANCEDCOMMANDS);
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
                                                handleBotShutDownClick();
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
                                                handleRebootBotClick();
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
                                                handleRestartBotClick();
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
                            onChange={() => {
                                handleAccordionClick(BotAccordionNames.HEALTH);
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
                            expanded={globalContext.botAccordionStates.data}
                            onChange={() => {
                                handleAccordionClick(BotAccordionNames.DATA);
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
                                        expanded={globalContext.botAccordionStates.GPS}
                                        onChange={() => {
                                            handleAccordionClick(BotAccordionNames.GPS);
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
                                                        <td>{formatLatitude(botGPS?.getLat())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Longitude</td>
                                                        <td>{formatLongitude(botGPS?.getLon())}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>HDOP</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getHDOP()
                                                                ?.toFixed(displayPrecision)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>PDOP</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getPDOP()
                                                                ?.toFixed(displayPrecision)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ground Speed</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getSpeedOverGround()
                                                                ?.toFixed(displayPrecision)}{" "}
                                                            m/s
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Course Over Ground</td>
                                                        <td>
                                                            {botGPS
                                                                ?.getCourseOverGround()
                                                                ?.toFixed(displayPrecision)}
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
                                        onChange={() => {
                                            handleAccordionClick(BotAccordionNames.IMU);
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
                                        onChange={() => {
                                            handleAccordionClick(BotAccordionNames.SENSOR);
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
                                                            {botSensors
                                                                ?.getTemperatureSensor()
                                                                ?.getTemperature()
                                                                ?.toFixed(displayPrecision)}{" "}
                                                            °C
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Depth</td>
                                                        <td>
                                                            {botSensors
                                                                ?.getPressureSensor()
                                                                ?.getDepth()
                                                                ?.toFixed(displayPrecision)}{" "}
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
