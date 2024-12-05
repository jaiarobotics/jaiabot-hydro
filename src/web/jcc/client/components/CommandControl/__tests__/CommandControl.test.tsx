import { act, render, screen, fireEvent } from "@testing-library/react";
import CommandControl, { Props } from "../CommandControl";
import {
    GlobalContextType,
    SelectedPodElement,
    PodElement,
    HubAccordionStates,
} from "../../../../../context/GlobalContext";
import { JaiaAPI } from "../../../../common/JaiaAPI";
import { CustomLayerGroupFactory } from "../../CustomLayers";

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

// Mock JaiaAPI, replace the `hit` method on the `jaiaAPI` instance
jest.mock("../../../../common/JaiaAPI", () => {
    // Import the real module to access the original `jaiaAPI` instance
    const originalModule = jest.requireActual("../../../../common/JaiaAPI");

    // Mock the `hit` method on the existing `jaiaAPI` instance
    // Provide a mocked response for the `hit` method
    originalModule.jaiaAPI.hit = jest
        .fn()
        .mockResolvedValue({ code: 200, msg: "Mocked Success", bots: [], hubs: [] });

    // Return the original module but with the mocked `hit` method on `jaiaAPI`
    return {
        ...originalModule, // Spread the real module
        jaiaAPI: originalModule.jaiaAPI, // Keep the original `jaiaAPI` instance with the mocked `hit`
    };
});

// Mock the CustomLayers, replace  createCustomLayerGroup
jest.mock("../../CustomLayers", () => {
    // Create a mock class for `CustomLayerGroupFactory`
    const MockCustomLayerGroupFactory = jest.fn().mockImplementation(() => ({
        // Mock all methods or properties used by the module under test
        createCustomLayerGroup: jest.fn().mockResolvedValue(undefined), // Example method
        on: jest.fn(), // Mock event subscription
        off: jest.fn(), // Mock event unsubscription
    }));

    return {
        CustomLayerGroupFactory: MockCustomLayerGroupFactory,
    };
});

describe("JaiaAbout integration tests", () => {
    test("JaiaAbout panel opens when Jaia info button is clicked", async () => {
        await act(async () => {
            render(<CommandControl {...mockProps1} />);
        });
        const jaiaInfoButton = screen.getByRole("img", { name: "Jaia info button" });
        fireEvent.click(jaiaInfoButton);
        const panelElement = screen.getByTestId("jaia-about-panel");
        expect(panelElement).toBeVisible();
    });
});
