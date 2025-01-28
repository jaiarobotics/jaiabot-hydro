import React, { useEffect, useContext } from "react";
import {
    JaiaSystemContext,
    JaiaSystemDispatchContext,
} from "../../context/JaiaSystem/JaiaSystemContext";
import { JaiaSystemActions } from "../../context/JaiaSystem/jaia-system-actions";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Bot from "../../data/bots/bot";
import { missionsManager } from "../../data/missions_manager/missions-manager";

const UNASSIGNED_ID = -1;

interface Props {
    missionID: number;
}

export default function MissionAssignMenu(props: Props) {
    const jaiaSystemContext = useContext(JaiaSystemContext);
    const jaiaSystemDispatch = useContext(JaiaSystemDispatchContext);

    /**
     * Provides MenuItem value needed to display text in the Select element
     *
     * @returns Number The MenuItem value which maps to `Bot-{BotID}` or "Unassigned"
     */
    const getMenuValue = () => {
        return missionsManager.getBot(props.missionID);
    };

    /**
     * Updates the data model and JaiaSystemContext with new mission assignment
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
        missionsManager.assign(selectedBotID, props.missionID);

        // Update JaiaSystemContext
        jaiaSystemDispatch({ type: JaiaSystemActions.SYNC_REQUESTED });
    };

    /**
     * If a Bot is not assigned to a mission or the Bot is already assigned to this mission, display it in the dropdown menu
     *
     * @param {Bot} bot Used to access its ID and its assigned mission ID
     * @returns <MenuItem> A dropdown option for a MUI Select element
     *
     * @notes
     * If the Bot is already assigned to this mission, we need to display the Bot in the dropdown menu
     * because the selected element needs to be an option in the menu
     *
     * This function is called each time the Select component calls the onChange handler
     */
    const generateMenuItems = (bot: Bot) => {
        const botAssignment = missionsManager.getMission(bot.getBotID());

        if (botAssignment === UNASSIGNED_ID || botAssignment === props.missionID) {
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
                <MenuItem value={UNASSIGNED_ID}>Unassigned</MenuItem>
                {Array.from(jaiaSystemContext.bots.values()).map((bot) => generateMenuItems(bot))}
            </Select>
        </FormControl>
    );
}
