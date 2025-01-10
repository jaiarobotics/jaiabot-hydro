import { Layer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";

export const newLayers: Map<string, Layer> = new Map<string, Layer>();

const OSMLayer = new TileLayer({
    properties: {
        title: "open-street-map",
    },
    source: new OSM({ wrapX: false }),
});

export const missionLayer = new VectorLayer({
    properties: {
        title: "mission",
    },
    source: new VectorSource({ wrapX: false }),
});

newLayers.set(OSMLayer.getProperties().title, OSMLayer);
newLayers.set(missionLayer.getProperties().title, missionLayer);
