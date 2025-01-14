import { bots } from "../../../data/bots/bots";
import { PortalBotStatus } from "../../../shared/PortalStatus";
import { botLayer, updateBotLayer } from "../bot-layer";

const botStatusMock1: PortalBotStatus = {
    bot_id: 1,
    location: { lat: 77.0369, lon: 38.9072 },
};

const botStatusMock2: PortalBotStatus = {
    bot_id: 2,
    location: { lat: 77.0469, lon: 38.9172 },
};

// Location undefined
const botStatusMock3: PortalBotStatus = {
    bot_id: 3,
};

afterEach(() => {
    bots.getBots().clear();
    botLayer.getSource().clear();
});

test("Add one Bot to bot-layer", () => {
    bots.addBot(botStatusMock1);
    expect(botLayer.getSource().getFeatures().length).toBe(0);
    updateBotLayer();
    expect(botLayer.getSource().getFeatures().length).toBe(1);
    expect(botLayer.getSource().getFeatures()[0].get("name")).toBe("BOT-1");
});

test("Add two Bots to bot-layer", () => {
    bots.addBot(botStatusMock1);
    bots.addBot(botStatusMock2);
    expect(botLayer.getSource().getFeatures().length).toBe(0);
    updateBotLayer();
    expect(botLayer.getSource().getFeatures().length).toBe(2);
    expect(botLayer.getSource().getFeatures()[0].get("name")).toBe("BOT-1");
    expect(botLayer.getSource().getFeatures()[1].get("name")).toBe("BOT-2");
});

test("Add Bot to bot-layer without location", () => {
    bots.addBot(botStatusMock3);
    expect(botLayer.getSource().getFeatures().length).toBe(0);
    updateBotLayer();
    expect(botLayer.getSource().getFeatures().length).toBe(1);
    expect(botLayer.getSource().getFeatures()[0].get("name")).toBeUndefined();
});
