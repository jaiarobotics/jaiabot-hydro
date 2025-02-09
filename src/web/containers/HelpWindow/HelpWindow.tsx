import React from "react";
import "./HelpWindow.less";
import Icon from "@mdi/react";
import Button from "@mui/material/Button";
import {
    mdiPlay,
    mdiWindowClose,
    mdiCheckboxMarkedCirclePlusOutline,
    mdiArrowULeftTop,
    mdiStop,
    mdiViewList,
    mdiDownloadMultiple,
    mdiProgressDownload,
    mdiCog,
    mdiWrench,
    mdiSquareEditOutline,
    mdiRuler,
} from "@mdi/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
const rallyIcon = require("../../shared/rally.svg") as string;

interface ButtonDescriptor {
    imgSrc?: string;
    iconPath?: string;
    fontAwesomeIconDefinition?: IconDefinition;
    iconStyle?: { [key: string]: any };
    name: string;
    description: string;
}

function getButtonRow(descriptor: ButtonDescriptor) {
    var buttonContents;

    if (descriptor.imgSrc) {
        buttonContents = <img src={descriptor.imgSrc}></img>;
    } else if (descriptor.iconPath) {
        buttonContents = <Icon path={descriptor.iconPath} title={descriptor.name} />;
    } else if (descriptor.fontAwesomeIconDefinition) {
        buttonContents = (
            <FontAwesomeIcon icon={descriptor.fontAwesomeIconDefinition} title={descriptor.name} />
        );
    }

    return (
        <tr>
            <td className="button-image">
                <Button className="button-jcc" style={descriptor.iconStyle}>
                    {buttonContents}
                </Button>
            </td>
            <td className="button-name">{descriptor.name}</td>
            <td className="button-description">{descriptor.description}</td>
        </tr>
    );
}

const buttons: ButtonDescriptor[] = [
    {
        iconPath: mdiCheckboxMarkedCirclePlusOutline,
        name: "System Check All Bots",
        description:
            "Run a system check on all bots in the pod.  Missions can only be run after the system check completes successfully.",
    },
    {
        imgSrc: rallyIcon,
        name: "Add Rally Point",
        description: "Add a rally point that can be used at the start or end of a survey mission.",
    },
    {
        iconPath: mdiStop,
        iconStyle: { backgroundColor: "#cc0505" },
        name: "Stop All Missions",
        description: "Order all bots to stop their currently running missions.",
    },
    {
        iconPath: mdiPlay,
        name: "Run Mission",
        description: "Run the mission as currently edited on the map.",
    },
    {
        iconPath: mdiArrowULeftTop,
        name: "Undo",
        description: "Undo the last 10 mission planning actions (excluding Task modifications).",
    },
    {
        iconPath: mdiViewList,
        name: "Mission Panel",
        description:
            "Open the Mission Panel, which shows each run in the current mission, and which bots are assigned to which run.  Missions can also be saved, loaded, and cleared from this panel.",
    },
    {
        iconPath: mdiSquareEditOutline,
        name: "Edit Optimized Mission Survey",
        description:
            "Open the Optimized Mission Survey, which can be used to configure a survey mission, where the pod of Jaiabots will coordinate to survey an area of the map.  The tasks performed at each waypoint in the survey mission can be customized.",
    },
    {
        iconPath: mdiDownloadMultiple,
        name: "Download All",
        description: "Start downloading log and sensor data from all of the bots to the hub.",
    },
    {
        iconPath: mdiProgressDownload,
        name: "Download Queue",
        description:
            "Open the Download Queue panel, which shows the currently queued data downloads from the bots to the hub.",
    },
    {
        iconPath: mdiCog,
        name: "Settings",
        description: "Open the Settings panel for Jaia Command & Control.",
    },
    {
        iconPath: mdiRuler,
        name: "Measure Distance",
        description:
            "Click two or more points to measure the total distance along a set of line segments.",
    },
];

interface Props {
    onClose?: () => void;
}

/**
 * A window showing help information for the Jaia Command & Control user
 *
 * @export
 * @class HelpWindow
 * @typedef {HelpWindow}
 * @extends {React.Component}
 */
export function HelpWindow(props: Props) {
    return (
        <div className="help-window">
            <div className="help-titlebar">
                <div className="help-title">Jaia Command & Control Help</div>
                <Button onClick={props.onClose}>
                    <Icon path={mdiWindowClose} title="Close Window"></Icon>
                </Button>
            </div>
            <table className="help-button-table">
                <tbody>{buttons.map(getButtonRow)}</tbody>
            </table>
        </div>
    );
}
