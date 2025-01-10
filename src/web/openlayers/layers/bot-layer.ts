import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { bots } from "../../data/bots/bots";
import { createBotFeature } from "../features/bot-feature";

export const botLayer = new VectorLayer({
    properties: {
        title: "bot",
    },
    source: new VectorSource({ wrapX: false }),
});

export function updateBotLayer() {
    let source = botLayer.getSource();
    source.clear();
    for (let [botID, bot] of bots.getBots()) {
        const botFeature = createBotFeature(botID);
        source.addFeature(botFeature);
    }
}
