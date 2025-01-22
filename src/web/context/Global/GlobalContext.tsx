// React
import React, { createContext, ReactNode, useEffect, useReducer } from "react";

// Jaia
import { jaiaAPI } from "../../utils/jaia-api";
import { GlobalActions } from "./GlobalActions";

export interface GlobalContextType {
    clientID: string;
    controllingClientID: string;
    selectedPodElement: SelectedPodElement;
    shownDetails: PodElement;
    hubAccordionStates: HubAccordionStates;
    botAccordionStates: BotAccordionStates;
    isRCMode: boolean;
}

export interface SelectedPodElement {
    type: PodElement;
    id: number;
}

export const enum HubAccordionNames {
    QUICKLOOK = "quickLook",
    COMMANDS = "commands",
    LINKS = "links",
}

export interface HubAccordionStates {
    quickLook: boolean;
    commands: boolean;
    links: boolean;
}

const defaultHubAccordionStates = {
    quickLook: false,
    commands: false,
    links: false,
};

export const enum BotAccordionNames {
    QUICKLOOK = "quickLook",
    COMMANDS = "commands",
    ADVANCEDCOMMANDS = "advancedCommands",
    HEALTH = "health",
    DATA = "data",
    GPS = "gps",
    IMU = "imu",
    SENSOR = "sensor",
}

export interface BotAccordionStates {
    quickLook: boolean;
    commands: boolean;
    advancedCommands: boolean;
    health: boolean;
    data: boolean;
    gps: boolean;
    imu: boolean;
    sensor: boolean;
}

const defaultBotAccordionStates = {
    quickLook: false,
    commands: false,
    advancedCommands: false,
    health: false,
    data: false,
    gps: false,
    imu: false,
    sensor: false,
};

export interface GlobalAction {
    type: GlobalActions;
    clientID?: string;
    elementType?: PodElement;
    elementID?: number;
    hubAccordionName?: string;
    botAccordionName?: string;
}

interface GlobalContextProviderProps {
    children: ReactNode;
}

export enum PodElement {
    "NONE" = 0,
    "BOT" = 1,
    "HUB" = 2,
}

export const globalDefaultContext: GlobalContextType = {
    clientID: "",
    controllingClientID: "",
    selectedPodElement: { type: PodElement.NONE, id: -1 },
    shownDetails: PodElement.NONE,
    hubAccordionStates: defaultHubAccordionStates,
    botAccordionStates: defaultBotAccordionStates,
    isRCMode: false,
};

export const GlobalContext = createContext(null);
export const GlobalDispatchContext = createContext(null);

/**
 * Updates GlobalContext
 *
 * @param {GlobalContextType} state Holds the most recent reference to state
 * @param {GlobalAction} action Contains data associated with a state update
 * @returns {GlobalContextType} A copy of the updated state
 */
function globalReducer(state: GlobalContextType, action: GlobalAction) {
    let mutableState = { ...state };
    switch (action.type) {
        case GlobalActions.SAVED_CLIENT_ID:
            return handleSavedClientID(mutableState, action.clientID);

        case GlobalActions.TAKE_CONTROL_SUCCESS:
            return handleTakeControlSuccess(mutableState);

        case GlobalActions.EXITED_RC_MODE:
            return handleExitedRCMode(mutableState);

        case GlobalActions.CLOSED_HUB_DETAILS:
            return handleClosedDetails(mutableState);

        case GlobalActions.CLOSED_BOT_DETAILS:
            return handleClosedDetails(mutableState);

        case GlobalActions.CLICKED_HUB_OR_BOT:
            return handleClickedHobOrBot(mutableState, action.elementType, action.elementID);

        case GlobalActions.CLICKED_HUB_ACCORDION:
            return handleClickedHubAccordion(mutableState, action.hubAccordionName);

        case GlobalActions.CLICKED_BOT_ACCORDION:
            return handleClickedBotAccordion(mutableState, action.botAccordionName);

        default:
            return state;
    }
}

