import React, { useEffect, useContext } from "react";
import { GlobalDispatchContext } from "../../context/Global/GlobalContext";
import { GlobalActions } from "../../context/Global/GlobalActions";

import { Feature, MapBrowserEvent } from "ol";
import { Geometry } from "ol/geom";

import { map } from "../../openlayers/maps/map";
import { bots } from "../../data/bots/bots";
import { botLayer } from "../../openlayers/layers/bot-layer";
import { MapFeatureTypes } from "../../types/openlayers-types";

import "./Map.less";

export default function Map() {
    const globalDispatch = useContext(GlobalDispatchContext);

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

        const botID = feature.get("id");

        // Update data model
        if (bots.getSelectedBotID() === botID) {
            bots.setSelectedBotID(null);
        } else {
            bots.setSelectedBotID(botID);
        }

        // Update OpenLayers
        botLayer.updateFeatures();

        // Update React Context
        globalDispatch({ type: GlobalActions.CLICKED_BOT_MAP_ICON, botID: botID });
    };

    const handleHubClick = (feature: Feature<Geometry>) => {};

    return <div id="map" data-testid="map"></div>;
}