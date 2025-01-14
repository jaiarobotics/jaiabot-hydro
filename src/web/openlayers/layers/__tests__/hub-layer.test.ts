import { hubs } from "../../../data/hubs/hubs";
import { PortalHubStatus } from "../../../shared/PortalStatus";
import { hubLayer, updateHubLayer } from "../hub-layer";

const hubStatusMock1: PortalHubStatus = {
    hub_id: 1,
    location: { lat: 77.0369, lon: 38.9072 },
    portalStatusAge: 0,
};

// location undefined
const hubStatusMock2: PortalHubStatus = {
    hub_id: 1,
    portalStatusAge: 0,
};

afterEach(() => {
    hubs.getHubs().clear();
    hubLayer.getSource().clear();
});

test("Add Hub to hub-layer", () => {
    hubs.addHub(hubStatusMock1);
    expect(hubLayer.getSource().getFeatures().length).toBe(0);
    updateHubLayer();
    expect(hubLayer.getSource().getFeatures().length).toBe(1);
    expect(hubLayer.getSource().getFeatures()[0].get("name")).toBe("HUB-1");
});

test("Add Hub to hub-layer without location", () => {
    hubs.addHub(hubStatusMock2);
    expect(hubLayer.getSource().getFeatures().length).toBe(0);
    updateHubLayer();
    expect(hubLayer.getSource().getFeatures().length).toBe(1);
    expect(hubLayer.getSource().getFeatures()[0].get("name")).toBeUndefined();
});
