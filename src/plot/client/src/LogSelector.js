import React from "react"

function duration_string_from_seconds(duration_seconds) {
    var components = []

    if (duration_seconds >= 3600) {
        let hours = Math.floor(duration_seconds / 3600)
        components.push(`${hours} hr`)
        duration_seconds -= (hours * 3600)
    }

    if (duration_seconds >= 60) {
        let minutes = Math.floor(duration_seconds / 60)
        components.push(`${minutes} min`)
        duration_seconds -= (minutes * 60)
    }

    if (duration_seconds >= 1) {
        components.push(`${duration_seconds.toFixed(0)} sec`)
    }
    
    return components.join(', ')
}

function date_string_from_microseconds(timestamp_microseconds) {
    return new Date(timestamp_microseconds * 1e3).toLocaleString([], {
        dateStyle : 'medium',
        timeStyle : 'short',
    })
}

// Dropdown menu showing all of the available logs to choose from
export default class LogSelector extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            log_dict: {},
            fleet: null,
            bot: null,
            selectedLogs: new Set()
        }
    }

    render() {
        const self = this;

        const logs = this.getFilteredLogs()

        const logItems = logs.map((log) => {
            const key = `${log.fleet}-${log.bot}-${log.timestamp}`
            const className = (self.state.selectedLogs.has(log)) ? "selected" : ""

            const row = <div key={key} onClick={this.didToggleLog.bind(this, log)} className={className}>
                <div className="fleetCell">
                    {log.fleet}
                </div>
                <div className="botCell">
                    {log.bot}
                </div>
                <div className="timeCell">
                    {date_string_from_microseconds(log.timestamp)}
                </div>
                <div className="durationCell">
                    {duration_string_from_seconds(log.duration / 1e6)}
                </div>
            </div>

            return row
        })

        return (
          <div className="centered dialog">
            <div className="filterSection">
                <div>Filters</div>
                Fleet
                <select name="fleet" id="fleet" className={"padded log"} onChange={this.did_select_fleet.bind(this)}>
                {this.fleet_option_elements()}
                </select>
                Bot
                <select name="bot" id="bot" className={"padded log"} onChange={this.did_select_bot.bind(this)}>
                {this.bot_option_elements()}
                </select>
            </div>

            <div className="logList">{logItems}</div>

            <div className="buttonSection">
                <button className="padded" onClick={self.cancelClicked.bind(self)}>Cancel</button>
                <button className="padded" onClick={self.okClicked.bind(self)}>OK</button>
            </div>
          </div>
        )
    }

    didToggleLog(log) {
        var selectedLogs = this.state.selectedLogs

        if (selectedLogs.has(log)) {
            selectedLogs.delete(log)
            this.setState({selectedLogs})
        }
        else {
            selectedLogs.add(log)
            this.setState({selectedLogs})
        }
    }

    getFilteredLogs() {
        const log_dict = this.state.log_dict

        var log_array = []

        for (const fleet in log_dict) {
            if (this.state.fleet != null && this.state.fleet != fleet) continue;

            const fleet_dict = log_dict[fleet]

            for (const bot in fleet_dict) {
                if (this.state.bot != null && this.state.bot != bot) continue;

                const bot_dict = fleet_dict[bot]

                log_array = log_array.concat(Object.values(bot_dict))
            }
        }

        log_array.sort((a, b) => {
            return b.timestamp - a.timestamp
        })

        return log_array
    }

    static getDerivedStateFromProps(props) {
        let log_dict = LogSelector.log_dict(props.logs)
        var state = {
            log_dict: log_dict
        }

        if (Object.keys(log_dict).length == 1) {
            state.fleet = Object.keys(log_dict)[0]
        }

        return state
    }

    static log_dict(logs) {
        var log_dict = {}

        for (let log of logs) {
            if (!(log.fleet in log_dict)) {
                log_dict[log.fleet] = {}
            }

            if (!(log.bot in log_dict[log.fleet])) {
                log_dict[log.fleet][log.bot] = {}
            }

            if (!(log.timestamp in log_dict[log.fleet][log.bot])) {
                log_dict[log.fleet][log.bot][log.timestamp] = log
            }
        }

        return log_dict
    }

    dict_options(dict) {
        let names = Object.keys(dict)
        names.sort()

        let first_option = <option key={"all"}>All</option>

        var elements = names.map(name => {
            return <option value={name} key={name}>{name}</option>
        })

        elements = [ first_option ].concat(elements)

        return elements
    }

    fleet_option_elements() {
        return this.dict_options(this.state.log_dict)
    }

    did_select_fleet(evt) {
        if (evt.target.selectedIndex == 0) {
            this.setState({fleet: null})
        }
        else {
            this.setState({fleet: evt.target.value})
        }
    }

    bot_option_elements() {
        if (this.state.fleet == null) {
            return null
        }
        else {
            return this.dict_options(this.state.log_dict[this.state.fleet])
        }
    }

    did_select_bot(evt) {
        if (evt.target.selectedIndex == 0) {
            this.setState({bot: null})
        }
        else {
            this.setState({bot: evt.target.value})
        }
    }

    cancelClicked() {
        this.props.didSelectLogs?.(null)
    }

    okClicked() {
        const selectedLogNames = Array.from(this.state.selectedLogs).map((log) => {
            return log.filename;
        })

        this.props.didSelectLogs?.(selectedLogNames)
    }

}

