import { Layer } from "ol/layer";
import { OSMLayer } from "./osm-layer";
import { botLayer } from "./bot-layer";
import { hubLayer } from "./hub-layer";
import { missionLayer } from "./mission-layer";

export const layers: Map<string, Layer> = new Map<string, Layer>();

layers.set(OSMLayer.getProperties().title, OSMLayer);
layers.set(botLayer.getProperties().title, botLayer);
layers.set(hubLayer.getProperties().title, hubLayer);
layers.set(missionLayer.getProperties().title, missionLayer);
