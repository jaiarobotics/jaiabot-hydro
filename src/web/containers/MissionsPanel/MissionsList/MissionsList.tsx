import React, { useContext } from "react";
import { PodContext } from "../../../context/Pod/PodContext";

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
    const podContext = useContext(PodContext);

    if (!podContext || !podContext.missions) {
        return <div></div>;
    }

    const handleAccordionChange = (isExpanded: boolean) => {
        console.log(isExpanded);
    };

    return (
        <div className="missions-list">
            {Array.from(podContext.missions.values()).map((mission) => {
                return (
                    <ThemeProvider theme={accordionTheme} key={mission.getMissionID()}>
                        <Accordion
                            className="mission-accordion"
                            onChange={(event, expanded) => handleAccordionChange(expanded)}
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
                            <AccordionDetails></AccordionDetails>
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
                {props.assignedBotID ? `Bot-${props.assignedBotID}` : "Unassigned"}
            </p>
        </div>
    );
}
