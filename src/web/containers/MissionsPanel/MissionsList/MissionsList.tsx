import React, { useContext } from "react";
import { GlobalContext, GlobalDispatchContext } from "../../../context/Global/GlobalContext";
import { GlobalActions } from "../../../context/Global/GlobalActions";
import { JaiaSystemContext } from "../../../context/JaiaSystem/JaiaSystemContext";

import MissionAssignMenu from "../../../components/MissionAssignMenu/MissionAssignMenu";

import { missionsManager } from "../../../data/missions_manager/missions-manager";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    ThemeProvider,
    createTheme,
} from "@mui/material";

import "./MissionsList.less";

interface MissionAccordionTitleProps {
    missionID: number;
}

const UNASSIGNED_ID = -1;

// Disable animations from MUI accordions because of lag experienced by operators
const accordionTheme = createTheme({ transitions: { create: () => "none" } });

export default function MissionsList() {
    const globalContext = useContext(GlobalContext);
    const jaiaSystemContext = useContext(JaiaSystemContext);

    const globalDispatchContext = useContext(GlobalDispatchContext);

    if (!globalContext || !jaiaSystemContext) {
        return <div></div>;
    }

    const handleAccordionChange = (missionID: number, isExpanded: boolean) => {
        globalDispatchContext({
            type: GlobalActions.CLICKED_MISSION_ACCORDION,
            missionID: missionID,
            isMissionAccordionExpanded: isExpanded,
        });
    };

    const isMissionAccordionExpanded = (missionID: number) => {
        if (missionID in globalContext.missionAccordionStates) {
            return globalContext.missionAccordionStates[missionID];
        }
        return false;
    };

    return (
        <div className="missions-list">
            {Array.from(jaiaSystemContext.missions.values()).map((mission) => {
                return (
                    <ThemeProvider theme={accordionTheme} key={mission.getMissionID()}>
                        <Accordion
                            className="mission-accordion"
                            expanded={isMissionAccordionExpanded(mission.getMissionID())}
                            onChange={(event, expanded) =>
                                handleAccordionChange(mission.getMissionID(), expanded)
                            }
                        >
                            <AccordionSummary
                                className="mission-accordion-summary"
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <MissionAccordionTitle missionID={mission.getMissionID()} />
                            </AccordionSummary>
                            <AccordionDetails>
                                <MissionAssignMenu missionID={mission.getMissionID()} />
                            </AccordionDetails>
                        </Accordion>
                    </ThemeProvider>
                );
            })}
        </div>
    );
}

function MissionAccordionTitle(props: MissionAccordionTitleProps) {
    const assignedBotID = missionsManager.getBot(props.missionID) ?? -1;
    return (
        <div className="mission-accordion-title">
            <p>{`Mission-${props.missionID}`}</p>
            <p className="mission-assignment">
                {assignedBotID === UNASSIGNED_ID ? "Unassigned" : `Bot-${assignedBotID}`}
            </p>
        </div>
    );
}
