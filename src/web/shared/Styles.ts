import Stroke from 'ol/style/Stroke';
import { Fill, Icon, Style, Text} from 'ol/style';
import { LineString, Point } from 'ol/geom';
import {Feature} from 'ol'
import {Goal, DivePacket, TaskType} from './JAIAProtobuf'
import { ZIndex } from '@mui/material';

const arrowHead = require('./arrowHead.svg') as string
const bottomStrike = require('./bottomStrike.svg') as string
const driftTaskPacket = require('./driftTaskPacket.svg') as string
const end = require('./end.svg') as string
const start = require('./start.svg')
const bot = require('./bot.svg') as string
const hub = require('./hub.svg') as string
const runFlag = require('./run-flag.svg') as string
const botCourseOverGround = require('./botCourseOverGround.svg') as string
const botDesiredHeading = require('./botDesiredHeading.svg') as string
const taskDive = require('./taskDive.svg') as string
const taskDrift = require('./taskDrift.svg') as string
export const taskNone = require('./taskNone.svg') as string
const taskStationKeep = require('./taskStationKeep.svg') as string
const taskConstantHeading = require('./taskConstantHeading.svg') as string
const satellite = require('./satellite.svg') as string

// Export the PNG data for use in KMZ files
export const arrowHeadPng = require('./arrowHead.png') as string
export const bottomStrikePng = require('./bottomStrike.png') as string


// Colors
const defaultColor = 'white'
const defaultPathColor = 'white'
const activeGoalColor = '#39FF14'
const selectedColor = '#4ADE80'
const driftArrowColor = 'darkorange'
const disconnectedColor = 'gray'
const remoteControlledColor = 'mediumpurple'
const editColor = '#FDE68A'

export const startMarker = new Style({
    image: new Icon({
        src: start,
        anchor: [1/16, 1]
    })
})

export const endMarker = new Style({
    image: new Icon({
        src: end,
        anchor: [1/16, 1]
    })
})

const DEG = Math.PI / 180

interface XYCoordinate {
    x: number
    y: number
}

export function botMarker(feature: Feature): Style[] {
    const geometry = feature.getGeometry() as Point
    const centerPosition = geometry.getCoordinates()

    function angleToXY(angle: number): XYCoordinate {
        return { x: Math.cos(Math.PI / 2 - angle), y: -Math.sin(Math.PI / 2 - angle) }
    }

    const heading = feature.get('heading') * DEG
    const headingDelta = angleToXY(heading)

    const textOffsetRadius = 11

    let color: string

    if (feature.get('isDisconnected')) {
        color = disconnectedColor
    } else if (feature.get('remoteControlled')) {
        color = remoteControlledColor
    } else if (feature.get('selected') && feature.get('isBotRunActive')) {
        color = selectedColor
    } else if (feature.get('selected') && !feature.get('isBotRunActive')) {
        color = editColor
    } else {
        color = defaultColor
    }

    const text = String(feature.get('botId'))

    var style = [ 
        // Bot body marker
        new Style({
            image: new Icon({
                src: bot,
                color: color,
                anchor: [0.5, 0.5],
                rotation: heading,
                rotateWithView: true
            }),
            text: new Text({
                text: text,
                font: 'bold 11pt sans-serif',
                fill: new Fill({
                    color: 'black'
                }),
                offsetX: -textOffsetRadius * headingDelta.x,
                offsetY: -textOffsetRadius * headingDelta.y
            })
        })
    ]

    if (feature.get('isReacquiringGPS')) {
        style.push(
            new Style({
                image: new Icon({
                    src: satellite,
                    color: color,
                    anchor: [0.5, -1.25],
                    rotation: heading,
                    rotateWithView: true
                })
            })
        )
    }

    return style
}

export function hubMarker(feature: Feature): Style[] {
    const geometry = feature.getGeometry() as Point

    const textOffsetRadius = 11

    var color = defaultColor

    if (feature.get('selected')) {
        color = selectedColor
    }

    const text = "HUB"

    var style = [ 
        // Hub body marker
        new Style({
            image: new Icon({
                src: hub,
                color: color,
                anchor: [0.5, 0.5],
                rotateWithView: true
            }),
            text: new Text({
                text: text,
                font: 'bold 11pt sans-serif',
                fill: new Fill({
                    color: 'black'
                }),
                offsetX: 0,
                offsetY: textOffsetRadius
            })
        })
    ]

    return style
}

export function courseOverGroundArrow(feature: Feature): Style {
    const courseOverGround = feature.get('courseOverGround') * DEG
    const color = 'green'

    return new Style({
        image: new Icon({
            src: botCourseOverGround,
            color: color,
            anchor: [0.5, 1.0],
            rotation: courseOverGround,
            rotateWithView: true
        })
    })
}


export function desiredHeadingArrow(feature: Feature): Style {
    const desiredHeading = feature.get('desiredHeading') * DEG
    const color = 'green'

    return new Style({
        image: new Icon({
            src: botDesiredHeading,
            color: color,
            anchor: [0.5, 1.0],
            rotation: desiredHeading,
            rotateWithView: true
        })
    })
}

// Markers for the mission goals
export function goalSrc(taskType: TaskType | null) {
    const srcMap: {[key: string]: string} = {
        'DIVE': taskDive,
        'STATION_KEEP': taskStationKeep,
        'SURFACE_DRIFT': taskDrift,
        'CONSTANT_HEADING': taskConstantHeading,
        'NONE': taskNone       
    }

    return srcMap[taskType ?? 'NONE'] ?? taskNone
}

