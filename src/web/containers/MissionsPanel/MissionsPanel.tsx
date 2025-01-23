// React
import React, { useContext } from "react";

import MissionSpeedSettings from "../MissionControllerPanel/MissionSpeedSettings/MissionSpeedSettings";
import MissionsList from "./MissionsList/MissionsList";
import { GlobalDispatchContext } from "../../context/Global/GlobalContext";
import { OperationDispatchContext } from "../../context/Operation/OperationContext";
import { GlobalActions } from "../../context/Global/GlobalActions";
import { OperationActions } from "../../context/Operation/operation-actions";

// Data model
import Mission from "../../data/missions/mission";
import { missions } from "../../data/missions/missions";

// Style
import Button from "@mui/material/Button";
import Icon from "@mdi/react";
import { mdiAutoFix, mdiContentSave, mdiDelete, mdiFolderOpen, mdiPlus } from "@mdi/js";

import "./MissionsPanel.less";
import "../../style/stylesheets/util.less";

export default function MissionsPanel() {
    const globalDispatch = useContext(GlobalDispatchContext);
    const operationDispatch = useContext(OperationDispatchContext);

    const handleAddMissionClick = () => {
        globalDispatch({ type: GlobalActions.DESELECT_POD_ELEMENT });

        // Update data model
        missions.addMission(new Mission());

        // Update OperationContext
        operationDispatch({ type: OperationActions.SYNC_REQUESTED });

        // Prevents new missions from not being visible in the viewport
        autoScrollMissions();
    };

    const autoScrollMissions = () => {};

    const handleDeleteAllMissionsClick = () => {
        // Update data model
        missions.deleteAllMissions();

        // Update OpenLayers

        // Update OperationContext
        operationDispatch({ type: OperationActions.SYNC_REQUESTED });
    };

    const handleLoadMissionsClick = () => {};

    const handleSaveMissionsClick = () => {};

    const handleAutoAssignClick = () => {};

    return (
        <div className="jaia-panel missions-panel">
            <div className="jaia-panel-title">Mission Set</div>
            <MissionSpeedSettings />
            <div className="jaia-button-row">
                <Button className="jaia-button" onClick={() => handleAddMissionClick()}>
                    <Icon path={mdiPlus} title="Add mission" />
                </Button>
                <Button className="jaia-button" onClick={() => handleDeleteAllMissionsClick()}>
                    <Icon path={mdiDelete} title="Delete all missions" />
                </Button>
                <Button className="jaia-button" onClick={() => handleLoadMissionsClick()}>
                    <Icon path={mdiFolderOpen} title="Load missions" />
                </Button>
                <Button className="jaia-button" onClick={() => handleSaveMissionsClick()}>
                    <Icon path={mdiContentSave} title="Save missions" />
                </Button>
                <Button className="jaia-button" onClick={() => handleAutoAssignClick()}>
                    <Icon path={mdiAutoFix} title="Auto assign Bots" />
                </Button>
            </div>
            <MissionsList />
        </div>
    );
}
