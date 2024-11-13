import React, { ReactElement, useState, useContext, useEffect } from "react";
import {
    GlobalContext,
    GlobalDispatchContext,
    GlobalContextType,
} from "../../../context/GlobalContext";
import { GlobalActions } from "../../../context/actions/GlobalActions";

import { Map } from "ol";

import JaiaToggle from "./JaiaToggle";
import SetHubLocation from "./SetHubLocation";
import ScanForBotPanel from "./ScanForBotPanel";
import QueryBotStatusPanel from "./QueryBotStatusPanel";
import { JaiaAPI } from "../../common/JaiaAPI";
import { taskData } from "./TaskPackets";
import { PanelType } from "./CommandControl/CommandControl";
import { PIDGainsPanel } from "./PIDGainsPanel";
import { PortalBotStatus, PortalHubStatus } from "./shared/PortalStatus";

import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ThemeProvider, createTheme } from "@mui/material";

import { Icon } from "@mdi/react";
import { mdiSendVariant } from "@mdi/js";

import "../style/components/SettingsPanel.css";

interface Props {
    taskPacketsTimeline: { [key: string]: string | boolean };
    isClusterModeOn: boolean;
    iseDNAOn: boolean;
    toggleeDNA: (bot_id: number) => boolean;
    handleTaskPacketEditDatesToggle: () => void;
    handleTaskPacketsTimelineChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmitTaskPacketsTimeline: () => void;
    handleKeepEndDateCurrentToggle: () => void;
    isTaskPacketsSendBtnDisabled: () => boolean;
    setClusterModeStatus: (isOn: boolean) => void;
    setVisiblePanel: (panelType: PanelType) => void;
    trackBot: (id: number | string) => void;
    trackingTarget: string | number | null;
    visiblePanel: PanelType;
    zoomToPod: (firstMove: boolean) => void;
    selectBot: (bot_id: number) => void;

    // Engineering Accordion Props
    api: JaiaAPI;
    map: Map;
    isSimulation: boolean;
    bots: { [key: number]: PortalBotStatus };
    hubs: { [key: number]: PortalHubStatus };
    getSelectedBotId: () => number;
    getFleetId: () => number;
    control: (onSuccess: () => void) => void;
}

enum AccordionTabs {
    TaskPackets = "TASK_PACKETS",
    MapLayers = "MAP_LAYERS",
    Engineering = "ENGINEERING",
    Simulation = "SIMULATION",
}

/**
 * Defines layout and functionality of the SettingsPanel
 *
 * @param {Props} props Data from CommandControl used in the panel
 * @returns {string} Web content of Settings Panel
 */
