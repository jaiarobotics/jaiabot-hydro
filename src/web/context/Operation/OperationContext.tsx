// React
import React, { createContext, ReactNode, useEffect, useReducer } from "react";

import { OperationActions } from "./operation-actions";

import { bots } from "../../data/bots/bots";
import { hubs } from "../../data/hubs/hubs";
import { missions } from "../../data/missions/missions";
import Bot from "../../data/bots/bot";
import Hub from "../../data/hubs/hub";
import Mission from "../../data/missions/mission";

interface OperationContextType {
    bots: Map<number, Bot>;
    hubs: Map<number, Hub>;
    missions: Map<number, Mission>;
}

interface Action {
    type: OperationActions;
    bots?: Map<number, Bot>;
    hubs?: Map<number, Hub>;
    missions?: Map<number, Mission>;
}

interface OperationContextProviderProps {
    children: ReactNode;
}

const DATA_MODEL_POLL_TIME = 500; // milliseconds

export const OperationContext = createContext<OperationContextType>(null);
export const OperationDispatchContext = createContext(null);

/**
 * Updates OperationContext
 *
 * @param {OperationContextType} state Holds the most recent reference to state
 * @param {Action} action Contains data associated with a state update
 * @returns {OperationContextType} The updated state object
 */
function operationReducer(state: OperationContextType, action: Action) {
    let mutableState = { ...state };
    switch (action.type) {
        case OperationActions.DATA_MODEL_POLLED:
            return handleDataModelPolled(mutableState, action.bots, action.hubs);
        case OperationActions.SYNC_REQUESTED:
            return handleSyncRequested(mutableState);
        default:
            return state;
    }
}

/**
 * Saves the latest data from incoming Bot and Hub status messages to state
 *
 * @param {OperationContextType} mutableState State object ref for making modifications
 * @param {Map<number, Bot>} bots Contains most up to date data on Bots
 * @param {Map<number, Hub>} hubs Contains most up to date data on Hubs
 * @returns {OperationContextType} Updated mutable state object
 */
function handleDataModelPolled(
    mutableState: OperationContextType,
    bots: Map<number, Bot>,
    hubs: Map<number, Hub>,
) {
    mutableState.bots = bots;
    mutableState.hubs = hubs;
    return mutableState;
}

/**
 * Puts React in sync with the data model
 *
 * @param {OperationContextType} mutableState State object ref for making modifications
 * @returns {OperationContextType} Updated mutable state object
 */
function handleSyncRequested(mutableState: OperationContextType) {
    mutableState.bots = bots.getBots();
    mutableState.hubs = hubs.getHubs();
    mutableState.missions = missions.getMissions();
    return mutableState;
}

export function OperationContextProvider({ children }: OperationContextProviderProps) {
    const [state, dispatch] = useReducer(operationReducer, null);

    /**
     * Starts polling data model when component mounts
     *
     * @returns {void}
     */
    useEffect(() => {
        const intervalID = pollDataModel(dispatch);

        // Clean up when component dismounts
        return () => clearInterval(intervalID);
    }, []);

    return (
        <OperationContext.Provider value={state}>
            <OperationDispatchContext.Provider value={dispatch}>
                {children}
            </OperationDispatchContext.Provider>
        </OperationContext.Provider>
    );
}

/**
 * Retrieves latest data posted for Bots and Hubs from incoming status messages
 *
 * @param {React.Dispatch<Action>} dispatch Connects event trigger to event handler
 * @returns {void}
 *
 * @notes
 * We do not poll for changes in the Missions singleton since those changes only come from user interactions
 */
function pollDataModel(dispatch: React.Dispatch<Action>) {
    return setInterval(() => {
        dispatch({
            type: OperationActions.DATA_MODEL_POLLED,
            bots: bots.getBots(),
            hubs: hubs.getHubs(),
        });
    }, DATA_MODEL_POLL_TIME);
}
