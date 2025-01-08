import { GeographicCoordinate } from "../../utils/protobuf-types";
import Task from "../tasks/task";

export default class Waypoint {
    private position: GeographicCoordinate;
    private task: Task;
    private canMove: boolean;

    constructor() {}

    getPosition() {
        return this.position;
    }

    setPosition(position: GeographicCoordinate) {
        this.position = position;
    }

    getTask() {
        return this.task;
    }

    setTask(task: Task) {
        this.task = task;
    }

    getCanMove() {
        return this.canMove;
    }

    setCanMove(canMove: boolean) {
        this.canMove = canMove;
    }
}
