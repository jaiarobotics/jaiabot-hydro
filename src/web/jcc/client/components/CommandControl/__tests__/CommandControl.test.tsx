import { act, render, screen, fireEvent } from "@testing-library/react";
import CommandControl, { Props } from "../CommandControl";
import {
    GlobalContextType,
    SelectedPodElement,
    PodElement,
    HubAccordionStates,
} from "../../../../../context/GlobalContext";
import { jaiaAPI } from "../../../../common/JaiaAPI";
//import * as JaiaAPI from "../../../../common/JaiaAPI";

const mockSelectedPodElement1: SelectedPodElement = {
    type: PodElement.HUB,
    id: 1,
};

const mockHubAccordionStates1: HubAccordionStates = {
    quickLook: false,
    commands: false,
    links: false,
};

const mockGlobalContext1: GlobalContextType = {
    clientID: "",
    controllingClientID: "",
    selectedPodElement: mockSelectedPodElement1,
    showHubDetails: false,
    hubAccordionStates: mockHubAccordionStates1,
    isRCMode: false,
    isFullscreen: false,
};

const mockGlobalDispatch = () => {};

const mockProps1: Props = {
    globalContext: mockGlobalContext1,
    globalDispatch: mockGlobalDispatch,
};

// Mock the instance of JaiaAPT with mocked hit method
jest.mock("../../../../common/JaiaAPI", () => {
    return {
        // Replace the original `apiInstance` with the custom instance
        jaiaAPI: {
            hit: jest.fn(), // Mock the `hit` method on the instance
        },
    };
});

describe("JaiaAbout integration tests", () => {
    test("JaiaAbout panel opens when Jaia info button is clicked", async () => {
        // Arrange: Mock the `hit` method to return mock data
        (jaiaAPI.hit as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest
                .fn()
                .mockResolvedValue({ code: 200, msg: "Mocked Success", bots: [], hubs: [] }),
        });

        await act(async () => {
            render(<CommandControl {...mockProps1} />);
        });
        const jaiaInfoButton = screen.getByRole("img", { name: "Jaia info button" });
        fireEvent.click(jaiaInfoButton);
        const panelElement = screen.getByTestId("jaia-about-panel");
        expect(panelElement).toBeVisible();
    });
});
