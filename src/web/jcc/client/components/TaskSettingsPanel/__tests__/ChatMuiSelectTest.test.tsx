import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectComponent from "../ChatMuiSelectTest";

describe("SelectComponent", () => {
    it("renders the select component with options", () => {
        render(<SelectComponent value="" onChange={jest.fn()} />);
        expect(screen.getByLabelText(/options/i)).toBeInTheDocument();
    });

    it("selects an option", async () => {
        const handleChange = jest.fn();
        render(<SelectComponent value="" onChange={handleChange} />);

        // Open the dropdown
        const selectElement = screen.getByLabelText(/options/i);
        await userEvent.click(selectElement);

        // Click the desired option
        const option = await screen.findByRole("option", { name: "Option 2" });
        await userEvent.click(option);

        // Verify that the handler was called with the correct value
        expect(handleChange).toHaveBeenCalledWith("option2");
    });
});
