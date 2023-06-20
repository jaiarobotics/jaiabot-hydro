import { Map } from "ol"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { Collection } from "ol"
import LayerGroup from "ol/layer/Group"
import { PortalHubStatus } from "./shared/PortalStatus"
import { HubOrBot } from "./HubOrBot"
import { getMapCoordinate } from "./Utilities"
import { Point } from "ol/geom"
import { Feature } from "ol"
import * as Styles from "./shared/Styles"
import { Layer } from "ol/layer"


export class HubLayers {
    layers: {[key: number]: VectorLayer<VectorSource>} = {}
    map: Map

    constructor(map: Map) {
        this.map = map
    }

    getHubLayer(hub_id: number) {
        const layer = this.layers[hub_id]
        if (layer) {
            return layer
        }
        else {
            const new_layer = new VectorLayer({
                properties: {
                    name: hub_id,
                    title: hub_id,
                    hub_id: hub_id,
                },
                zIndex: 100,
                source: new VectorSource({
                    wrapX: false,
                    features: new Collection([], { unique: true })
                })
            })

            this.layers[hub_id] = new_layer
            this.map.addLayer(new_layer)

            return new_layer
        }
    }

    deleteHubLayer(hub_id: number) {
		this.map.removeLayer(this.layers[hub_id])
		delete this.layers[hub_id]
	}

	update(hubs: {[key: string]: PortalHubStatus}, selectedHubOrBot: HubOrBot) {

        function getHubFeature(hub: PortalHubStatus, map: Map, source: VectorSource) {
            const feature = source.getFeatureById(hub.hub_id)
            if (feature) {
                return feature
            }

            const new_feature = new Feature({
                name: hub.hub_id,
                geometry: new Point(getMapCoordinate(hub.location, map))
            })
            new_feature.setId(hub.hub_id)
            new_feature.setStyle(Styles.hubMarker)
            new_feature.set('hub', hub)

            source.addFeature(new_feature)
        
            return new_feature
        }

        for (let hubId in hubs) {
            let hub = hubs[hubId];
    
            // ID
            const hub_id = hub.hub_id
            // Geometry
            const hubLatitude = hub.location?.lat
            const hubLongitude = hub.location?.lon
            // Properties
            const hubHeading = 0
    
            const hubLayer = this.getHubLayer(hub_id)
            const hubSource = hubLayer.getSource()
            const hubFeature = getHubFeature(hub, this.map, hubSource)
    
            const selected = selectedHubOrBot != null && selectedHubOrBot.type == "hub" && selectedHubOrBot.id == hub_id
            hubFeature.set('selected', selected);
        } // end foreach hub
    }
}

