// OpenLayers
import { Map, View } from "ol";
import { Zoom, Rotate, ScaleLine, Attribution } from "ol/control";

// Jaia
import { layers } from "./layers";

const MERCATOR = "EPSG:3857";

export const newMap = new Map({
    layers: Array.from(layers.values()),
    controls: [
        new Zoom(),
        new Rotate(),
        new ScaleLine({ units: "metric" }),
        new Attribution({
            collapsible: false,
        }),
    ],
    view: new View({
        projection: MERCATOR,
        center: [0, 0],
        zoom: 0,
        maxZoom: 24,
    }),
    maxTilesLoading: 64,
    moveTolerance: 20,
});
