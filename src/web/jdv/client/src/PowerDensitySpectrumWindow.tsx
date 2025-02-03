import React, { useEffect } from "react";
const Plotly = require('plotly.js-dist')
import { JDVPowerDensitySpectrumData } from "./JDVTypes";
import { JDVTitleBar } from "./JDVTitleBar";
import "./PowerDensitySpectrumWindow.css"


interface Props {
    powerDensitySpectrumData: JDVPowerDensitySpectrumData,
    onClose: () => void
}


export function PowerDensitySpectrumWindow(props: Props) {
    useEffect(() => {
        const trace = {
            x: props.powerDensitySpectrumData.frequency,
            y: props.powerDensitySpectrumData.powerDensity,
        }

        const layout = {
            title: 'Power Density Spectrum',
            xaxis: {
                title: 'Frequency (Hz)'
            },
            yaxis: {
                title: 'Power Density (m^2/Hz)'
            }
        }
          
        Plotly.newPlot('powerDensitySpectrumDiv', [trace], layout, {responsive: true});
    }, [])

    return <div className="PowerDensitySpectrumWindow dialog">
        <JDVTitleBar onClose={props.onClose}></JDVTitleBar>
        <div id="powerDensitySpectrumDiv" className="powerDensitySpectrumDiv"></div>
    </div>
}
