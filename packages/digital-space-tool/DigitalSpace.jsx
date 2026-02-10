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

import { Canvas } from "@react-three/fiber";
import DigitalSpaceControl from "./DigitalSpaceControl";
import DebugPanel from "./DebugPanel/DebugPanel";
import DebugTunnel from "./DebugPanel/DebugTunnel";

export default function DigitalSpace({
    defaultControlStyle,
    debug = false,
    children
}) {
    return (
        <>
            <Canvas style={{ width: "100vw", height: "100vh" }}>
                <DigitalSpaceControl controlType={defaultControlStyle} />
                <axesHelper args={[5]} />
                {children}
                {debug && <DebugTunnel/>}
            </Canvas>

            {/*Outside because it's normal html, and there is a fucking namespace thing*/}
            {debug && <DebugPanel/>}
        </>

    )
}