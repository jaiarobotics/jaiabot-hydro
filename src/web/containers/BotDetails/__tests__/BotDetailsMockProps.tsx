import { BotDetailsProps } from "../BotDetails";
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

let mockDownloadQueue: number[] = [];

let mockTakeControl = jest.fn();
let mockDeleteSingleMission = jest.fn();
let mockIsRCModeActive = jest.fn();
let mockSetRcMode = jest.fn();
let mockDownloadIndividualBot = jest.fn();

export let mockProps: BotDetailsProps = {
    mission: mission,
    run: run,
    downloadQueue: mockDownloadQueue,
    takeControl: mockTakeControl,
    deleteSingleMission: mockDeleteSingleMission,
    isRCModeActive: mockIsRCModeActive,
    setRcMode: mockSetRcMode,
    downloadIndividualBot: mockDownloadIndividualBot,
};
