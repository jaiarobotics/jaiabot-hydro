/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/sort-comp */
/* eslint-disable no-unused-vars */

import React from 'react'
import { formatLatitude, formatLongitude, formatAttitudeAngle } from './Utilities'
import SoundEffects from './SoundEffects'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Icon from '@mdi/react'
import { mdiPlay, mdiCheckboxMarkedCirclePlusOutline, 
	     mdiSkipNext, mdiDownload, mdiStop, mdiPause } from '@mdi/js'
import rcMode from '../icons/controller.svg'
import goToRallyGreen from '../icons/go-to-rally-point-green.png'
import goToRallyRed from '../icons/go-to-rally-point-red.png'
import Button from '@mui/material/Button';

// TurfJS
import * as turf from '@turf/turf';

let prec = 2

let commandList = [
    {
        enumString: 'ACTIVATE',
        description: 'Activate Bot',
        statesAvailable: [
            /^.+__IDLE$/
        ]
    },
    {
        enumString: 'NEXT_TASK',
        description: 'Next Task',
        statesAvailable: [
            /^IN_MISSION__.+$/
        ]
    },
    {
        enumString: 'RETURN_TO_HOME',
        description: 'Return to Home',
        statesAvailable: [
            /^IN_MISSION__.+$/
        ]
    },
    {
        enumString: 'STOP',
        description: 'Stop',
        statesAvailable: [
            /^IN_MISSION__.+$/
        ]
    },
    {
        enumString: 'RECOVERED',
        description: 'Recover Bot',
        statesAvailable: [
            /^IN_MISSION__.+$/
        ]
    },
    {
        enumString: 'SHUTDOWN',
        description: 'Shutdown Bot',
        statesAvailable: [
            /^POST_DEPLOYMENT__IDLE$/,
            /^PRE_DEPLOYMENT__.+$/
        ]
    },
    {
        enumString: 'RESTART_ALL_SERVICES',
        description: 'Restart Services'
    },
    {
        enumString: 'REBOOT_COMPUTER',
        description: 'Reboot Bot'
    },
    {
        enumString: 'SHUTDOWN_COMPUTER',
        description: 'Force Shutdown'
    }
]

function getAvailableCommands(missionState) {
    return commandList.filter((command) => {
        let statesAvailable = command.statesAvailable
        if (statesAvailable == null) {
            return true
        }

        for (let stateAvailable of statesAvailable) {
            if (stateAvailable.test(missionState)) return true;
        }

        return false;
    })
}

function issueCommand(api, botId, command) {
    if (confirm("Are you sure you'd like to " + command.description + " (" + command.enumString + ")?")) {
        let c = {
            botId: botId,
            type: command.enumString
        }

        console.log(c)
        api.postCommand(c)
    }
}

function getCommandSelectElement(api, bot) {
    let availableCommands = getAvailableCommands(bot.missionState)

    return (
        <select onChange={(evt) => { 
            issueCommand(api, bot.botId, availableCommands[evt.target.value])
            evt.target.selectedIndex = -1
        }} value={-1}>

            <option value="-1" key="-1">...</option>

            {
                availableCommands.map((command, index) => {
                    return <option value={index} key={index}>{command.description}</option>
                })            
            }

        </select>
    )
}

// Get the table row for the health of the vehicle
function healthRow(bot, allInfo) {
    let healthClassName = {
        "HEALTH__OK": "healthOK",
        "HEALTH__DEGRADED": "healthDegraded",
        "HEALTH__FAILED": "healthFailed"
    }[bot.healthState] ?? "healthOK"

    let healthStateElement = <div className={healthClassName}>{bot.healthState}</div>

    let errors = bot.error ?? []
    let errorElements = errors.map((error) => {
        return <div key={error} className='healthFailed'>{error}</div>
    })
    
    let warnings = bot.warning ?? []
    let warningElements = warnings.map((warning) => {
        return <div key={warning} className='healthDegraded'>{warning}</div>
    })

    if(allInfo)
    {
        return (
            <tr>
                <td>Health</td>
                <td>
                    {healthStateElement}
                    {errorElements}
                    {warningElements}
                </td>
            </tr>
        )
    }
    else
    {
        return (
            <tr>
                <td>Health</td>
                <td>
                    {healthStateElement}
                </td>
            </tr>
        )
    }

}

