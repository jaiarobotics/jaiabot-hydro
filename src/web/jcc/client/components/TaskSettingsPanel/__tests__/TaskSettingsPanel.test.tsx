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

//Mock of the onChange callback to update Props
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});

describe("MUI Select Component Examples", () => {
    test("Get by Test ID, Select all Options", async () => {
        let onChangeCalls = 0;

        // Get the rerender function from the object returned when rendering the panel
        const { rerender } = render(<TaskSettingsPanel {...mockProps} />);

        // Get the Select Component
        const selectElement: HTMLSelectElement = screen.getByTestId("task-select-input-id");
        expect(selectElement).toBeInTheDocument();

        // Verify that the selected value is None
        expect(selectElement.value).toBe("NONE");

        // Verify the mockOnChange function hasn't been called yet
        expect(mockOnChange).toHaveBeenCalledTimes(0);

        // Change the Task Type to all options and verify the change occured
        for (const value of Object.values(TaskType)) {
            // Change the selection
            await userEvent.selectOptions(selectElement, value);

            // Rerender with updated props
            rerender(<TaskSettingsPanel {...mockProps} />);

            // Verify that the selected value is correct
            await waitFor(() => {
                expect(selectElement.value).toBe(value);
            });
            // Validate the TaskSettingsPanel sent a valid Task to mockOnChange
            validateTask(mockProps.task);

            //Verify the mockOnChange function has been called the right number of times
            expect(mockOnChange).toHaveBeenCalledTimes(onChangeCalls++);

            // Verify that mockOnChange was called with the correct task type
            if (value != TaskType.NONE) {
                expect(mockOnChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: value,
                    }),
                );
            }
        }
    });
});