export function goalIcon(taskType: TaskType | null, isActiveGoal: boolean, isSelected: boolean, isActiveRun: boolean) {
    const src = goalSrc(taskType)
    let nonActiveGoalColor: string

    if (!isActiveRun) {
        nonActiveGoalColor = isSelected ? editColor : defaultColor
    } else {
        nonActiveGoalColor = isSelected ? selectedColor : defaultColor
    }

    return new Icon({
        src: src,
        color: isActiveGoal ? activeGoalColor : nonActiveGoalColor,
        anchor: [0.5, 1],
    })
}


export function flagIcon(taskType: TaskType | null, isSelected: boolean, runNumber: number, isActiveRun: boolean) {
    const src = runFlag
    const isTask = taskType && taskType !== 'NONE'

    return new Icon({
        src: src,
        color: isSelected ? (isActiveRun ? selectedColor : editColor) : defaultColor,
        // Need a bigger flag for a 3-digit run number...this also causes new anchor values
        anchor: runNumber > 99 ? (isTask ? [0.21, 1.85] : [0.21, 1.55]) : (isTask ? [0.21, 1.92] : [0.21, 1.62]),
        scale: runNumber > 99 ? 1.075 : 1.0
    })
}

export function goal(goalIndex: number, goal: Goal, isActive: boolean, isSelected: boolean, isActiveRun: boolean) {
    let icon = goalIcon(goal.task?.type, isActive, isSelected, isActiveRun)

    return new Style({
        image: icon,
        text: new Text({
            text: String(goalIndex),
            font: '12pt sans-serif',
            fill: new Fill({
                color: 'black'
            }),
            offsetY: -15,
        }),
        zIndex: 2
    })
}

export function flag(goal: Goal, isSelected: boolean, runNumber: string, zIndex: number, isActiveRun: boolean) {
    let icon = flagIcon(goal.task?.type, isSelected, Number(runNumber), isActiveRun)
    const isTask = goal.task?.type && goal.task.type !== 'NONE'

    return new Style({
        image: icon,
        text: new Text({
            text: `R${runNumber}`,
            font: '12pt sans-serif',
            fill: new Fill({
                color: 'black'
            }),
            // Text needs additional adjustments for 3-digit run numbers
            offsetY: Number(runNumber) > 99 ? isTask ? -78.875 : -62.125 : isTask ? -76.75 : -61.2175,
            offsetX: Number(runNumber) > 99 ? 24 : 20
        }),
        zIndex: zIndex
    })
}

// Markers for dives
export function divePacket(dive: DivePacket) {

    // Depth text
    var text = dive.depth_achieved?.toFixed(1)
    if (text != null) {
        text = text + 'm'
    }
    else {
        text = ''
    }

    // Icon color
    const color = 'white'

    return new Style({
        image: new Icon({
            src: bottomStrike,
            color: color
        }),
        text: new Text({
            text: String(text),
            font: '12pt sans-serif',
            fill: new Fill({
                color: 'black'
            }),
            offsetY: 20
        })
    })
}


interface EstimatedDrift {
    speed: number
    heading: number
}


interface DriftTask {
    estimated_drift: EstimatedDrift
}



interface EstimatedDrift {
    speed: number
    heading: number
}


interface DriftTask {
    estimated_drift: EstimatedDrift
}


// Markers for surface drift tasks
export function driftTask(drift: DriftTask) {

    // Icon color
    const color = '#D07103'

    return new Style({
        image: new Icon({
            src: driftTaskPacket,
            anchor: [0.5, 0.908],
            color: color,
            scale: [1.0, drift.estimated_drift.speed / 0.20],
            rotateWithView: true,
            rotation: drift.estimated_drift.heading * Math.PI / 180.0,
        }),
        // text: new Text({
        //     text: new String(text),
        //     font: '12pt sans-serif',
        //     fill: new Fill({
        //         color: 'black'
        //     }),
        //     offsetY: 20
        // })
    })
}

// The mission path linestring
export function missionPath(feature: Feature) {
    const isSelected = feature.get('isSelected')
    const isActiveRun = feature.get('isActiveRun')
    let pathColor: string

    if (!isActiveRun) {
        pathColor = isSelected ? editColor : defaultPathColor
    } else {
        pathColor = isSelected ? selectedColor : defaultPathColor
    }

    const lineDash = feature.get('isConstantHeading') ? [6, 12] : undefined

    const geometry = feature.getGeometry() as LineString

    const styles = [
        new Style({
            stroke: new Stroke({
                width: 4,
                color: 'black',
                lineDash: lineDash
            })
        }),
        new Style({
            stroke: new Stroke({
                width: 2,
                color: pathColor,
                lineDash: lineDash
            })
        })
    ]

    geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const midpoint = [start[0] + dx / 2, start[1] + dy / 2]
        const rotation = Math.atan2(dy, dx);

        // arrows
        styles.push(
            new Style({
                geometry: new Point(midpoint),
                image: new Icon({
                    src: arrowHead,
                    anchor: [0.5, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                    color: pathColor,
                }),
                zIndex: 1
            })
        );
    });

    return styles
}

// The drift task linestring
export function driftArrow(feature: Feature) {
    const color = driftArrowColor

    const geometry = feature.getGeometry() as LineString
    const styles = [
        new Style({
            stroke: new Stroke({
                width: 6,
                color: 'black'
            })
        }),
        new Style({
            stroke: new Stroke({
                width: 4,
                color: color
            })
        })
    ]

    geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);

        // arrows
        styles.push(
            new Style({
                geometry: new Point(end),
                image: new Icon({
                    src: arrowHead,
                    anchor: [0, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                    color: color,
                }),
                zIndex: 1
            })
        );
    });

    return styles
}
