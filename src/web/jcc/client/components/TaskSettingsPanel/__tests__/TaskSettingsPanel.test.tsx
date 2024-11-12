import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TaskSettingsPanel, Props } from "../TaskSettingsPanel";
import { MissionTask, TaskType } from "../../shared/JAIAProtobuf";
import { validateTask } from "../../../../../tests/helpers/ValidateTask";

let mockProps: Props = {
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChange(task),
};

//Mock of the onChange to update Props
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});

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
            await waitFor(() => {
                expect((selectElement as HTMLSelectElement).value).toBe(value);
            });
            // Validate the TaskSettingsPanel produce a valid Task
            validateTask(mockProps.task);
        }
    });
});
