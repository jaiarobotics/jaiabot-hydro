// Saving and loading settings from browser's localStorage

export class Setting {

    key: string
    defaultValue: any | null

    constructor(key: string, defaultValue: any=null) {
        this.key = key
        this.defaultValue = defaultValue
    }

    set(value: any | null) {
        localStorage.setItem(this.key, JSON.stringify(value))
    }

    get() {
        let valueString = localStorage.getItem(this.key)
        if (!valueString) {
        return this.defaultValue
        }
        else {
        return JSON.parse(valueString)
        }
    }

}

export let Settings = {
    diveMaxDepth: new Setting("dive.max_depth", 10),
    diveDepthInterval: new Setting("dive.depth_interval", 10),
    diveHoldTime: new Setting("dive.hold_time", 1),
    driftTime: new Setting("drift.time", 10),

    mapVisibleLayers: new Setting("map.visibleLayers"),
    mapCenter: new Setting("map.center"),
    mapZoomLevel: new Setting("map.zoomLevel"),
    mapRotation: new Setting("map.rotation"),

    missionPlanSpeeds: new Setting("mission.plan.speeds"),

    savedMissions: new Setting("savedMissionsV1"),
}
