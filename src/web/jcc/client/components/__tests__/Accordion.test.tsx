import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";

// Mock the onChange function, so we can track calls to it
const mockOnChange = jest.fn();

interface Props {
    onChange: () => void;
}

const mockProps: Props = { onChange: mockOnChange };

function AccordionTestComponent(props: Props) {
    return (
        <Accordion expanded={false} onChange={props.onChange}>
            <AccordionSummary>
                <Typography>Accordion Title Here</Typography>
            </AccordionSummary>
            <AccordionDetails>Accordion Details Here</AccordionDetails>
        </Accordion>
    );
}

describe("Accordion Tests", () => {
    test("Accordion Test", async () => {
        // Render the component
        render(<AccordionTestComponent {...mockProps} />);

        // Get the accordion elements
        const summary = screen.getByText("Accordion Title Here");
        const details = screen.getByText("Accordion Details Here");

        // Accordion starts closed, so details invisible
        expect(details).not.toBeVisible();

        // Click the summary
        await userEvent.click(summary);

        // Wait for onChange logic to be triggered, which opens the details
        waitFor(() => {
            expect(details).toBeVisible();
        });

        // Click summary again
        await userEvent.click(summary);

        // Wait for onChange logic to be triggere again, which closes the details
        waitFor(() => {
            expect(details).not.toBeVisible();
        });

        // The onChange function should have been called twice during this test
        expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
});
