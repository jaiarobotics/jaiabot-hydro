import { jaiaAPI } from "../../common/JaiaAPI"
import { Heatmap } from "ol/layer"
import VectorSource from 'ol/source/Vector'
import KML from 'ol/format/KML'
import Collection from "ol/Collection"
import Feature from "ol/Feature"
import { Point } from "ol/geom"
import { getTransform } from "ol/proj"
import ImageLayer from 'ol/layer/Image';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import { mdiConsoleNetwork } from "@mdi/js"
import {
	Circle as OlCircleStyle, Fill as OlFillStyle, Stroke as OlStrokeStyle, Style as OlStyle
} from 'ol/style';
import OlFeature from 'ol/Feature';
import OlIcon from 'ol/style/Icon';
import OlPoint from 'ol/geom/Point';
import diveLocation from '../icons/task_packet/DiveLocation.png'
import currentDirection from '../icons/task_packet/Arrow.png'
import botSelectedIcon from '../icons/bot-selected.svg'
import OlText from 'ol/style/Text';
// TurfJS
import * as turf from '@turf/turf';
import { Vector as VectorLayer } from "ol/layer"
import GeoJSON from 'ol/format/GeoJSON'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'

const POLL_INTERVAL = 5000

const mercator = 'EPSG:3857'
const equirectangular = 'EPSG:4326'
const equirectangular_to_mercator = getTransform(equirectangular, mercator);
const mercator_to_equirectangular = getTransform(mercator, equirectangular);

export class TaskData {

    constructor() {
        this.pollTimer = setInterval(this._pollTaskPackets.bind(this), POLL_INTERVAL)
        
        this.collection = new Collection([])

        this.depthRange = [0, 1]

        this.taskPackets = []

        // Plot depth soundings using a heatmap
        this.heatMapLayer = new Heatmap({
            title: 'Depth',
            source: new VectorSource({
                features: this.collection
            }),
            gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00', '#f00', '#f00', '#f00', '#f00'],
            radius: 16,
            blur: 32,
            zIndex: 25,
            weight: (feature) => {
                const weight = (feature.get('depth') - this.depthRange[0]) / (this.depthRange[1])
                return weight
            },
          })

        // Plot depth soundings using a contour plot

        this.contourLayer = new VectorLayer({
            title: 'Depth Contours',
            zIndex: 25,
            opacity: 0.5,
            source: null,
          })

        this.taskPacketDiveLayer = new VectorLayer({
            title: 'Dive Icon',
            zIndex: 1001,
            opacity: 1,
            source: null,
          })

        this.taskPacketDiveInfoLayer = new VectorLayer({
            title: 'Dive Info',
            zIndex: 1001,
            opacity: 1,
            source: null,
          })

        this.taskPacketDriftLayer = new VectorLayer({
            title: 'Drift Icon',
            zIndex: 1001,
            opacity: 1,
            source: null,
          })

        this.taskPacketDriftInfoLayer = new VectorLayer({
            title: 'Drift Info',
            zIndex: 1001,
            opacity: 1,
            source: null,
          })
    }

    updateContourPlot() {
        jaiaAPI.getContourMapBounds().then((bounds) => {
            const imageExtent = [bounds.x0, bounds.y0, bounds.x1, bounds.y1]

            const source = new Static({
                attributions: 'JaiaBot',
                url: '/jaia/contour-map',
                projection: equirectangular,
                imageExtent: imageExtent,
              })

            this.contourLayer.setSource(source)

            console.log('loaded: ', source)
        })
    }

    /*
    Task Packet Example
    0: 
    botId: 0
    dive: 
        depthAchieved: 1
        diveRate: 0.5
        durationToAcquireGps: 0.3
        measurement: Array(1)
            0: 
            {meanDepth: 1, meanTemperature: 15, meanSalinity: 20}
            length: 1
        startLocation: 
            lat: 41.487142
            lon: -71.259441 
        unpoweredRiseRate: 0.3
    drift: 
        driftDuration: 0
        endLocation: 
            lat: 41.487135
            lon: -71.259441
        startLocation: 
            lat: 41.487136
            lon: -71.259441
        endTime: "1664484912000000"
        startTime: "1664484905000000"
        type: "DIVE"
    */

    updateDiveLocations() {
        let taskDiveFeatures = []
        let taskDiveInfoFeatures = []

        for (let [botId, taskPacket] of Object.entries(this.taskPackets)) {
            if(taskPacket.type == "DIVE")
            {            
                let divePacket = taskPacket.dive;
                let iconStyle = new OlStyle({
                    image: new OlIcon({
                        src: diveLocation,
                        // the real size of your icon
                        size: [319, 299],
                        // the scale factor
                        scale: 0.1
                    })
                });

                let iconInfoStyle = new OlStyle({
                    text : new OlText({
                        font : `15px Calibri,sans-serif`,
                        text : `Depth (m): ` + divePacket.depthAchieved 
                             + '\nDiveRate (m/s): ' + divePacket.depthAchieved,
                        scale: 1,
                        fill: new OlFillStyle({color: 'white'}),
                        backgroundFill: new OlFillStyle({color: 'black'}),
                        textAlign: 'end',
                        justify: 'left',
                        textBaseline: 'bottom',
                        padding: [3, 5, 3, 5],
                        offsetY: -10,
                        offsetX: -15
                    })
                });
    
                let pt = equirectangular_to_mercator([divePacket.startLocation.lon, divePacket.startLocation.lat])
                let diveFeature = new OlFeature({ geometry: new OlPoint(pt) })
                let diveInfoFeature = new OlFeature({ geometry: new OlPoint(pt) })
                diveFeature.setStyle(iconStyle)  
                diveInfoFeature.setStyle(iconInfoStyle)   
                taskDiveFeatures.push(diveFeature) 
                taskDiveInfoFeatures.push(diveInfoFeature) 
            }
        }

        let diveVectorSource = new VectorSource({
            features: taskDiveFeatures
        })

        let diveInfoVectorSource = new VectorSource({
            features: taskDiveInfoFeatures
        })

        this.taskPacketDiveLayer.setSource(diveVectorSource)
        this.taskPacketDiveInfoLayer.setSource(diveInfoVectorSource)
    }

