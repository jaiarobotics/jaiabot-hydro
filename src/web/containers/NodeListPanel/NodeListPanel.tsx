import React, { useContext } from "react";
import {
    GlobalContext,
    GlobalDispatchContext,
    GlobalAction,
    NodeType,
    GlobalContextType,
    SelectedNode,
} from "../../context/Global/GlobalContext";
import { JaiaSystemContext } from "../../context/JaiaSystem/JaiaSystemContext";

import { GlobalActions } from "../../context/Global/GlobalActions";

import { HealthState } from "../../shared/JAIAProtobuf";
import sortBy from "lodash/sortBy";

interface Props {
    didClickBot: (bot_id: number) => void;
    didClickHub: (hub_id: number) => void;
}

const faultLevel: Map<HealthState, number> = new Map([
    [HealthState.HEALTH__OK, 0],
    [HealthState.HEALTH__DEGRADED, 1],
    [HealthState.HEALTH__FAILED, 2],
]);

export function NodeListPanel(props: Props) {
    /**
     * Triggered when a node is clicked.  Dispatches GlobalAction
     * to handle the event
     *
     * @param {NodeType} nodeType Indicates if hub or bot
     * @param {number} nodeID Hub or Bot ID
     *
     * @returns {void}
     *
     * @notes Remove calls to functions from props once CommandControl is updated
     */
    const handleClick = (nodeType: NodeType, nodeID: number) => {
        globalDispatch({
            type: GlobalActions.CLICKED_NODE,
            nodeType: nodeType,
            nodeID: nodeID,
        });
        if (nodeType == NodeType.BOT) props.didClickBot(nodeID);
        if (nodeType == NodeType.HUB) props.didClickHub(nodeID);
    };

    function getClassName(
        nodeType: NodeType,
        nodeID: number,
        selectedNode: SelectedNode,
        healthState: HealthState,
    ) {
        let botHubClass = "node-item";
        let selected = "";
        if (selectedNode.type == nodeType && selectedNode.id == nodeID) {
            selected = "selected";
        }
        let faultLevelClass = "faultLevel" + faultLevel.get(healthState);
        return `${botHubClass} ${faultLevelClass} ${selected}`;
    }

    // NodeListPanel
    const jaiaSystemContext = useContext(JaiaSystemContext);
    const globalContext: GlobalContextType = useContext(GlobalContext);
    const globalDispatch: React.Dispatch<GlobalAction> = useContext(GlobalDispatchContext);

    if (jaiaSystemContext === null || globalContext === null) {
        return <div></div>;
    }

    const hubs = sortBy(Array.from(jaiaSystemContext.hubs.values() ?? []), ["hubID"]);
    const bots = sortBy(Array.from(jaiaSystemContext.bots.values() ?? []), ["botID"]);
    const selectedNode = globalContext.selectedNode;

    return (
        <div id="nodesList">
            {hubs.map((hub) => (
                <div
                    key={`hub-${hub.getHubID()}`}
                    onClick={() => handleClick(NodeType.HUB, hub.getHubID())}
                    className={getClassName(
                        NodeType.HUB,
                        hub.getHubID(),
                        selectedNode,
                        hub.getHealthState(),
                    )}
                >
                    {"HUB"}
                </div>
            ))}
            {bots.map((bot) => (
                <div
                    key={`bot-${bot.getBotID()}`}
                    onClick={() => handleClick(NodeType.BOT, bot.getBotID())}
                    className={getClassName(
                        NodeType.BOT,
                        bot.getBotID(),
                        selectedNode,
                        bot.getHealthState(),
                    )}
                >
                    {bot.getBotID()}
                </div>
            ))}
        </div>
    );
}