export function BotDetailsComponent(bot, hub, api, closeWindow) {
    if (bot == null) {
        return (<div></div>)
    }

    let statusAge = Math.max(0.0, bot.portalStatusAge / 1e6).toFixed(0)

    let statusAgeClassName = ''
    if (statusAge > 30) {
        statusAgeClassName = 'healthFailed'
    }
    else if (statusAge > 10) {
        statusAgeClassName = 'healthDegraded'
    }

    // Active Goal
    let activeGoal = bot.activeGoal ?? "N/A"
    let distToGoal = bot.distanceToActiveGoal ?? "N/A"

    if(activeGoal != "N/A"
        && distToGoal == "N/A")
    {
        distToGoal = "Distance To Goal > 1000"
    } 
    else if(activeGoal != "N/A"
            && distToGoal != "N/A")
    {
        distToGoal = distToGoal + " m"
    }
    else if(activeGoal == "N/A"
            && distToGoal != "N/A")
    {
        activeGoal = "Recovery"
        distToGoal = distToGoal + " m"
    }

    // Distance from hub
    let distToHub = "N/A"
    if (bot?.location != null
        && hub?.location != null)
    {
        let botloc = turf.point([bot.location.lon, bot.location.lat]); 
        let hubloc = turf.point([hub.location.lon, hub.location.lat]);
        var options = {units: 'meters'};

        distToHub = turf.rhumbDistance(botloc, hubloc, options).toFixed(prec);
    }

    let vccVoltageClassName = ''
    if(bot.vccVoltage <= 18 &&
        bot.vccVoltage > 16) 
    {
        vccVoltageClassName = 'healthDegraded';
    } 
    else if(bot.vccVoltage < 16)
    {
        vccVoltageClassName = 'healthFailed';
    }

    return (
        <div id='botDetailsBox'>
            <div id="botDetailsComponent">
                <div className='HorizontalFlexbox'>
                    <h2 className="name">{`Bot ${bot?.botId}`}</h2>
                    <div onClick={closeWindow} className="closeButton">⨯</div>
                </div>
                <Accordion defaultExpanded className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Quick Look</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr className={statusAgeClassName}>
                                    <td>Status Age</td>
                                    <td>{statusAge} s</td>
                                </tr>
                                {healthRow(bot, false)}
                                <tr>
                                    <td>Distance from Hub</td>
                                    <td>{distToHub} m</td>
                                </tr>
                                <tr>
                                    <td>Mission State</td>
                                    <td style={{whiteSpace: "pre-line"}}>{bot.missionState?.replaceAll('__', '\n')}</td>
                                </tr>
                                <tr>
                                    <td>Active Goal</td>
                                    <td style={{whiteSpace: "pre-line"}}>{activeGoal}</td>
                                </tr>
                                <tr>
                                    <td>Distance to Goal</td>
                                    <td style={{whiteSpace: "pre-line"}}>{(distToGoal)}</td>
                                </tr>
                                <tr className={vccVoltageClassName}>
                                    <td>Vcc Voltage</td>
                                    <td>{bot.vccVoltage?.toFixed(prec)} V</td>
                                </tr>
                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Commands</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Button type="button" style={{"backgroundColor":"#cc0505"}}>
                            <Icon path={mdiStop} title="Stop Mission"/>
                        </Button>

                        <Button id="missionStartStop" type="button">
                            <Icon path={mdiPlay} title="Run Mission"/>
                        </Button>

                        <Button id="all-next-task" type="button">
                            <Icon path={mdiSkipNext} title="Next Task"/>
                        </Button>

                        <Button id="missionPause" type="button">
                            <Icon path={mdiPause} title="Pause Mission"/>
                        </Button>

                        <Button id="system-check-all-bots" type="button">
                            <Icon path={mdiCheckboxMarkedCirclePlusOutline} title="System Check"/>
                        </Button>

                        <Button type="button">
                            <img src={rcMode} alt="Activate RC Mode"></img>
                        </Button>

                        <Button id="goToRallyGreen" type="button">
                            <img src={goToRallyGreen} alt="Go To Rally Green"></img>
                        </Button>

                        <Button id="goHome" type="button">
                            <img src={goToRallyRed} alt="Go To Rally Red"></img>
                        </Button>

                        <Button id="missionRecover" type="button">
                            <Icon path={mdiDownload} title="Recover"/>
                        </Button>
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Health Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                {healthRow(bot, true)}
                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>GPS</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Latitude</td>
                                    <td>{formatLatitude(bot.location?.lat)}</td>
                                </tr>
                                <tr>
                                    <td>Longitude</td>
                                    <td>{formatLongitude(bot.location?.lon)}</td>
                                </tr>
                                <tr>
                                    <td>HDOP</td>
                                    <td>{bot.hdop?.toFixed(prec)}</td>
                                </tr>
                                <tr>
                                    <td>PDOP</td>
                                    <td>{bot.pdop?.toFixed(prec)}</td>
                                </tr>
                                <tr>
                                    <td>Ground Speed</td>
                                    <td>{bot.speed?.overGround?.toFixed(prec)} m/s</td>
                                </tr>
                                <tr>
                                    <td>Course Over Ground</td>
                                    <td>{bot.attitude?.courseOverGround?.toFixed(prec)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>IMU</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Heading</td>
                                    <td>{formatAttitudeAngle(bot.attitude?.heading)}</td>
                                </tr>
                                <tr>
                                    <td>Pitch</td>
                                    <td>{formatAttitudeAngle(bot.attitude?.pitch)}</td>
                                </tr>
                                {/* <tr>
                                    <td>Roll</td>
                                    <td>{formatAttitudeAngle(bot.attitude?.roll)}</td>
                                </tr> */}
                                <tr>
                                    <td>Sys_Cal</td>
                                    <td>{bot.calibrationStatus?.sys.toFixed(0)}</td>
                                </tr>
                                <tr>
                                    <td>Gyro_Cal</td>
                                    <td>{bot.calibrationStatus?.gyro.toFixed(0)}</td>
                                </tr>
                                <tr>
                                    <td>Accel_Cal</td>
                                    <td>{bot.calibrationStatus?.accel.toFixed(0)}</td>
                                </tr>
                                <tr>
                                    <td>Mag_Cal</td>
                                    <td>{bot.calibrationStatus?.mag.toFixed(0)}</td>
                                </tr>
                            </tbody>
                        </table>              
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Sensor Data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Temperature</td>
                                    <td>{bot.temperature?.toFixed(prec)} °C</td>
                                </tr>
                                <tr>
                                    <td>Depth</td>
                                    <td>{bot.depth?.toFixed(prec)} m</td>
                                </tr>
                                <tr>
                                    <td>Salinity</td>
                                    <td>{bot.salinity?.toFixed(prec)} PSU(ppt)</td>
                                </tr>
                            </tbody>
                        </table>   
                    </AccordionDetails>
                </Accordion>
                <Accordion className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Power</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr className={vccVoltageClassName}>
                                    <td>Vcc Voltage</td>
                                    <td>{bot.vccVoltage?.toFixed(prec)} V</td>
                                </tr>
                                <tr>
                                    <td>Vcc Current</td>
                                    <td>{bot.vccCurrent?.toFixed(prec)} A</td>
                                </tr>
                                <tr>
                                    <td>5v Current</td>
                                    <td>{bot.vvCurrent?.toFixed(prec)} A</td>
                                </tr>
                            </tbody>
                        </table>   
                    </AccordionDetails>
                </Accordion>  
            </div>
        </div>
    )
}

export function HubDetailsComponent(hub, api, closeWindow) {
    if (hub == null) {
        return (<div></div>)
    }

    let statusAge = Math.max(0.0, hub.portalStatusAge / 1e6).toFixed(0)

    var statusAgeClassName = ''
    if (statusAge > 30) {
        statusAgeClassName = 'healthFailed'
    }
    else if (statusAge > 10) {
        statusAgeClassName = 'healthDegraded'
    }

    return (
        <div id='botDetailsBox'>
            <div id="botDetailsComponent">
                <div className='HorizontalFlexbox'>
                    <h2 className="name">{`Hub ${hub?.hubId}`}</h2>
                    <div onClick={closeWindow} className="closeButton">⨯</div>
                </div>

                <Accordion defaultExpanded className="accordion">
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                        <Typography>Quick Look</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Command</td>
                                    <td>
                                        { getCommandSelectElement(api, hub) }
                                    </td>
                                </tr>
                                {healthRow(hub)}
                                <tr>
                                    <td>Latitude</td>
                                    <td>{formatLatitude(hub.location?.lat)}</td>
                                </tr>
                                <tr>
                                    <td>Longitude</td>
                                    <td>{formatLongitude(hub.location?.lon)}</td>
                                </tr>
                                <tr className={statusAgeClassName}>
                                    <td>Status Age</td>
                                    <td>{statusAge} s</td>
                                </tr>

                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    )
}
