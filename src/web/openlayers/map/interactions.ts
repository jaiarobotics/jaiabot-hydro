import * as Interaction from "ol/interaction";
import * as Source from "ol/source";
import * as Style from "ol/style";
import * as Events from "ol/events";
import { DrawEvent } from "ol/interaction/Draw";
import CommandControl from "../../containers/CommandControl/CommandControl";
import { unByKey } from "ol/Observable";
import { Map } from "ol";
import PointerInteraction from "ol/interaction/Pointer";
import { getElementById } from "../../shared/Utilities";

export class Interactions {
    measureInteraction = new Interaction.Draw({
        source: new Source.Vector(),
        type: "LineString",
        style: new Style.Style({
            fill: new Style.Fill({
                color: "rgba(255, 255, 255, 0.2)",
            }),
            stroke: new Style.Stroke({
                color: "rgba(0, 0, 0, 0.5)",
                lineDash: [10, 10],
                width: 2,
            }),
            image: new Style.Circle({
                radius: 5,
                stroke: new Style.Stroke({
                    color: "rgba(0, 0, 0, 0.7)",
                }),
                fill: new Style.Fill({
                    color: "rgba(255, 255, 255, 0.2)",
                }),
            }),
        }),
    });

    measureListener: Events.EventsKey;

    pointerInteraction: PointerInteraction;

    selectInteraction = new Interaction.Select();

    translateInteraction: Interaction.Translate;

    constructor(commandControl: CommandControl, map: Map) {
        this.measureInteraction.on("drawstart", (evt: DrawEvent) => {
            commandControl.setState({ measureFeature: evt.feature });

            this.measureListener = evt.feature.getGeometry().on("change", (evt2) => {
                const geom = evt2.target;
                // tooltipCoord = geom.getLastCoordinate();
                getElementById<HTMLElement>("measureResult").innerText =
                    CommandControl.formatLength(geom);
            });
        });

        this.measureInteraction.on("drawend", () => {
            commandControl.setState({ measureActive: false, measureFeature: null });
            unByKey(this.measureListener);
            commandControl.changeInteraction();
        });
        this.pointerInteraction = new PointerInteraction({
            handleEvent: commandControl.handleEvent.bind(commandControl),
            stopDown: commandControl.stopDown.bind(commandControl),
        });

        this.translateInteraction = new Interaction.Translate({
            filter: function (feature) {
                return feature.get("enableDrag");
            },
        });
    }
}
