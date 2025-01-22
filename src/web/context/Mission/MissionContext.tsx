// React
import React, { createContext, ReactNode, useEffect, useReducer } from "react";

import Mission from "../../data/missions/mission";
import { MissionActions } from "./mission-action";
import { missions } from "../../data/missions/missions";

interface MissionContextType {
    missions: Map<number, Mission>;
}

interface Action {
    type: MissionActions;
    missions?: Map<number, Mission>;
}

interface MissionContextProviderProps {
    children: ReactNode;
}

export const MissionContext = createContext<MissionContextType>(null);
export const MissionDispatchContext = createContext(null);

/**
 * Updates MissionContext
 *
 * @param {MissionContextType} state Holds the most recent reference to state
 * @param {Action} action Contains data associated with a state update
 * @returns {MissionContextType} The updated state object
 */
function missionReducer(state: MissionContextType, action: Action) {
    let mutableState = { ...state };
    switch (action.type) {
        case MissionActions.SYNC:
            return handleSync(mutableState);
        default:
            return state;
    }
}

/**
 * Puts MissionContext in sync with the latest changes to the data model
 *
 * @param {MissionContextTyoe} mutableState State object ref for making modifications
 * @returns {MissionContextType} The updated state object
 */
function handleSync(mutableState: MissionContextType) {
    mutableState.missions = missions.getMissions();
    return mutableState;
}

export function MissionContextProvider({ children }: MissionContextProviderProps) {
    const [state, dispatch] = useReducer(missionReducer, null);

    return (
        <MissionContext.Provider value={state}>
            <MissionDispatchContext.Provider value={dispatch}>
                {children}
            </MissionDispatchContext.Provider>
        </MissionContext.Provider>
    );
}
