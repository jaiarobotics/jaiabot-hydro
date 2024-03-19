import { Feature } from 'ol';
import { Goal, TaskType } from './JAIAProtobuf';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
export declare const taskNone: string;
export declare const driftArrowPngs: string[];
export declare const bottomStrikePng: string;
export declare const startMarker: Style;
export declare const endMarker: Style;
export declare function botMarker(feature: Feature): Style[];
export declare function hubMarker(feature: Feature<Point>): Style[];
export declare function hubCommsCircleStyle(feature: Feature<Point>): Style[];
export declare function courseOverGroundArrow(courseOverGround: number): Style;
export declare function headingArrow(heading: number): Style;
export declare function desiredHeadingArrow(feature: Feature): Style;
export declare function createGoalIcon(taskType: TaskType | null | undefined, isActiveGoal: boolean, isSelected: boolean, canEdit: boolean, echoStart: boolean | null | undefined): Icon;
export declare function getGoalStyle(feature: Feature<Point>): Style;
export declare function getWaypointCircleStyle(feature: Feature<Point>): Style[];
export declare function getFlagStyle(goal: Goal, isSelected: boolean, runNumber: string, zIndex: number, canEdit: boolean): Style;
export declare function getRallyStyle(rallyFeatureCount: number): Style;
export declare function divePacketIconStyle(feature: Feature, animatedColor?: string): Style;
export declare function driftSpeedToBinIndex(driftSpeed: number): number;
export declare function driftPacketIconStyle(feature: Feature, animatedColor?: string): Style;
export declare function driftMapStyle(feature: Feature): Style;
export declare function missionPath(feature: Feature): Style[];
