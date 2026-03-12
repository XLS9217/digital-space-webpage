export const CONTROL_TYPE = {
    ORBIT: "orbit",
    FIRST_PERSON: "first-person",
}

export const LIGHT_TYPE = {
    AMBIENT: "AmbientLight",
    DIRECTIONAL: "DirectionalLight"
}

export const MODEL_TYPE = {
    BASE: "base",
    FRAME: "frame",
}

export const GROUP_TYPE = {
    /**
     * For level display
     * under the level there will be number based sub-groups, sub-group type is level-floor in str
     * GROUP_TYPE.LEVEL and GROUP_TYPE.LEVEL.FLOOR both works
     */
    LEVEL: Object.assign("levels", {
        FLOOR: "levels-floor",
    })
}
