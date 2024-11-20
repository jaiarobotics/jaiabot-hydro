import { validateTask } from "../ValidateTask";
import { MissionTask, TaskType } from "../../../../shared/JAIAProtobuf";

type testParams = {
    description: string;
    task: MissionTask;
};

// Test Cases of Valid Mission Tasks
const validTaskTestCases: testParams[] = [
    {
        description: "Valid Constant Heading",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
                constant_heading_time: 0,
            },
        },
    },
    {
        description: "Valid Non-Bottom Dive",
        task: {
            type: TaskType.DIVE,
            dive: {
                max_depth: 10,
                depth_interval: 2,
                hold_time: 0,
                bottom_dive: false,
            },
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Valid Bottom Dive",
        task: {
            type: TaskType.DIVE,
            dive: {
                bottom_dive: true,
            },
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Valid Surface Drift",
        task: {
            type: TaskType.SURFACE_DRIFT,
            surface_drift: {
                drift_time: 10,
            },
        },
    },
    {
        description: "Valid Station Keeping",
        task: {
            type: TaskType.STATION_KEEP,
            station_keep: {
                station_keep_time: 10,
            },
        },
    },
    {
        description: "Valid None Task Type",
        task: {
            type: TaskType.NONE,
        },
    },
];

// Test Cases of Invalid Mission Tasks
const invalidTaskTestCases: testParams[] = [
    // No Type
    {
        description: "Invalid Task, No Type",
        task: {},
    },
    // Invalid Constant Heading Tasks
    {
        description: "Invalid Constant Heading, No Params",
        task: {
            type: TaskType.CONSTANT_HEADING,
        },
    },
    {
        description: "Invalid Constant Heading, No Heading",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading_speed: 2,
                constant_heading_time: 0,
            },
        },
    },
    {
        description: "Invalid Constant Heading, No Speed",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_time: 0,
            },
        },
    },
    {
        description: "Invalid Constant Heading, No Time",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
        },
    },
    {
        description: "Invalid Constant Heading, with Dive",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
            dive: {
                bottom_dive: true,
            },
        },
    },
    {
        description: "Invalid Constant Heading, With Station Keep",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
            station_keep: {
                station_keep_time: 10,
            },
        },
    },
    {
        description: "Invalid Constant Heading, With Drift ",
        task: {
            type: TaskType.CONSTANT_HEADING,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
            surface_drift: {
                drift_time: 10,
            },
        },
    },
    // Invalid Dive Tasks
    {
        description: "Invalid Dive, No Dive Params",
        task: {
            type: TaskType.DIVE,
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Invalid Bottom Dive, Extra Dive Params",
        task: {
            type: TaskType.DIVE,
            dive: {
                max_depth: 10,
                depth_interval: 2,
                hold_time: 0,
                bottom_dive: true,
            },
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Invalid Non-Bottom Dive, Missing Dive Params",
        task: {
            type: TaskType.DIVE,
            dive: {
                bottom_dive: false,
            },
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Invalid Dive, Missing Drift Params",
        task: {
            type: TaskType.DIVE,
            dive: {
                bottom_dive: true,
            },
        },
    },
    {
        description: "Invalid Dive, With Station Keep Params",
        task: {
            type: TaskType.DIVE,
            dive: {
                bottom_dive: true,
            },
            surface_drift: {
                drift_time: 1,
            },
            station_keep: {
                station_keep_time: 10,
            },
        },
    },
    {
        description: "Invalid Dive, With Constant Heading Params",
        task: {
            type: TaskType.DIVE,
            dive: {
                bottom_dive: true,
            },
            surface_drift: {
                drift_time: 1,
            },
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
        },
    },
    // Invalid Surface Drift Tasks
    {
        description: "Invalid Surface Drift, No Params",
        task: {
            type: TaskType.SURFACE_DRIFT,
        },
    },
    {
        description: "Invalid Surface Drift, Missing Time Params",
        task: {
            type: TaskType.SURFACE_DRIFT,
            surface_drift: {},
        },
    },
    {
        description: "Invalid Surface Drift, With Dive Params",
        task: {
            type: TaskType.SURFACE_DRIFT,
            surface_drift: {
                drift_time: 1,
            },
            dive: {
                bottom_dive: true,
            },
        },
    },
    {
        description: "Invalid Surface Drift, With Sation Keep Params",
        task: {
            type: TaskType.SURFACE_DRIFT,
            surface_drift: {
                drift_time: 1,
            },
            station_keep: {
                station_keep_time: 10,
            },
        },
    },
    {
        description: "Invalid Surface Drift, With Constant Heading Params",
        task: {
            type: TaskType.SURFACE_DRIFT,
            surface_drift: {
                drift_time: 1,
            },
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
        },
    },
    // Invalid Station Keeping Tasks
    {
        description: "Invalid Station Keeping, No Params",
        task: {
            type: TaskType.STATION_KEEP,
        },
    },
    {
        description: "Invalid Station Keeping, Missing Time",
        task: {
            type: TaskType.STATION_KEEP,
            station_keep: {},
        },
    },
    {
        description: "Invalid Station Keeping, With Dive Params",
        task: {
            type: TaskType.STATION_KEEP,
            station_keep: {
                station_keep_time: 10,
            },
            dive: {
                bottom_dive: true,
            },
        },
    },
    {
        description: "Invalid Station Keeping, With Drift Params",
        task: {
            type: TaskType.STATION_KEEP,
            station_keep: {
                station_keep_time: 10,
            },
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Invalid Station Keeping, With Constant Heading Params",
        task: {
            type: TaskType.STATION_KEEP,
            station_keep: {
                station_keep_time: 10,
            },
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
        },
    },
    // Invalid Tasks With Type None
    {
        description: "Invalid None Task Type, With Constant Heading Params",
        task: {
            type: TaskType.NONE,
            constant_heading: {
                constant_heading: 10,
                constant_heading_speed: 2,
            },
        },
    },
    {
        description: "Invalid None Task Type, With Dive Params",
        task: {
            type: TaskType.NONE,
            dive: {
                bottom_dive: true,
            },
        },
    },
    {
        description: "Invalid None Task Type, With Drift Params",
        task: {
            type: TaskType.NONE,
            surface_drift: {
                drift_time: 1,
            },
        },
    },
    {
        description: "Invalid None Task Type, With Station Keeping Params",
        task: {
            type: TaskType.NONE,
            station_keep: {
                station_keep_time: 10,
            },
        },
    },
];
describe("ValidateTask Unit Tests", () => {
    test.each(validTaskTestCases)("$description", ({ task }) => {
        validateTask(task);
    });
    test.each(invalidTaskTestCases)("$description", ({ task }) => {
        expect(() => validateTask(task)).toThrow();
    });
});