/**
 * Adds the client ID to state
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @param {string} clientID ID associated with the client session
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleSavedClientID(mutableState: GlobalContextType, clientID: string) {
    if (!clientID) throw new Error("Invalid clientID");

    mutableState.clientID = clientID;
    return mutableState;
}

/**
 * Sets the client ID saved in state to be the controlling client ID
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleTakeControlSuccess(mutableState: GlobalContextType) {
    mutableState.controllingClientID = mutableState.clientID;
    return mutableState;
}

/**
 * Turns off RC Mode on the client-side
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleExitedRCMode(mutableState: GlobalContextType) {
    mutableState.isRCMode = false;
    return mutableState;
}

/**
 * Closes the HubDetails or BotDetails panel
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleClosedDetails(mutableState: GlobalContextType) {
    mutableState.shownDetails = PodElement.NONE;
    return mutableState;
}

/**
 * Handles click events for the hub icon located on map
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @param {PodElement} type What type of elemetnt was clicked (HUB or BOT)
 * @param {number} id ID of Bot or Hub clicked
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleClickedHobOrBot(mutableState: GlobalContextType, type: PodElement, id: number) {
    if (isNaN(id)) throw new Error("Invalid hub or bot id");

    // Clicked currently selected element
    if (mutableState.selectedPodElement.type == type && mutableState.selectedPodElement.id == id) {
        // close Detailsthem and deselect
        mutableState.shownDetails = PodElement.NONE;
        mutableState.selectedPodElement.type = PodElement.NONE;
    } else {
        // Clicked non-selected element, select and show details
        mutableState.selectedPodElement = { type: type, id: id };
        mutableState.shownDetails = type;
    }
    return mutableState;
}

/**
 * Opens and closes the HubDetails accordion tabs
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @param {string} accordionName Which accordion to open or close
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleClickedHubAccordion(mutableState: GlobalContextType, accordionName: string) {
    if (!accordionName) throw new Error("Invalid accordionName");

    let hubAccordionStates = mutableState.hubAccordionStates;
    switch (accordionName) {
        case HubAccordionNames.QUICKLOOK:
            hubAccordionStates.quickLook = !hubAccordionStates.quickLook;
            break;
        case HubAccordionNames.COMMANDS:
            hubAccordionStates.commands = !hubAccordionStates.commands;
            break;
        case HubAccordionNames.LINKS:
            hubAccordionStates.links = !hubAccordionStates.links;
            break;
    }
    return mutableState;
}

/**
 * Opens and closes the BotDetails accordion tabs
 *
 * @param {GlobalContextType} mutableState State object ref for making modifications
 * @param {string} accordionName Which accordion to open or close
 * @returns {GlobalContextType} Updated mutable state object
 */
function handleClickedBotAccordion(mutableState: GlobalContextType, accordionName: string) {
    if (!accordionName) throw new Error("Invalid accordionName");

    let botAccordionStates = mutableState.botAccordionStates;
    switch (accordionName) {
        case BotAccordionNames.QUICKLOOK:
            botAccordionStates.quickLook = !botAccordionStates.quickLook;
            break;
        case BotAccordionNames.COMMANDS:
            botAccordionStates.commands = !botAccordionStates.commands;
            break;
        case BotAccordionNames.ADVANCEDCOMMANDS:
            botAccordionStates.advancedCommands = !botAccordionStates.advancedCommands;
            break;
        case BotAccordionNames.HEALTH:
            botAccordionStates.health = !botAccordionStates.health;
            break;
        case BotAccordionNames.DATA:
            botAccordionStates.data = !botAccordionStates.data;
            break;
        case BotAccordionNames.GPS:
            botAccordionStates.gps = !botAccordionStates.gps;
            break;
        case BotAccordionNames.IMU:
            botAccordionStates.imu = !botAccordionStates.imu;
            break;
        case BotAccordionNames.SENSOR:
            botAccordionStates.sensor = !botAccordionStates.sensor;
    }
    return mutableState;
}

export function GlobalContextProvider({ children }: GlobalContextProviderProps) {
    const [state, dispatch] = useReducer(globalReducer, globalDefaultContext);

    /**
     * Fetches the clientID from the server when the context mounts
     *
     * @returns {void}
     */
    useEffect(() => {
        dispatch({
            type: GlobalActions.SAVED_CLIENT_ID,
            clientID: jaiaAPI.getClientId(),
        });
    }, []);

    return (
        <GlobalContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>
                {children}
            </GlobalDispatchContext.Provider>
        </GlobalContext.Provider>
    );
}
