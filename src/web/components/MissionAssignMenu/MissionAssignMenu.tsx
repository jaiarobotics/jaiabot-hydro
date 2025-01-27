import React, { useEffect, useContext } from "react";
import {
    OperationContext,
    OperationDispatchContext,
} from "../../context/Operation/OperationContext";
import { OperationActions } from "../../context/Operation/operation-actions";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Bot from "../../data/bots/bot";
import { missions } from "../../data/missions/missions";
import { bots } from "../../data/bots/bots";

const UNASSIGNED_BOT_ID = -1;

interface Props {
    missionID: number;
}

export default function MissionAssignMenu(props: Props) {
    const operationContext = useContext(OperationContext);
    const operationDispatch = useContext(OperationDispatchContext);

    const mission = operationContext.missions.get(props.missionID);

    /**
     * Provides MenuItem value needed to display text in the Select element
     *
     * @returns Number The MenuItem value which maps to `Bot-{BotID}` or "Unassigned"
     */
    const getMenuValue = () => {
        return mission.getAssignedBotID() ?? UNASSIGNED_BOT_ID;
    };

    /**
     * Updates the data model and OperationContext with new mission assignment
     *
     * @param {SelectChangeEvent} evt Contains the ID of the item selected
     * @returns {void}
     */
    const handleMenuSelection = (evt: SelectChangeEvent) => {
        const selectedBotID = Number(evt.target.value);

        if (isNaN(selectedBotID)) {
            return;
        }

        // Update data model
        const mission = missions.getMission(props.missionID);
        mission.setAssignedBotID(selectedBotID);

        const bot = bots.getBot(selectedBotID);
        if (bot) {
            bot.setMissionID(mission.getMissionID());
        }

        // Update OperationContext
        operationDispatch({ type: OperationActions.SYNC_REQUESTED });
    };

    /**
     *
     *
     * @param {Bot} bot Used to access its ID and its assigned mission ID
     * @returns <MenuItem>
     */
    const generateMenuItems = (bot: Bot) => {
        if (bot.getMissionID() < 0 || bot.getMissionID() === props.missionID) {
            const botID = bot.getBotID();
            return <MenuItem key={botID} value={botID}>{`Bot-${botID}`}</MenuItem>;
        }
    };

    return (
        <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Bot</InputLabel>
            <Select
                label="Assign"
                onChange={(evt: SelectChangeEvent) => handleMenuSelection(evt)}
                value={getMenuValue().toString()}
            >
                <MenuItem value={UNASSIGNED_BOT_ID}>Unassigned</MenuItem>
                {Array.from(operationContext.bots.values()).map((bot) => generateMenuItems(bot))}
            </Select>
        </FormControl>
    );
}
