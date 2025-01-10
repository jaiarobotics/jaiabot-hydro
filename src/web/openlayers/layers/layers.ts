import { Layer } from "ol/layer";
import { OSMLayer } from "../layers/osm-layer";
import { botLayer } from "../layers/bot-layer";
import { missionLayer } from "../layers/mission-layer";

export const layers: Map<string, Layer> = new Map<string, Layer>();

layers.set(OSMLayer.getProperties().title, OSMLayer);
layers.set(botLayer.getProperties().title, botLayer);
layers.set(missionLayer.getProperties().title, missionLayer);
