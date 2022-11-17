import { mdiArrowLeft } from "@mdi/js"
import React from "react"
import { LogApi } from "./LogApi"
import Icon from "@mdi/react"

// Dropdown menu showing all of the available logs to choose from
export default class PathSelector extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            logs: props.logs,
            chosen_path: '',
            next_path_segments: [],
        }
    }

    componentDidMount() {
        this.update_path_options()
    }

    render() {
      return (
      <div className="centered dialog vertical flexbox">
        <div className="dialogHeader">Add Series</div>
        <div className="section">
            <div className="horizontal flexbox">
                <button className="padded button" title="Back" onClick={this.backClicked.bind(this)}>
                    <Icon path={mdiArrowLeft} size={1} style={{verticalAlign: "middle"}}></Icon>
                </button>
                <div className="path padded">
                    {this.state.chosen_path}
                </div>
            </div>
        </div>

        <div className="section">
            <div className="list">
                { this.nextPathSegmentRows() }
            </div>
        </div>

        <div className="buttonSection section">
            <button className="padded" onClick={this.cancelClicked.bind(this)}>Cancel</button>
            <button className="padded" onClick={this.selectClicked.bind(this)}>Select</button>
        </div>
      </div>
      )
    }

    cancelClicked(evt) {
        this.props.didCancel?.()
    }

    selectClicked(evt) {

    }

    update_path_options() {
        // Clear options
        this.setState({next_path_segments: []})

        if (this.state.logs == null || this.state.logs.length == 0) {
            return
        }

        // Get new options
        LogApi.get_paths(this.state.logs, this.state.chosen_path).then(paths => {

            // This path is a dataset, with no children.  So, get and plot it
            if (paths.length == 0) {
                if (this.state.chosen_path == '') {
                    console.error('No paths returned!')
                    return
                }

                console.log('Selected path = ', this.state.chosen_path)

                // Callback
                this.props.didSelectPath?.(this.state.chosen_path)

                // Reset the selector
                this.setState({chosen_path: ''}, this.update_path_options.bind(this))

                return
            }

            // Only one option, so select it and go to the nexxt level
            if (paths.length == 1) {
                let chosen_path = this.state.chosen_path + '/' + paths[0]
                this.setState({chosen_path}, this.update_path_options.bind(this))
                return
            }

            // More than one option
            this.setState({next_path_segments: paths})
        })
    }

    didSelectPathSegmentRow(nextPathSegment) {
        let chosen_path = this.state.chosen_path + '/' + nextPathSegment
        this.setState({chosen_path: chosen_path}, this.update_path_options.bind(this))
    }

    nextPathSegmentRows() {
        return this.state.next_path_segments.map((nextPathSegment) => {
            var className = "padded listItem"
            return <div className={className} onClick={this.didSelectPathSegmentRow.bind(this, nextPathSegment)}>{nextPathSegment}</div>
        })
    }

    backClicked() {
        var {chosen_path} = this.state

        const location = chosen_path.lastIndexOf('/')

        if (location != -1) {
            chosen_path = chosen_path.substring(0, location)
        }

        this.setState({chosen_path}, this.update_path_options.bind(this))
    }

}
