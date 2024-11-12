import { MissionTask, TaskType } from "../../jcc/client/components/shared/JAIAProtobuf";
//Helper function to verify the task created by the Panel is valid
export function validateTask(task?: MissionTask): void {
    if (!task) {
        return;
    }
    switch (task?.type) {
        case TaskType.CONSTANT_HEADING:
            //make sure all the parameters are defined
            expect(task.constant_heading.constant_heading).toBeDefined();
            expect(task.constant_heading.constant_heading_speed).toBeDefined();
            expect(task.constant_heading.constant_heading_time).toBeDefined();
            //none of these should be present
            expect(task.dive).toBeUndefined();
            expect(task.station_keep).toBeUndefined();
            expect(task.surface_drift).toBeUndefined();
            break;
        case TaskType.DIVE:
            if (task.dive.bottom_dive) {
                //Bottom Dive = true, expect no other parameters
                expect(task.dive.max_depth).toBeUndefined();
                expect(task.dive.depth_interval).toBeUndefined();
                expect(task.dive.hold_time).toBeUndefined();
            } else {
                //Non Bottom Dive should have other parameters
                expect(task.dive.max_depth).toBeDefined();
                expect(task.dive.depth_interval).toBeDefined();
                expect(task.dive.hold_time).toBeDefined();
            }
            expect(task.surface_drift).toBeDefined();
            //none of these should be present
            expect(task.station_keep).toBeUndefined();
            expect(task.constant_heading).toBeUndefined();
            break;
        case TaskType.SURFACE_DRIFT:
            expect(task.surface_drift).toBeDefined();
            //none of these should be present
            expect(task.dive).toBeUndefined();
            expect(task.station_keep).toBeUndefined();
            expect(task.constant_heading).toBeUndefined();
            break;
        case TaskType.STATION_KEEP:
            expect(task.station_keep).toBeDefined();
            expect(task.dive).toBeUndefined();
            expect(task.surface_drift).toBeUndefined();
            expect(task.constant_heading).toBeUndefined();
            break;
    }
}
