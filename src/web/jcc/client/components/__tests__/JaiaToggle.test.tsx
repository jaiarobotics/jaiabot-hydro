import { render, screen, fireEvent, prettyDOM, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event"
import { log } from "console";

import JaiaToggle from "../JaiaToggle";
import { Metadata, Version } from "../shared/PortalStatus";

const sampleVersion1: Version = {
    major: "1",
    minor: "10",
    patch: "0",
};

const sampleMetadata1: Metadata = {
    jaiabot_version: sampleVersion1,
};


function logElement(element: Element) {
    log(prettyDOM(element))
}


describe("JaiaToggle", () => {
    test("JaiaToggle toggles", async () => {
        var isChecked = false
        
        const props = {
            checked: () => isChecked,
            onClick: () => { isChecked = !isChecked },
            disabled: () => false,
            label: "Test Label",
            title: "Test Title"
        }

        render(<JaiaToggle {...props} />);
        const toggle: HTMLInputElement = screen.getByRole("checkbox")

        await userEvent.click(toggle)
        expect(isChecked).toBe(true)
        await userEvent.click(toggle)
        expect(isChecked).toBe(false)
    });

    test("JaiaToggle disables", async () => {
        var isChecked = false
        
        const props = {
            checked: () => false,
            onClick: () => {},
            disabled: () => true,
            label: "Test Label",
            title: "Test Title"
        }

        render(<JaiaToggle {...props} />);
        const toggle: HTMLInputElement = screen.getByRole("checkbox")

        expect(toggle.disabled).toBe(true)
    });
});
