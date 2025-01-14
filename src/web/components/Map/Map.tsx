import React, { useEffect } from "react";

import { map } from "../../openlayers/maps/map";

import { Feature, MapBrowserEvent } from "ol";

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

        if (feature) {
            switch (feature.getProperties().name) {
                default:
                    return;
            }
        }
    };

    return <div id="map"></div>;
}
