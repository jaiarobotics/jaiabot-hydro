import React, { useContext } from "react";
import {
    GlobalContext,
    GlobalDispatchContext,
    GlobalAction,
    NodeType,
    GlobalContextType,
} from "../../context/Global/GlobalContext";
import { JaiaSystemContext } from "../../context/JaiaSystem/JaiaSystemContext";
import { GlobalActions } from "../../context/Global/GlobalActions";
import { HealthState } from "../../shared/JAIAProtobuf";
import sortBy from "lodash/sortBy";
import "./NodeList.less";

const faultLevel: Map<HealthState, number> = new Map([
    [HealthState.HEALTH__OK, 0],
    [HealthState.HEALTH__DEGRADED, 1],
    [HealthState.HEALTH__FAILED, 2],
]);

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
     * Triggered when a node is clicked.  Dispatches GlobalAction
     * to handle the event
     *
     * @param {NodeType} nodeType Indicates if hub or bot
     * @param {number} nodeID Hub or Bot ID
     *
     * @returns {void}
     *
     */
    const handleClick = (nodeType: NodeType, nodeID: number) => {
        globalDispatch({
            type: GlobalActions.CLICKED_NODE,
            nodeType: nodeType,
            nodeID: nodeID,
        });
    };

    /**
     * Creates the className string for the node
     *
     * @param {NodeType} nodeType indicates it it is a Bot or Hub
     * @param {number} nodeID ID of hub or bot
     * @param {HealthState} healthState Health of hub or bot
     * @returns {string} className
     */
    function getClassName(nodeType: NodeType, nodeID: number, healthState: HealthState) {
        const selectedNode = globalContext.selectedNode;
        const nodeClass = "node-item";
        const botHubClass = nodeType === NodeType.BOT ? "bot-item" : "hub-item";
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
                    onClick={() => handleClick(NodeType.HUB, hub.getHubID())}
                    className={getClassName(NodeType.HUB, hub.getHubID(), hub.getHealthState())}
                >
                    {"HUB"}
                </div>
            ))}
            {bots.map((bot) => (
                <div
                    key={`bot-${bot.getBotID()}`}
                    onClick={() => handleClick(NodeType.BOT, bot.getBotID())}
                    className={getClassName(NodeType.BOT, bot.getBotID(), bot.getHealthState())}
                >
                    {bot.getBotID()}
                </div>
            ))}
        </div>
    );
}
