import { LogTaskPacket } from "./shared/LogMessages"

export interface JDVTaskPacket {
    logFilename: string
    taskPacket: LogTaskPacket
}

