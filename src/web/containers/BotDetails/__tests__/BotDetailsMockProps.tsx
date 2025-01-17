import { BotDetailsProps } from "../BotDetails";
import { DetailsExpandedState } from "../BotDetails";
import { MissionInterface, RunInterface } from "../../CommandControl/CommandControl";
import { PortalBotStatus, PortalHubStatus } from "../../../shared/PortalStatus";
import {
    HealthState,
    BotType,
    MissionState,
    CommandType,
    MissionStart,
    MovementType,
} from "../../../utils/protobuf-types";

let bot: PortalBotStatus = {
    bot_id: 1,
    time: 1736965552000000,
    health_state: HealthState.HEALTH__OK,
    bot_type: BotType.HYDRO,
    location: {
        lat: 41.661417,
        lon: -71.273042,
    },
    depth: 0,
    attitude: {
        roll: -57,
        pitch: 0,
        heading: 343,
        course_over_ground: 353,
    },
    speed: {
        over_ground: 0.5,
    },
    mission_state: MissionState.IN_MISSION__UNDERWAY__RECOVERY__STATION_KEEP,
    distance_to_active_goal: 7.8,
    active_goal_timeout: 0,
    salinity: 20.1,
    temperature: 15.03,
    battery_percent: 95,
    calibration_status: 3,
    hdop: 0.42,
    pdop: 0.88,
    wifi_link_quality_percentage: 100,
};

let hub: PortalHubStatus = {
    hub_id: 1,
    fleet_id: 0,
    time: 1736965552366439,
    health_state: HealthState.HEALTH__OK,
    location: {
        lat: 41.66268,
        lon: -71.273018,
    },
    linux_hardware_status: {
        wifi: {
            is_connected: true,
            link_quality: 70,
            link_quality_percentage: 100,
            signal_level: 33,
            noise_level: 0,
        },
    },
    portalStatusAge: 813039,
};

let mission: MissionInterface = {
    id: "mission-1",
    name: "Mission 1",
    runs: {
        "run-1": {
            id: "run-1",
            name: "Run 1",
            assigned: 1,
            command: {
                bot_id: 1,
                time: 1736965345425,
                type: CommandType.MISSION_PLAN,
                plan: {
                    start: MissionStart.START_IMMEDIATELY,
                    movement: MovementType.TRANSIT,
                    goal: [
                        {
                            location: {
                                lon: -71.2741519355706,
                                lat: 41.662427524746676,
                            },
                        },
                        {
                            location: {
                                lon: -71.27306047382503,
                                lat: 41.66148057602993,
                            },
                        },
                    ],
                    recovery: {
                        recover_at_final_goal: true,
                    },
                    speeds: {
                        transit: 3,
                        stationkeep_outer: 1.5,
                    },
                },
            },
            showTableOfWaypoints: false,
        },
    },
    runIdIncrement: 2,
    botsAssignedToRuns: {
        1: "run-1",
    },
    runIdInEditMode: "",
};

let run: RunInterface = {
    id: "run-1",
    name: "Run 1",
    assigned: 1,
    command: {
        bot_id: 1,
        time: 1736965345425,
        type: CommandType.MISSION_PLAN,
        plan: {
            start: MissionStart.START_IMMEDIATELY,
            movement: MovementType.TRANSIT,
            goal: [
                {
                    location: {
                        lon: -71.2741519355706,
                        lat: 41.662427524746676,
                    },
                },
                {
                    location: {
                        lon: -71.27306047382503,
                        lat: 41.66148057602993,
                    },
                },
            ],
            recovery: {
                recover_at_final_goal: true,
            },
            speeds: {
                transit: 3,
                stationkeep_outer: 1.5,
            },
        },
    },
    showTableOfWaypoints: false,
};
let isExpanded: DetailsExpandedState = {
    quickLook: true,
    commands: false,
    advancedCommands: false,
    health: true,
    data: true,
    gps: false,
    imu: false,
    sensor: false,
    power: false,
    links: false,
};
let mockDownloadQueue: number[] = [];

let mockCloseWindow = jest.fn();
let mockTakeControl = jest.fn();
let mockDeleteSingleMission = jest.fn();
let mockSetDetailsExpanded = jest.fn();
let mockIsRCModeActive = jest.fn();
let mockSetRcMode = jest.fn();
let mockToggleEditMode = jest.fn();
let mockDownloadIndividualBot = jest.fn();

export let mockProps: BotDetailsProps = {
    bot: bot,
    mission: mission,
    run: run,
    isExpanded: isExpanded,
    downloadQueue: mockDownloadQueue,
    closeWindow: mockCloseWindow,
    takeControl: mockTakeControl,
    deleteSingleMission: mockDeleteSingleMission,
    setDetailsExpanded: mockSetDetailsExpanded,
    isRCModeActive: mockIsRCModeActive,
    setRcMode: mockSetRcMode,
    toggleEditMode: mockToggleEditMode,
    downloadIndividualBot: mockDownloadIndividualBot,
};
