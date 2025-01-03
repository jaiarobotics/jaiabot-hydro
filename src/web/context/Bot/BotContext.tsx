// React
import React, { createContext, ReactNode, useEffect, useReducer } from "react";

// Jaia
import { PortalBotStatus } from "../../shared/PortalStatus";
import { BotActions } from "./BotActions";
import { jaiaAPI } from "../../utils/jaia-api";

// Utilities
import { isError } from "lodash";

type BotStatuses = { [key: number]: PortalBotStatus };

interface BotContextType {
    botStatuses: BotStatuses;
}

interface Action {
    type: string;
    botStatuses?: BotStatuses;
}

interface BotContextProviderProps {
    children: ReactNode;
}

const BOT_POLL_TIME = 1000; // ms

export const BotContext = createContext<BotContextType>(null);
export const BotDispatchContext = createContext(null);

/**
 * Updates BotContext
 *
 * @param {BotContextType} state Holds the most recent reference to state
 * @param {Action} action Contains data associated with a state update
 * @returns {BotContextType} The updated state object
 */
function botReducer(state: BotContextType, action: Action) {
    let mutableState = { ...state };
    switch (action.type) {
        case BotActions.BOT_STATUS_POLLED:
            return handleBotStatusPolled(mutableState, action.botStatuses);
        default:
            return state;
    }
}

/**
 * Saves the latest bot statuses to state
 *
 * @param {BotContextType} mutableState State object ref for making modifications
 * @returns {BotContextType} Updated mutable state object
 */
function handleBotStatusPolled(mutableState: BotContextType, botStatuses: BotStatuses) {
    if (!botStatuses) throw new Error("Invalid botStatuses");
    mutableState.botStatuses = botStatuses;
    return mutableState;
}

export function BotContextProvider({ children }: BotContextProviderProps) {
    const [state, dispatch] = useReducer(botReducer, null);

    /**
     * Starts polling bot statuses when component mounts
     *
     * @returns {void}
     */
    useEffect(() => {
        const intervalId = pollBotStatuses(dispatch);

        // Clean up when component dismounts
        return () => clearInterval(intervalId);
    }, []);

    return (
        <BotContext.Provider value={state}>
            <BotDispatchContext.Provider value={dispatch}>{children}</BotDispatchContext.Provider>
        </BotContext.Provider>
    );
}

/**
 * Retrieves the latest bot statuses from the server
 *
 * @param {React.Dispatch<Action>} dispatch Connects event trigger to event handler
 * @returns {void}
 */
function pollBotStatuses(dispatch: React.Dispatch<Action>) {
    return setInterval(async () => {
        const response = await jaiaAPI.getStatus();
        if (!isError(response)) {
            dispatch({
                type: BotActions.BOT_STATUS_POLLED,
                botStatuses: response.bots,
            });
        }
    }, BOT_POLL_TIME);
}
