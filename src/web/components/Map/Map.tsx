import React, { useEffect } from "react";

import { Feature, MapBrowserEvent } from "ol";
import { Geometry } from "ol/geom";

import { map } from "../../openlayers/maps/map";
import { bots } from "../../data/bots/bots";
import { botLayer } from "../../openlayers/layers/bot-layer";
import { MapFeatureTypes } from "../../types/openlayers-types";

import "./Map.less";

export default function Map() {
    useEffect(() => {
        map.setTarget("map");
        map.on("click", (event: MapBrowserEvent<UIEvent>) => {
            handleMapClick(event);
        });
    });

    const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature: Feature) => feature);

        if (feature && feature.get("type")) {
            switch (feature.get("type")) {
                case MapFeatureTypes.BOT:
                    handleBotClick(feature);
                    return;
                case MapFeatureTypes.HUB:
                    handleHubClick(feature);
                    return;
                default:
                    return;
            }
        }
    };

    const handleBotClick = (feature: Feature<Geometry>) => {
        if (!bots.getBot(feature.get("id"))) {
            return;
        }

        // Update data model and OpenLayers
        const bot = bots.getBot(feature.get("id"));
        bot.setIsSelected(!bot.getIsSelected());
        botLayer.updateFeature(feature);

        // Update globalContext
    };

    const handleHubClick = (feature: Feature<Geometry>) => {};

    return <div id="map" data-testid="map"></div>;
}
