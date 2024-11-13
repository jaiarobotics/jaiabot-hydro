import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OlFeature from "ol/Feature";
import { Point } from "ol/geom";
import { RallyPointPanel, Props } from "../RallyPointPanel";

const mockGoToRallyPoint = jest.fn();
const mockDeleteRallyPoint = jest.fn();
const mockSetVisiblePanel = jest.fn();
const mockSelectedRallyFeature = new OlFeature<Point>({
    geometry: new Point([123.45, 678.9]),
});

const mockProps: Props = {
    selectedRallyFeature: mockSelectedRallyFeature,
    goToRallyPoint: mockGoToRallyPoint,
    deleteRallyPoint: mockDeleteRallyPoint,
    setVisiblePanel: mockSetVisiblePanel,
};

describe("MUI Button Examples", () => {
    test("Test Go To Rally Point Button using test-id", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByTestId("go-to-rally-point-id");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockGoToRallyPoint).toHaveBeenCalled();
    });
    test("Test Go To Rally Point Button using label", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByLabelText("Go To Rally Point Label");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockGoToRallyPoint).toHaveBeenCalled();
    });
    test("Test Go To Rally Point Button using title", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByTitle("Go To Rally Point Button");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockGoToRallyPoint).toHaveBeenCalled();
    });
    test("Test Delete Rally Point Button using test-id", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByTestId("delete-rally-point-id");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockDeleteRallyPoint).toHaveBeenCalled();
    });
    test("Test Delete Rally Point Button using label", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByLabelText("Delete Rally Point Label");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockDeleteRallyPoint).toHaveBeenCalled();
    });
    test("Test Delete Rally Point Button using title", async () => {
        // Render the Rally Point Panel
        render(<RallyPointPanel {...mockProps} />);
        // Get the button using Test ID
        const buttonElement = screen.getByTitle("Delete Rally Point Button");
        // Click the button and check the callback was called
        await userEvent.click(buttonElement);
        expect(mockDeleteRallyPoint).toHaveBeenCalled();
    });
});
