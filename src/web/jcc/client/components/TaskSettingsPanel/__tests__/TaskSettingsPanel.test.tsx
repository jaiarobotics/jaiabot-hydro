import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSettingsPanel, Props } from "../TaskSettingsPanel";

import { MissionTask, TaskType, DiveParameters, DriftParameters } from "../../shared/JAIAProtobuf";
import { GlobalSettings, Save } from "../../Settings";

import { log } from "console";

const mockMinimumProps: Props = {
    enableEcho: false,
};

const sendEventToParentWindowMock = jest.fn(() => {
    log("** sendEventToParentWindowMock called **");
});

//Mock of the onChange Prop to verify tasks are formatted correctly
const mockOnChangeCheckParameters = (task?: MissionTask) => {
    log("mockOnChangeCheckParameters checking task");
    log(task);
    switch (task.type) {
        case TaskType.CONSTANT_HEADING:
            //TODO
            break;
        case TaskType.DIVE:
            if (task.dive.bottom_dive) {
                //Bottom Dive = true, expect no other parameters
                expect(task.dive.max_depth).toBeDefined(); //this should fail, fix once verify function gets called
                expect(task.dive.depth_interval).toBeUndefined();
                expect(task.dive.hold_time).toBeUndefined();
            } else {
                expect(task.dive.max_depth).toBeDefined;
                expect(task.dive.depth_interval).toBeDefined;
                expect(task.dive.hold_time).toBeDefined;
            }
            expect(task.surface_drift).toBeDefined;
            break;
        case TaskType.SURFACE_DRIFT:
            //TODO
            break;
        case TaskType.STATION_KEEP:
            //TODO
            break;
    }
    sendEventToParentWindowMock();
};
const mockDriftParameters: DriftParameters = {
    //Mock Drift Parameters
    drift_time: 0,
};

//Non-Bottom Dive Prop Setup
const nonBottomDiveParameters: DiveParameters = {
    //Mock Non-Bottom Dive Parameters
    max_depth: 30,
    depth_interval: 10,
    hold_time: 2,
    bottom_dive: false,
};
const mockNonBottomDiveTask: MissionTask = {
    //Mock Non-Bottom Dive Task
    type: TaskType.DIVE,
    dive: nonBottomDiveParameters,
    surface_drift: mockDriftParameters,
};
const mockNonBottomDiveProps: Props = {
    //Mock Non-Bottom Dive Props
    task: mockNonBottomDiveTask,
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChangeCheckParameters(task),
};

//Bottom Dive Prop Setup
const bottomDiveParameters: DiveParameters = {
    //Mock Bottom Dive Parameters
    bottom_dive: true,
};
const mockBottomDiveTask: MissionTask = {
    //Mock Bottom Dive Task
    type: TaskType.DIVE,
    dive: bottomDiveParameters,
    surface_drift: mockDriftParameters,
};
const mockBottomDiveProps: Props = {
    //Mock Bottom Dive Props
    task: mockBottomDiveTask,
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChangeCheckParameters(task),
};

//Bad Bottom Dive Prop Setup
const badBottomDiveParameters: DiveParameters = {
    //Mock ill-formed Bottom Dive Parameters
    max_depth: 30, //these 3 parameters should not be presetn for Bottom Dives
    depth_interval: 10,
    hold_time: 2,
    bottom_dive: true,
};
const mockBadBottomDiveTask: MissionTask = {
    //Mock Bottom Dive Task
    type: TaskType.DIVE,
    dive: badBottomDiveParameters,
    surface_drift: mockDriftParameters,
};
const mockBADBottomDiveProps: Props = {
    //Mock Bottom Dive Props
    task: mockBadBottomDiveTask,
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChangeCheckParameters(task),
};

describe("SelectComponent", () => {
    test("selects an option", async () => {
        const handleChange = jest.fn();
        render(<TaskSettingsPanel {...mockNonBottomDiveProps} />);

        // Open the dropdown
        const selectElement = screen.getByLabelText(/TaskOptions/i);
        await userEvent.click(selectElement);

        // Click the desired option
        const option = await screen.findByRole("option", { name: "Dive" });
        await userEvent.click(option);

        // Check if the Select component displays the new value
        expect(screen.getByDisplayValue(/dive/i)).toBeInTheDocument();
    });
});
