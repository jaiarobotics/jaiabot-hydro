import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BotDetailsComponent, BotDetailsProps } from "../BotDetails";

import { mockProps } from "./BotDetailsMockProps.";

describe("BotDetailsComponent", () => {
    test("BotDetails Render", async () => {
        const { rerender } = render(<BotDetailsComponent {...mockProps} />);
    });
});
