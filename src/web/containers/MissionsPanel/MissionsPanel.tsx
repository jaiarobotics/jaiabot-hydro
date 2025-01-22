// React
import React, { useContext } from "react";

import MissionSpeedSettings from "../MissionControllerPanel/MissionSpeedSettings/MissionSpeedSettings";
import { MissionDispatchContext } from "../../context/Mission/MissionContext";
import { GlobalDispatchContext } from "../../context/Global/GlobalContext";
import { MissionActions } from "../../context/Mission/mission-action";
import { GlobalActions } from "../../context/Global/GlobalActions";

// Data model
import Mission from "../../data/missions/mission";
import { missions } from "../../data/missions/missions";

// Style
import Button from "@mui/material/Button";
import Icon from "@mdi/react";
import { mdiDelete, mdiPlus } from "@mdi/js";

import "./MissionsPanel.less";
import "../../style/stylesheets/util.less";

export default function MissionsPanel() {
    const globalDispatch = useContext(GlobalDispatchContext);
    const missionDispatch = useContext(MissionDispatchContext);

    const handleAddMissionClick = () => {
        globalDispatch({ type: GlobalActions.DESELECT_POD_ELEMENT });

        // Update data model
        missions.addMission(new Mission());

        // Update MissionContext
        missionDispatch({ type: MissionActions.SYNC });

        autoScrollMissions();
    };

    const autoScrollMissions = () => {};

    const handleDeleteAllMissionsClick = () => {};

    return (
        <div className="jaia-panel missions-panel">
            <div className="jaia-panel-title">Mission Panel</div>
            <MissionSpeedSettings />
            <div className="jaia-button-row">
                <Button className="jaia-button" onClick={() => handleAddMissionClick()}>
                    <Icon path={mdiPlus} title="Add mission" />
                </Button>
                <Button className="jaia-button" onClick={() => handleDeleteAllMissionsClick()}>
                    <Icon path={mdiDelete} title="Delete all missions"></Icon>
                </Button>
            </div>
        </div>
    );
}
