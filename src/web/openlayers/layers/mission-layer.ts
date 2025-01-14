import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const missionLayer = new VectorLayer({
    properties: {
        title: "mission-layer",
    },
    source: new VectorSource({ wrapX: false }),
});
