import { Layer } from "ol/layer";

import { OSMLayer } from "./osm-layer";
import { botLayer } from "./bot-layer";
import { hubLayer } from "./hub-layer";
import { missionLayer } from "./mission-layer";
import { LayerTitles } from "../../types/openlayers-types";

export const layers: Map<string, Layer> = new Map<string, Layer>();

// Tile layers
layers.set(LayerTitles.OSM_LAYER, OSMLayer);
// Vector layers
layers.set(LayerTitles.BOT_LAYER, botLayer.getVectorLayer());
layers.set(LayerTitles.HUB_LAYER, hubLayer.getVectorLayer());
layers.set(LayerTitles.MISSION_LAYER, missionLayer.getVectorLayer());
