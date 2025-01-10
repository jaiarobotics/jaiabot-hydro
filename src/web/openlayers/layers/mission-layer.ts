import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export const missionLayer = new VectorLayer({
    properties: {
        title: "mission",
    },
    source: new VectorSource({ wrapX: false }),
});
