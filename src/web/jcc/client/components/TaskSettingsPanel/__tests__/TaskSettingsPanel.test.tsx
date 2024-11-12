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

        //get the rerender function from the object returned when rendering the panel
        const { rerender } = render(<TaskSettingsPanel {...mockProps} />);

        // Get the Select Component
        const selectElement = screen.getByTestId("task-select-input-id");
        expect(selectElement).toBeInTheDocument();

        // Verify that the selected value is Dive
        expect((selectElement as HTMLSelectElement).value).toBe("NONE");

        //Verify the mockOnChange function hasn't been called yet
        expect(mockOnChange).toHaveBeenCalledTimes(0);

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

            //Verify the mockOnChange function hasn't been called the right number of times
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
