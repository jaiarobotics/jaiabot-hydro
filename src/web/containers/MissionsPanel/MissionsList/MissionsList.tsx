import React, { useContext } from "react";
import {
    GlobalContext,
    GlobalContextType,
    GlobalDispatchContext,
} from "../../../context/Global/GlobalContext";
import { GlobalActions } from "../../../context/Global/GlobalActions";
import {
    OperationContext,
    OperationContextType,
} from "../../../context/Operation/OperationContext";

import MissionAssignMenu from "../../../components/MissionAssignMenu/MissionAssignMenu";

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
    assignedBotID: number;
}

// Disable animations from MUI accordions because of lag experienced by operators
const accordionTheme = createTheme({ transitions: { create: () => "none" } });

export default function MissionsList() {
    const globalContext: GlobalContextType = useContext(GlobalContext);
    const operationContext: OperationContextType = useContext(OperationContext);

    const globalDispatchContext = useContext(GlobalDispatchContext);

    if (!globalContext || !operationContext) {
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
            {Array.from(operationContext.missions.values()).map((mission) => {
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
                                <MissionAccordionTitle
                                    missionID={mission.getMissionID()}
                                    assignedBotID={mission.getAssignedBotID()}
                                />
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
    return (
        <div className="mission-accordion-title">
            <p>{`Mission-${props.missionID}`}</p>
            <p className="mission-assignment">
                {props.assignedBotID > 0 ? `Bot-${props.assignedBotID}` : "Unassigned"}
            </p>
        </div>
    );
}
