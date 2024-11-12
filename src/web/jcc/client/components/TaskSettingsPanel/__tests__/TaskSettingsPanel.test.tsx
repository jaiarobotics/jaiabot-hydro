import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSettingsPanel, Props } from "../TaskSettingsPanel";

import { MissionTask, TaskType } from "../../shared/JAIAProtobuf";

let mockProps: Props = {
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChange(task),
};

//Mock of the onChange to update Props
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});

function validateTask(task?: MissionTask): void {
    if (!task) {
        return;
    }
    switch (task?.type) {
        case TaskType.CONSTANT_HEADING:
            //TODO
            break;
        case TaskType.DIVE:
            if (task.dive.bottom_dive) {
                //Bottom Dive = true, expect no other parameters
                expect(task.dive.max_depth).toBeUndefined();
                expect(task.dive.depth_interval).toBeUndefined();
                expect(task.dive.hold_time).toBeUndefined();
            } else {
                //Non Bottom Dive should have other parameters
                expect(task.dive.max_depth).toBeDefined();
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
    test("Get by Test ID, Select all Options", async () => {
        const { rerender } = render(<TaskSettingsPanel {...mockProps} />);

        // Get the Select Component
        const selectElement = screen.getByTestId("task-select-input-id");
        expect(selectElement).toBeInTheDocument();

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("NONE");

        for (const value of Object.values(TaskType)) {
            // Change the selection to Dive
            await userEvent.selectOptions(selectElement, value);

            // rerender with updated props
            rerender(<TaskSettingsPanel {...mockProps} />);

            // Verify that the selected value is Dive
            expect((selectElement as HTMLSelectElement).value).toBe(value);
            validateTask(mockProps.task);
        }
    });
});
