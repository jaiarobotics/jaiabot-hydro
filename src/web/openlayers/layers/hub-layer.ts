import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { hubs } from "../../data/hubs/hubs";
import { generateHubFeature } from "../features/hub-feature";

export const hubLayer = new VectorLayer({
    properties: {
        title: "hub-layer",
    },
    source: new VectorSource({ wrapX: false }),
});

export function updateHubLayer() {
    let source = hubLayer.getSource();
    source.clear();
    for (let [hubID, hub] of hubs.getHubs()) {
        const hubFeature = generateHubFeature(hubID);
        source.addFeature(hubFeature);
    }
}
