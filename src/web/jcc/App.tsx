// React
import React from "react";

// Jaia
import { GlobalContextProvider } from "../context/Global/GlobalContext";
import { HubContextProvider } from "../context/Hub/HubContext";
import { BotContextProvider } from "../context/Bot/BotContext";
import { MissionContextProvider } from "../context/Mission/MissionContext";
import { CommandControlWrapper } from "../containers/CommandControl/CommandControl";

// Style
import "./App.less";

export default function App() {
    return (
        <div id="jcc">
            <GlobalContextProvider>
                <HubContextProvider>
                    <BotContextProvider>
                        <MissionContextProvider>
                            <CommandControlWrapper />
                        </MissionContextProvider>
                    </BotContextProvider>
                </HubContextProvider>
            </GlobalContextProvider>
        </div>
    );
}
