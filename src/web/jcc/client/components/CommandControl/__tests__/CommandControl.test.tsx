import { act, render, screen, fireEvent } from "@testing-library/react";
import CommandControl, { Props } from "../CommandControl";
import {
    GlobalContextType,
    SelectedPodElement,
    PodElement,
    HubAccordionStates,
} from "../../../../../context/GlobalContext";
//import { jaiaAPI } from "../../../../common/JaiaAPI";
import * as JaiaAPI from "../../../../common/JaiaAPI";

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

// Mock the entire module. Automatically mocks all exported functions
jest.mock("../../../../common/JaiaAPI");
// Create a Mocked instance of jaiaAPI with debug turned on
/* This was an example of mocking the instance instead of the class

jest.mock("../../../../common/JaiaAPI", () => {
       // Create a new instance of `Api` with different parameters
       const mockApiInstance = new (jest.requireActual('../../../../common/JaiaAPI').JaiaAPI)("Mock Jaia API",'/', true);
    
       return {
           // Replace the original `apiInstance` with the custom instance
           jaiaAPI: mockApiInstance,
       }; 
});

*/

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
