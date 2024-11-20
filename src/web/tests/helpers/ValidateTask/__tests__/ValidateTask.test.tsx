import { validateTask } from "../ValidateTask";
import { MissionTask, TaskType } from "../../../../shared/JAIAProtobuf";

type testParams = {
    description: string;
    task: MissionTask;
};

const validTaskTestCases: testParams[] = [
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
];
describe("ValidateTask Unit Tests", () => {
    test.each(validTaskTestCases)("$description", ({ task }) => {
        validateTask(task);
    });
});
