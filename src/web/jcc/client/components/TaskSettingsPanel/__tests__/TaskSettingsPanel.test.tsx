import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSettingsPanel, Props } from "../TaskSettingsPanel";

import { MissionTask, TaskType, DiveParameters, DriftParameters } from "../../shared/JAIAProtobuf";

import { log } from "console";

let mockProps: Props = {
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChange(task),
};

//Mock of the onChange Prop to verify tasks are formatted correctly
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});

function validateTask(task?: MissionTask): void {
    log("validateTask checking task");
    log(task);

    switch (task.type) {
        case TaskType.CONSTANT_HEADING:
            //TODO
            break;
        case TaskType.DIVE:
            if (task.dive.bottom_dive) {
                //Bottom Dive = true, expect no other parameters
                expect(task.dive.max_depth).toBeUndefined(); //this should fail, fix once verify function gets called
                expect(task.dive.depth_interval).toBeUndefined();
                expect(task.dive.hold_time).toBeUndefined();
            } else {
                expect(task.dive.max_depth).toBeDefined(); //this should fail, fix once verify function gets called
                expect(task.dive.depth_interval).toBeDefined();
                expect(task.dive.hold_time).toBeDefined();
            }
            expect(task.surface_drift).toBeDefined();
            break;
        case TaskType.SURFACE_DRIFT:
            //TODO
            break;
        case TaskType.STATION_KEEP:
            //TODO
            break;
    }
}

describe("MUI Select Component Examples", () => {
    test("Get by Test ID", async () => {
        const { rerender } = render(<TaskSettingsPanel {...mockProps} />);

        // Get the Select Component
        const selectElement = screen.getByTestId("task-select-input-id");
        expect(selectElement).toBeInTheDocument();

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("NONE");

        // Change the selection to Dive
        await userEvent.selectOptions(selectElement, "DIVE");

        // rerender with updated props
        rerender(<TaskSettingsPanel {...mockProps} />);

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("DIVE");
        validateTask(mockProps.task);

        // Change the selection to Dive
        await userEvent.selectOptions(selectElement, "SURFACE_DRIFT");

        // rerender with updated props
        rerender(<TaskSettingsPanel {...mockProps} />);

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("SURFACE_DRIFT");

        // rerender with updated props
        rerender(<TaskSettingsPanel {...mockProps} />);

        // Change the selection to Dive
        await userEvent.selectOptions(selectElement, "STATION_KEEP");

        // rerender with updated props
        rerender(<TaskSettingsPanel {...mockProps} />);

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("STATION_KEEP");

        // Change the selection to Dive
        await userEvent.selectOptions(selectElement, "CONSTANT_HEADING");

        // rerender with updated props
        rerender(<TaskSettingsPanel {...mockProps} />);

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("CONSTANT_HEADING");
    });
});
