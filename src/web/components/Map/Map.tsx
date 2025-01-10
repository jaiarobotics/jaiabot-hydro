import React, { useEffect } from "react";

import { newMap } from "../../openlayers/map_new/map-new";
import { missionLayer } from "../../openlayers/map_new/layers-new";

import { Feature, MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";

import "./Map.less";

const waypointSVG = require("../../style/icons/waypoint.svg");

export default function Map() {
    useEffect(() => {
        newMap.setTarget("map");
        newMap.on("click", (event: MapBrowserEvent<UIEvent>) => {
            handleMapClick(event);
        });
    });

    const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
        const feature = newMap.forEachFeatureAtPixel(event.pixel, (feature: Feature) => feature);

        if (feature) {
            switch (feature.getProperties().name) {
                case "waypoint":
                    handleWaypointClick(feature);
                    return;
                default:
                    return;
            }
        }

        addWaypointToMap(event.coordinate);
    };

    const handleWaypointClick = (feature: Feature) => {
        console.log("Clicked:", feature.getProperties());
    };

    return <div id="map"></div>;
}

function addWaypointToMap(coordinate: Coordinate) {
    const waypoint = new Feature({
        name: "waypoint",
        geometry: new Point(coordinate),
    });
    waypoint.setStyle(generateWaypointStyle());
    missionLayer.getSource().addFeature(waypoint);
}

function generateWaypointStyle() {
    return new Style({
        image: new Icon({
            src: waypointSVG,
            anchor: [0.5, 1],
        }),
    });
}
