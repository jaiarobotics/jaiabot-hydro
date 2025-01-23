// React
import React from "react";

// Jaia
import { GlobalContextProvider } from "../context/Global/GlobalContext";
import { OperationContextProvider } from "../context/Operation/OperationContext";
import { CommandControlWrapper } from "../containers/CommandControl/CommandControl";

export default function App() {
    return (
        <div>
            <GlobalContextProvider>
                <OperationContextProvider>
                    <CommandControlWrapper />
                </OperationContextProvider>
            </GlobalContextProvider>
        </div>
    );
}
