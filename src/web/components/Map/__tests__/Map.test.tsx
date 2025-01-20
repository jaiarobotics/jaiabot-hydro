import { render } from "@testing-library/react";

import { act } from "react";

import { Feature } from "ol";
import { Geometry } from "ol/geom";

import Map from "../Map";
import { map } from "../../../openlayers/maps/map";
import { bots } from "../../../data/bots/bots";
import { hubs } from "../../../data/hubs/hubs";
import { MapFeatureTypes } from "../../../types/openlayers-types";
import { PortalBotStatus, PortalHubStatus } from "../../../shared/PortalStatus";
import { mapBrowserEventMock } from "../../../tests/__mocks__/openlayers/events/map-browser-click.mock";
import { GlobalContextProvider } from "../../../context/Global/GlobalContext";

const mapModule = jest.requireActual("../../../openlayers/maps/map");

const botFeatureMock: Feature<Geometry> = new Feature();
botFeatureMock.set("type", MapFeatureTypes.BOT);
botFeatureMock.set("id", 1);

const hubFeatureMock: Feature<Geometry> = new Feature();
hubFeatureMock.set("type", MapFeatureTypes.HUB);
hubFeatureMock.set("id", 1);

const botStatusMock1: PortalBotStatus = {
    bot_id: 1,
};

const hubStatusMock1: PortalHubStatus = {
    hub_id: 1,
    portalStatusAge: 1,
};

test("Select and deselect Bot and Hub icons on map", () => {
    // Resolve click to being on a Feature of type MapFeatureTypes.BOT
    mapModule.map.forEachFeatureAtPixel = jest.fn().mockReturnValue(botFeatureMock);
    render(
        <GlobalContextProvider>
            <Map />
        </GlobalContextProvider>,
    );

    // Bot
    bots.addBot(botStatusMock1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(bots.getSelectedBotID()).toBe(1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(bots.getSelectedBotID()).toBe(null);

    // Hub
    mapModule.map.forEachFeatureAtPixel = jest.fn().mockReturnValue(hubFeatureMock);
    hubs.addHub(hubStatusMock1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(hubs.getSelectedHubID()).toBe(1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(hubs.getSelectedHubID()).toBe(null);
});
