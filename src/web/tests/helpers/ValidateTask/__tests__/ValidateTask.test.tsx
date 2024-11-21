import { validateTask } from "../ValidateTask";
import { MissionTask, TaskType } from "../../../../shared/JAIAProtobuf";
import testCases from "./testCases.json";

type TestParams = {
    description: string;
    task: MissionTask;
};

type TestCases = {
    validTaskTestCases: TestParams[];
    invalidTaskTestCases: TestParams[];
};

const validTaskTestCases = (testCases as TestCases).validTaskTestCases;
const invalidTaskTestCases = (testCases as TestCases).invalidTaskTestCases;

describe("ValidateTask Unit Tests", () => {
    test.each(validTaskTestCases)("$description", ({ task }) => {
        validateTask(task);
    });
    test.each(invalidTaskTestCases)("$description", ({ task }) => {
        expect(() => validateTask(task)).toThrow();
    });
});
