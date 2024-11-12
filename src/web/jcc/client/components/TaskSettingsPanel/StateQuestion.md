
It seems a lot of the trouble I've had testing the `MUI Select` component used to select the `Task` in `TaskSettingsPanel` is due to the way it is implemented, not just our environment.  (I think Twomey suggested this and tried to explain it to me months ago, but it didn't fully register, sorry.)

The `TaskSettingsPanel` does not set the value of the Select component when a user (or `jest`) selects a task type from the component.  It does not use `useState` to manage anything related to `MissionTask` s

It is always set to whatever is passed in by the `Props`.

Here is how it is defined (I changed it to native mode to make testing simpler)

```
       <FormControl sx={{ minWidth: 120 }} size="small" disabled={!props?.isEditMode}>
            <Select
                native={true}
                labelId="task-select-label"
                data-testid="task-select-id"
                onChange={(evt) => onChangeTaskType(evt)}
                value={props.task?.type ?? "NONE"}
                inputProps={{ "data-testid": "task-select-input-id" }}
            >
                <option value={"NONE"}>None</option>
                <option value={"DIVE"}>Dive</option>
                <option value={"SURFACE_DRIFT"}>Surface Drift</option>
                <option value={"STATION_KEEP"}>Station Keep</option>
                <option value={"CONSTANT_HEADING"}>Constant Heading</option>
            </Select>
        </FormControl>
```

The `onChangeTaskType` function creates the new task with all of it's parameters based on the new `TaskType` selected and pulls the parameters out of `GlobalSettings`.  Then it passes it up the onChange method passed in via Props.  `TaskSettingsPanel` is used in several other panels but in all cases the change of any task parameters is passed up through callbacks all the way to `CommandControl` where it is handled by `setRunList`.

```
    setRunList(runList: MissionInterface) {
        const updatedRunList = { ...runList };
        this.setState({
            runList: updatedRunList,
            runListVersion: this.state.runListVersion + 1,
        });
    }

```
My understanding (correct me if wrong) is when `CommandControl` updates it's state using `setRunList` it triggers a re-render of all of it's children.  Eventually that will cascade through the tree and eventually cause a re-render of `TaskSettingsPanel`, which will recieve the new `MissionTask` in it's props and when it re-renders the Select Component that is when the value of the component is updated.

The problem for testing is we are using `TaskSettingsPanel` by itself and without anyting above it to manage state the value of the Select Component is never changed.

I can create a mock onChange in the test code file function that maintains the Task with `useState` and pass that in as part of the props to the `TaskSettingsPanel`.  However, I am not 100% sure what else has to be done to make everything work in `jest` .  The props passed in to `TaskSettingsPanel` for the subsequent re-render needs the updated task included or the Select component will keep the value it had in the initial rendering.  

Looking through the code it seems most of the states of the components used is either managed locally via a useState command in the panel or it is based on some prop managed by CommandControl and passed al the way up and down the tree.  I couldn't find an example that used some combination of those techniques.

This issue pertains to most of the settings controlled in the TaskSettingsPanel and TaskOptionsPanel.  Testing any of the widgets other than the toggle to enable selectOnMap will run in to the same problems.

I presume there are many reasons why all the Task related data is managed by CommandControl.  I suspect that if the TaskSettingsPanel managed the state of it's components locally, and not based on the task passed in through Props, things would break when the user changed waypoints or bots or other things in other panels that changed the current task.

Since I didn't fully grasp this complexity until recently I wanted to at least touch base with others before going down any rabbit holes to change how the state of things is managed on the application side. 

In the meantime, I'll play around with the test code to see how managing the state of `MissionTask` in a mock onChange function and see if I can get the value of the Select Component to change.