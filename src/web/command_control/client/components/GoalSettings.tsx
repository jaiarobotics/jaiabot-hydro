import React from 'react'
import { Goal } from './shared/JAIAProtobuf';
import { deepcopy } from './shared/Utilities'
import { TaskSettingsPanel } from './TaskSettingsPanel';
import { Map } from 'ol';
import '../style/components/GoalSettingsPanel.css'

interface Props {
    key: string // When this changes, React will create a new component
    botId: number
    goalIndex: number
    goal: Goal
    onClose: () => void
    onChange: () => void
    map: Map
}


export class GoalSettingsPanel extends React.Component {
    props: Props
    oldGoal: Goal

    constructor(props: Props) {
        super(props)
        this.oldGoal = deepcopy(props.goal)
    }

    render() {
        const { botId, goalIndex, goal } = this.props

        return (
            <div className="goal-settings-panel-outer-container">
                <div className="goal-settings-panel-container">
                    <div className="goal-settings-label">Goal:</div>
                    <div className="goal-settings-input">{goalIndex}</div>
                    <div className="goal-settings-line-break"></div>
                    <div className="goal-settings-label">Bot:</div>
                    <div className="goal-settings-input">{botId}</div>
                    <div className="goal-settings-line-break"></div>
                    <div className="goal-settings-label task-label">Task:</div>
                    <TaskSettingsPanel 
                        task={goal.task}
                        map={this.props.map}
                        location={goal.location}
                        onChange={task => {
                            goal.task = task
                            this.props.onChange?.()
                        }}
                    />
                    <div className="goal-settings-line-break"></div>
                    <div className="goal-settings-button-container">
                        <button className="goal-settings-btn" onClick={this.cancelClicked.bind(this)}>Cancel</button>
                        <button className="goal-settings-btn" onClick={this.doneClicked.bind(this)}>Done</button>
                    </div>
                </div>
            </div>
        )
    }

    doneClicked() {
        this.props.onClose?.()
    }

    cancelClicked() {
        var { goal } = this.props

        // Clear this goal
        Object.keys(goal).forEach((key: keyof Goal) => {
            delete goal[key]
        })

        // Copy items from our backup copy of the goal
        Object.assign(goal, this.oldGoal)

        this.props.onChange?.()

        this.props.onClose?.()
    }
}
