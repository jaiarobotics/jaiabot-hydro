import { render } from "@testing-library/react";

import { act } from "react";

import { Feature } from "ol";
import { Geometry } from "ol/geom";

import Map from "../Map";
import { map } from "../../../openlayers/maps/map";
import { bots } from "../../../data/bots/bots";
import { MapFeatureTypes } from "../../../types/openlayers-types";
import { PortalBotStatus } from "../../../shared/PortalStatus";
import { mapBrowserEventMock } from "../../../tests/__mocks__/openlayers/events/map-browser-click.mock";
import { GlobalContextProvider } from "../../../context/Global/GlobalContext";

const mapModule = jest.requireActual("../../../openlayers/maps/map");

const mockBotFeature: Feature<Geometry> = new Feature();
mockBotFeature.set("type", MapFeatureTypes.BOT);
mockBotFeature.set("id", 1);

const botStatusMock1: PortalBotStatus = {
    bot_id: 1,
    location: { lat: 77.0369, lon: 38.9072 },
};

test("Select/deselect Bot icon on map", () => {
    // Resolve click to being on a Feature of type MapFeatureTypes.BOT
    mapModule.map.forEachFeatureAtPixel = jest.fn().mockReturnValue(mockBotFeature);
    render(
        <GlobalContextProvider>
            <Map />
        </GlobalContextProvider>,
    );
    bots.addBot(botStatusMock1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(bots.getSelectedBotID()).toBe(1);
    act(() => {
        map.dispatchEvent(mapBrowserEventMock);
    });
    expect(bots.getSelectedBotID()).toBe(null);
});