import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import MissionsPanel from "../MissionsPanel";
import { GlobalContextProvider } from "../../../context/Global/GlobalContext";
import { JaiaSystemContextProvider } from "../../../context/JaiaSystem/JaiaSystemContext";

import { missions } from "../../../data/missions/missions";
import { bots } from "../../../data/bots/bots";
import { PortalBotStatus } from "../../../shared/PortalStatus";

const botStatusMock1: PortalBotStatus = {
    bot_id: 1,
    portalStatusAge: 1,
};

const botStatusMock2: PortalBotStatus = {
    bot_id: 2,
    portalStatusAge: 1,
};

bots.addBot(botStatusMock1);
bots.addBot(botStatusMock2);

test("Exercising top level buttons in Missions panel", async () => {
    render(
        <GlobalContextProvider>
            <JaiaSystemContextProvider>
                <MissionsPanel />
            </JaiaSystemContextProvider>
        </GlobalContextProvider>,
    );

    const addMissionButton = screen.getByRole("button", { name: "add-mission" });
    const deleteMissionsButton = screen.getByRole("button", { name: "delete-all-missions" });
    const autoAssignButton = screen.getByRole("button", { name: "auto-assign-bots" });
    const missionsList = screen.getByTestId("missions-list");

    // Add first mission
    await userEvent.click(addMissionButton);
    const mission1Accordion = screen.getByText("Mission-1").parentElement;
    const mission1AccordionChildren = Array.from(mission1Accordion.children);
    expect(mission1AccordionChildren[0].textContent).toBe("Mission-1");
    expect(mission1AccordionChildren[1].textContent).toBe("Unassigned");
    expect(Array.from(missionsList.children).length).toBe(1);
    expect(missions.getMission(1).getMissionID()).toBe(1);

    // Add second mission
    await userEvent.click(addMissionButton);
    const mission2Accordion = screen.getByText("Mission-2").parentElement;
    const mission2AccordionChildren = Array.from(mission2Accordion.children);
    expect(mission2AccordionChildren[0].textContent).toBe("Mission-2");
    expect(mission2AccordionChildren[1].textContent).toBe("Unassigned");
    expect(Array.from(missionsList.children).length).toBe(2);
    expect(missions.getMission(2).getMissionID()).toBe(2);

    // Auto assign Bots
    await userEvent.click(autoAssignButton);
    expect(mission1AccordionChildren[0].textContent).toBe("Mission-1");
    expect(mission1AccordionChildren[1].textContent).toBe("Bot-1");
    expect(mission2AccordionChildren[0].textContent).toBe("Mission-2");
    expect(mission2AccordionChildren[1].textContent).toBe("Bot-2");

    // Delete all missions
    await userEvent.click(deleteMissionsButton);
    expect(Array.from(missionsList.children).length).toBe(0);
    expect(missions.getMission(1)).toBeUndefined();
    expect(missions.getMission(2)).toBeUndefined();
});
