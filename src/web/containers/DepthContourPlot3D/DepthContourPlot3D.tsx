import React from "react";
const Plotly = require("plotly.js-dist");
import "./DepthContourPlot3D.less";
import { taskData } from "../../data/task_packets/task-packets";
import { DivePacket, TaskPacket } from "../../shared/JAIAProtobuf";
import internal from "stream";
import { cm_data } from "./DepthColorMap";

interface Props {
    taskPackets: TaskPacket[];
}

export default function DepthContourPlot3D(props: Props) {
    const div = <div id="depth-contour-plot"></div>;

    React.useEffect(() => {
        setupDepthContourPlot3D(props.taskPackets);
    }, []);

    return <div className="depth-contour-plot-container">{div}</div>;
}

function setupDepthContourPlot3D(taskPackets: TaskPacket[]) {
    const div = document.getElementById("depth-contour-plot");

    const divePackets = taskPackets
        .map((taskPacket) => taskPacket.dive)
        .filter((dive) => dive?.bottom_dive);

    if (divePackets.length == 0) {
        div.innerHTML = "No dive packets to display.";
        return;
    }

    const depths = divePackets.map((dive) => -dive.depth_achieved);
    const topDepth = Math.max(...depths);
    const bottomDepth = Math.min(...depths);
    const depthRange = topDepth - bottomDepth;

    const intensity = depths.map((depth) => (topDepth - depth) / depthRange);

    const colorscale = [
        [0, "red"],
        [1, "green"],
    ];

    var data = [
        {
            opacity: 1.0,
            colorscale: colorscale,
            type: "mesh3d",
            x: divePackets.map((dive) => dive.start_location?.lon),
            y: divePackets.map((dive) => dive.start_location?.lat),
            z: depths,
            intensity: intensity,
        },
    ];

    const layout = {
        title: {
            text: "Bottom Depth",
        },
        scene: {
            xaxis: {
                title: {
                    text: "Longitude (°)",
                },
            },
            yaxis: {
                title: {
                    text: "Latitude (°)",
                },
            },
            zaxis: {
                title: {
                    text: "Bottom Depth (m)",
                },
            },
        },
    };

    Plotly.newPlot(div, data, layout);
}
