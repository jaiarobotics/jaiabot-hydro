// OpenLayers
import { Feature } from "ol";
import { Fill, Icon, Style, Text } from "ol/style";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";

// Jaia
import { bots } from "../../data/bots/bots";
import { view } from "../views/view";

// Util
import { angleToXY } from "../../utils/style";

// Style
const botIcon = require("../../style/icons/bot.svg");

const TEXT_OFFSET_RADIUS = 11;

export function generateBotFeature(botID: number) {
    const bot = bots.getBot(botID);

    if (!bot) {
        return new Feature();
    }

    if (!bot.getLocation()) {
        return new Feature();
    }

    const coordinate: Coordinate = [bot.getLocation().lon, bot.getLocation().lat];
    const heading = bot.getBotSensors().getIMU().getHeading() ?? 0;

    const feature = new Feature({
        name: `BOT-${botID}`,
        geometry: new Point(fromLonLat(coordinate, view.getProjection())),
    });
    feature.setStyle(generateBotStyle(botID, heading));
    return feature;
}

function generateBotStyle(botID: number, heading: number) {
    return new Style({
        image: new Icon({
            src: botIcon,
            anchor: [0.5, 0.5],
            rotation: heading,
            rotateWithView: true,
        }),
        text: new Text({
            text: botID.toString(),
            font: "bold 11pt sans-serif",
            fill: new Fill({
                color: "black",
            }),
            rotateWithView: true,
            offsetX: -TEXT_OFFSET_RADIUS * angleToXY(heading).x,
            offsetY: -TEXT_OFFSET_RADIUS * angleToXY(heading).y,
        }),
    });
}
