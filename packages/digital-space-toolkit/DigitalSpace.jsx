/**
 * Use Guide:
 *
 * Wrap your 3D content with DigitalSpace to enable camera controls:
 *
 * <DigitalSpace defaultControlStyle={ControlStyle.ORBIT} debug={true}>
 *   <YourCustomComponents />
 *   <mesh>...</mesh>
 * </DigitalSpace>
 *
 * Then use useDigitalSpaceControl() hook in any child component to control the camera.
 */

import React from 'react'//for webpack consistency,
import { Canvas } from "@react-three/fiber";
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import DigitalSpaceControl from "./DigitalSpaceControl";
import DebugPanel from "./DebugPanel/DebugPanel";
import ControlTunnel from "./DebugPanel/ControlTunnel.jsx";
import DebugScene from "./DebugScene/DebugScene.jsx";

export default function DigitalSpace({
    defaultControlStyle,
    debug = false,
    debugDockConfig = null,
    children
}) {
    return (
        <>
            <Canvas
                shadows
                onCreated={({ gl }) => {
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.VSMShadowMap;
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <DigitalSpaceControl controlType={defaultControlStyle} />
                <axesHelper args={[10]} />
                {children}
                <ControlTunnel/>
                {debug && <DebugScene/>}
            </Canvas>

            {/*Outside because it's normal html, and there is a fucking namespace thing*/}
            {debug && <DebugPanel dockConfig={debugDockConfig}/>}
        </>
    )
}