    updateDriftLocations() {
        let taskDriftFeatures = []
        let taskDriftInfoFeatures = []

        for (let [botId, taskPacket] of Object.entries(this.taskPackets)) {
            if(taskPacket.type == "DIVE" ||
               taskPacket.type == "SURFACE_DRIFT")
            {
                let driftPacket = taskPacket.drift;
                
                let start = [driftPacket.startLocation.lon, driftPacket.startLocation.lat];
                let end = [driftPacket.endLocation.lon, driftPacket.endLocation.lat];

                let bearing = turf.bearing(start, end);

                let options = {units: 'meters'};
                var distance = turf.distance(start, end, options);
                let meters_per_second = distance/driftPacket.driftDuration;

                let rotation = (bearing ?? 180) * (Math.PI / 180.0)

                let iconStyle = new OlStyle({
                    image: new OlIcon({
                        src: currentDirection,
                        // the real size of your icon
                        size: [152, 793],
                        // the scale factor
                        scale: 0.05,
                        rotation: rotation,
                        rotateWithView : true
                    })
                });

                let iconInfoStyle = new OlStyle({
                    text : new OlText({
                        font : `15px Calibri,sans-serif`,
                        text : `Duration (s): ` + driftPacket.driftDuration 
                             + '\nDirection (deg): ' + bearing.toFixed(2) 
                             + '\nSpeed (m/s): ' + meters_per_second.toFixed(2),
                        scale: 1,
                        fill: new OlFillStyle({color: 'white'}),
                        backgroundFill: new OlFillStyle({color: 'black'}),
                        textAlign: 'end',
                        justify: 'left',
                        textBaseline: 'bottom',
                        padding: [3, 5, 3, 5],
                        offsetY: -10,
                        offsetX: -15
                    })
                });

                let pt = equirectangular_to_mercator([driftPacket.endLocation.lon, driftPacket.endLocation.lat])
                let driftFeature = new OlFeature({ geometry: new OlPoint(pt) })
                let driftInfoFeature = new OlFeature({ geometry: new OlPoint(pt) })
                driftFeature.setStyle(iconStyle)   
                driftInfoFeature.setStyle(iconInfoStyle)
                taskDriftFeatures.push(driftFeature)   
                taskDriftInfoFeatures.push(driftInfoFeature)
            }
        }

        let driftVectorSource = new VectorSource({
            features: taskDriftFeatures
        })

        let driftInfoVectorSource = new VectorSource({
            features: taskDriftInfoFeatures
        })

        this.taskPacketDriftLayer.setSource(driftVectorSource)
        this.taskPacketDriftInfoLayer.setSource(driftInfoVectorSource)
    }

    _updateContourPlot() {
        jaiaAPI.getTaskGeoJSON().then((geojson) => {
                console.log('geojson = ', geojson)

                // Manually transform features, because OpenLayers is a lazy, useless piece of shit
                var features = new GeoJSON().readFeatures(geojson)
                features.forEach((feature) => {
                    feature.getGeometry().transform(equirectangular, mercator)
                })

                const vectorSource = new VectorSource({
                    features: features,
                    projection: equirectangular
                })
              
                this.contourLayer.setSource(vectorSource)
        })
    }

    _pollTaskPackets() {
        jaiaAPI.getTaskPackets().then((taskPackets) => {

            console.log('taskPackets.length = ', taskPackets.length)

            if (taskPackets.length > this.taskPackets.length) {
                console.log('new taskPackets arrived!')

                this.taskPackets = taskPackets

                console.log(this.taskPackets);
                this.updateDiveLocations();
                this.updateDriftLocations();

                if (taskPackets.length >= 3) {
                    console.log('Updating contour plot')
                    //this.updateContourPlot()
                }

            }

        })

        // We're hiding this bathy chart for now
        // this._updateContourPlot()
    }

    getContourLayer() {
        return this.contourLayer
    }

    getTaskPacketDiveLayer() {
        return this.taskPacketDiveLayer
    }

    getTaskPacketDiveInfoLayer() {
        return this.taskPacketDiveInfoLayer
    }

    getTaskPacketDriftLayer() {
        return this.taskPacketDriftLayer
    }

    getTaskPacketDriftInfoLayer() {
        return this.taskPacketDriftInfoLayer
    }
}

export const taskData = new TaskData()