export function SettingsPanel(props: Props) {
    const globalContext: GlobalContextType = useContext(GlobalContext);
    const globalDispatch = useContext(GlobalDispatchContext);

    const [openAccordionTabs, setOpenAccordionTabs] = useState([]);
    const [accordionTheme, setAccordionTheme] = useState(
        createTheme({
            transitions: {
                create: () => "none",
            },
        }),
    );

    // Source: Facebook's Slingshot
    const [isMobile, setIsMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const handleClusterToggleClick = () => {
        // Task packets within this distance (meters) will be clustered
        const defaultDistance = 30;

        if (props.isClusterModeOn) {
            taskData.updateClusterDistance(0);
        } else {
            taskData.updateClusterDistance(defaultDistance);
        }

        props.setClusterModeStatus(!props.isClusterModeOn);
    };

    const handleTrackPodToggleClick = () => {
        if (props.trackingTarget === "pod") {
            props.zoomToPod(false);
            props.trackBot(null);
        } else {
            props.zoomToPod(true);
            props.trackBot("pod");
        }
    };

    const isOpenAccordionTab = (accordionTab: AccordionTabs) => {
        return openAccordionTabs.includes(accordionTab);
    };

    const handleAccordionTabClick = (accordionTab: AccordionTabs) => {
        let updatedOpenAccordionTabs = [...openAccordionTabs];

        if (isOpenAccordionTab(accordionTab)) {
            for (let i = 0; i < openAccordionTabs.length; i++) {
                if (openAccordionTabs[i] === accordionTab) {
                    updatedOpenAccordionTabs.splice(i, 1);
                    setOpenAccordionTabs(updatedOpenAccordionTabs);
                }
            }
        } else {
            updatedOpenAccordionTabs.push(accordionTab);
            setOpenAccordionTabs(updatedOpenAccordionTabs);
        }
    };

    const fullscreenToggle = (): ReactElement => {
        if (isMobile) {
            return (
                <div className="settings-card">
                    <div className="settings-label" style={{ color: "white" }}>
                        Full Screen:
                    </div>
                    <JaiaToggle
                        checked={() => globalContext.isFullscreen}
                        onClick={() => globalDispatch({ type: GlobalActions.TOGGLED_FULLSCREEN })}
                    />
                </div>
            );
        }
        return <div></div>;
    };

    const simulationAccordion = (): ReactElement => {
        if (!props.isSimulation) {
            return null;
        }
        return (
            <ThemeProvider theme={accordionTheme}>
                <Accordion
                    expanded={isOpenAccordionTab(AccordionTabs.Simulation)}
                    onChange={() => handleAccordionTabClick(AccordionTabs.Simulation)}
                    className="accordionContainer"
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Simulation</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="settings-accordion-inner-container">
                        <div className="settings-card hub-location-card">
                            <SetHubLocation map={props.map} hubs={props.hubs} api={props.api} />
                        </div>
                    </AccordionDetails>
                </Accordion>
            </ThemeProvider>
        );
    };

    let bots = props.bots;
    let botId: number = null;

    function didSelectBot(bot_id: number) {}

    // No bots in list
    if (bots == null || Object.keys(bots).length == 0) {
        return <div></div>;
    }

    // If we haven't selected a bot yet, and there are bots available, then select the lowest indexed bot
    if (botId == null) {
        botId = Number(Object.keys(bots)[0]);
    }

    let botSelector = (
        <div>
            <label style={{ fontSize: "32px", marginRight: "25px", color: "#0bc9cd" }}>Bot</label>
            <select
                style={{ width: "50px", marginBottom: "10px", color: "#0bc9cd" }}
                name="bot"
                id="pid_gains_bot_selector"
                defaultValue={botId}
                onChange={() => props.selectBot(botId)}
            >
                {bots
                    ? Object.keys(bots).map((botId) => (
                          <option key={botId} value={botId}>
                              {botId}
                          </option>
                      ))
                    : ""}
            </select>
        </div>
    );

    const ednaActiveClass = props.iseDNAOn ? " edna-active" : " edna-inactive";
    const ednaOnButton = (
        <div className="panel">
            {botSelector}
            <Button
                className={"button-jcc engineering-panel-button" + ednaActiveClass}
                onClick={() => props.toggleeDNA(bots[botId].bot_id)}
            >
                eDNA Pump
            </Button>
        </div>
    );

    return (
        <div className="settings-outer-container">
            <div className="panel-heading">Settings</div>
            <div className="settings-inner-container">
                <div className="settings-card-container">
                    {fullscreenToggle()}
                    <div className="settings-card">
                        <div className="settings-label" style={{ color: "white" }}>
                            Track Pod:
                        </div>
                        <JaiaToggle
                            checked={() => props.trackingTarget === "pod"}
                            onClick={() => handleTrackPodToggleClick()}
                        />
                    </div>
                </div>
                <ThemeProvider theme={accordionTheme}>
                    <Accordion
                        expanded={isOpenAccordionTab(AccordionTabs.TaskPackets)}
                        onChange={() => handleAccordionTabClick(AccordionTabs.TaskPackets)}
                        className="accordionContainer"
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Task Packets</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="settings-accordion-inner-container">
                            <div className="settings-card">
                                <div className="settings-label">Clusters:</div>
                                <JaiaToggle
                                    checked={() => props.isClusterModeOn}
                                    onClick={() => handleClusterToggleClick()}
                                />
                            </div>
                            <div className="settings-card">
                                <div className="settings-label">Edit Dates:</div>
                                <JaiaToggle
                                    checked={() => props.taskPacketsTimeline.isEditing as boolean}
                                    onClick={() => props.handleTaskPacketEditDatesToggle()}
                                />
                            </div>
                            <div
                                className={`settings-card-grid
                                ${props.taskPacketsTimeline.isEditing ? " visible" : " hidden"}`}
                            >
                                <div className="settings-label">Start Date:</div>
                                <input
                                    id="task-packet-start-date"
                                    type="date"
                                    value={props.taskPacketsTimeline.startDate as string}
                                    onChange={(evt) => props.handleTaskPacketsTimelineChange(evt)}
                                    max={""}
                                ></input>
                                <input
                                    id="task-packet-start-time"
                                    type="time"
                                    value={props.taskPacketsTimeline.startTime as string}
                                    onChange={(evt) => props.handleTaskPacketsTimelineChange(evt)}
                                ></input>

                                <div className="settings-label">End Date:</div>
                                <input
                                    id="task-packet-end-date"
                                    type="date"
                                    value={props.taskPacketsTimeline.endDate as string}
                                    onChange={(evt) => props.handleTaskPacketsTimelineChange(evt)}
                                ></input>
                                <input
                                    id="task-packet-end-time"
                                    type="time"
                                    value={props.taskPacketsTimeline.endTime as string}
                                    onChange={(evt) => props.handleTaskPacketsTimelineChange(evt)}
                                ></input>

                                <div className="task-packet-button-container">
                                    <div className="task-packet-checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={
                                                props.taskPacketsTimeline
                                                    .keepEndDateCurrent as boolean
                                            }
                                            onChange={() => props.handleKeepEndDateCurrentToggle()}
                                        ></input>
                                        <label>Keep End Date Current</label>
                                    </div>
                                    <div
                                        className={`settings-send-btn
                                            ${props.isTaskPacketsSendBtnDisabled() ? " disabled" : ""}`}
                                        onClick={() => props.handleSubmitTaskPacketsTimeline()}
                                    >
                                        <Icon path={mdiSendVariant} title="Get Task Packets" />
                                    </div>
                                </div>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </ThemeProvider>
                <ThemeProvider theme={accordionTheme}>
                    <Accordion
                        expanded={isOpenAccordionTab(AccordionTabs.MapLayers)}
                        onChange={() => handleAccordionTabClick(AccordionTabs.MapLayers)}
                        className="accordionContainer"
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Map Layers</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="settings-accordion-inner-container">
                            <div className="map-layers-inner-container" id="mapLayers"></div>
                        </AccordionDetails>
                    </Accordion>
                </ThemeProvider>
                <ThemeProvider theme={accordionTheme}>
                    <Accordion
                        expanded={isOpenAccordionTab(AccordionTabs.Engineering)}
                        onChange={() => handleAccordionTabClick(AccordionTabs.Engineering)}
                        className="accordionContainer"
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Engineering</Typography>
                        </AccordionSummary>
                        <AccordionDetails className="settings-accordion-inner-container">
                            <div id="engineeringPanel">
                                {ednaOnButton}
                                <div className="panel">
                                    <Button
                                        className="button-jcc engineering-panel-btn"
                                        onClick={() => window.open("/jed/")}
                                    >
                                        JaiaBot Engineer & Debug
                                    </Button>
                                </div>

                                <PIDGainsPanel
                                    bots={props.bots}
                                    control={props.control}
                                    api={props.api}
                                />

                                <QueryBotStatusPanel control={props.control} api={props.api} />

                                <ScanForBotPanel
                                    hubs={props.hubs}
                                    control={props.control}
                                    api={props.api}
                                />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </ThemeProvider>

                {simulationAccordion()}
            </div>
        </div>
    );
}
