/*
* This stays in the Canvas, use the INTERNAL_DEBUG to send things to debug panel
* */

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { eventChannelHub, DEBUG_CHANNELS } from "../EventChannelHub";

export default function DebugTunnel() {
    const { camera } = useThree();

    useFrame(() => {
        const { x, y, z } = camera.position;
        eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_CAMERA, { x, y, z });
    });

    return null;
}