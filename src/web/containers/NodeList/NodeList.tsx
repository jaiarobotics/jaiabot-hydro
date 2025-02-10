import React, { useContext } from "react";
import {
    GlobalContext,
    GlobalDispatchContext,
    GlobalAction,
    GlobalContextType,
} from "../../context/Global/GlobalContext";
import { JaiaSystemContext } from "../../context/JaiaSystem/JaiaSystemContext";
import { GlobalActions } from "../../context/Global/GlobalActions";
import { jaiaGlobal } from "../../data/jaia_global/jaia-global";
import { NodeTypes } from "../../types/jaia-system-types";
import { HealthState } from "../../shared/JAIAProtobuf";
import sortBy from "lodash/sortBy";
import "./NodeList.less";

export function NodeList() {
    // NodeList
    const jaiaSystemContext = useContext(JaiaSystemContext);
    const globalContext: GlobalContextType = useContext(GlobalContext);
    const globalDispatch: React.Dispatch<GlobalAction> = useContext(GlobalDispatchContext);

    if (jaiaSystemContext === null || globalContext === null) {
        return <div></div>;
    }

    const hubs = sortBy(Array.from(jaiaSystemContext.hubs.values() ?? []), ["hubID"]);
    const bots = sortBy(Array.from(jaiaSystemContext.bots.values() ?? []), ["botID"]);

    /**
     * Triggered when a node is clicked.  Sets the selected node
     * in jaiaGlobal and then Dispatches GlobalAction
     * to handle the clicked node event
     *
     * @param {NodeTypes} nodeType Indicates if hub or bot
     * @param {number} nodeID Hub or Bot ID
     *
     * @returns {void}
     *
     */
    const handleClick = (nodeType: NodeTypes, nodeID: number) => {
        jaiaGlobal.setSelectedNode({ type: nodeType, id: nodeID });

        globalDispatch({
            type: GlobalActions.CLICKED_NODE,
        });
    };

    /**
     * Creates the className string for the node
     *
     * @param {NodeTypes} nodeType indicates it it is a Bot or Hub
     * @param {number} nodeID ID of hub or bot
     * @param {HealthState} healthState Health of hub or bot
     * @returns {string} className
     */
    function getClassName(nodeType: NodeTypes, nodeID: number, healthState: HealthState) {
        const faultLevel: Map<HealthState, number> = new Map([
            [HealthState.HEALTH__OK, 0],
            [HealthState.HEALTH__DEGRADED, 1],
            [HealthState.HEALTH__FAILED, 2],
        ]);
        const selectedNode = globalContext.selectedNode;
        const nodeClass = "node-item";
        const botHubClass = nodeType === NodeTypes.BOT ? "bot-item" : "hub-item";
        let selected = "";
        if (selectedNode.type == nodeType && selectedNode.id === nodeID) {
            selected = "selected";
        }
        const faultLevelClass = "faultLevel" + faultLevel.get(healthState);
        return `${nodeClass} ${botHubClass} ${faultLevelClass} ${selected}`;
    }

    return (
        <div id="nodesList" data-testid="nodesList">
            {hubs.map((hub) => (
                <div
                    key={`hub-${hub.getHubID()}`}
                    onClick={() => handleClick(NodeTypes.HUB, hub.getHubID())}
                    className={getClassName(NodeTypes.HUB, hub.getHubID(), hub.getHealthState())}
                >
                    {"HUB"}
                </div>
            ))}
            {bots.map((bot) => (
                <div
                    key={`bot-${bot.getBotID()}`}
                    onClick={() => handleClick(NodeTypes.BOT, bot.getBotID())}
                    className={getClassName(NodeTypes.BOT, bot.getBotID(), bot.getHealthState())}
                >
                    {bot.getBotID()}
                </div>
            ))}
        </div>
    );
}
