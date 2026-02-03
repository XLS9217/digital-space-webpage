/**
 * Use Guide:
 *
 * 1. Wrap your scene with DigitalSpaceControl at the top level:
 *    <DigitalSpaceControl defaultStyle={ControlStyle.ORBIT}>
 *      <YourScene />
 *    </DigitalSpaceControl>
 *
 * 2. In any child component, use the hook to control the camera:
 *    const { controlStyle, toggleControl, setOrbitControl, setFirstPersonControl } = useDigitalSpaceControl()
 *
 * 3. Available control styles:
 *    - ControlStyle.ORBIT: Orbit camera control (default)
 *    - ControlStyle.FIRST_PERSON: First-person pointer lock control
 *
 * 4. Hook returns:
 *    - controlStyle: current control style
 *    - setControlStyle(style): set specific control style
 *    - toggleControl(): toggle between orbit and first-person
 *    - setOrbitControl(): switch to orbit control
 *    - setFirstPersonControl(): switch to first-person control
 *    - isOrbit: boolean, true if current style is orbit
 *    - isFirstPerson: boolean, true if current style is first-person
 */

import { useState, createContext, useContext } from 'react'
import { OrbitControls, PointerLockControls } from '@react-three/drei'

export const ControlStyle = {
    ORBIT: 'orbit',
    FIRST_PERSON: 'first-person',
    EDITOR: 'editor'
}

const ControlContext = createContext()

export function useDigitalSpaceControl() {
    const context = useContext(ControlContext)
    if (!context) {
        throw new Error('useDigitalSpaceControl must be used within a DigitalSpaceControl')
    }
    return context
}

export default function DigitalSpaceControl({ defaultStyle = ControlStyle.ORBIT, children }) {
    const [controlStyle, setControlStyle] = useState(defaultStyle)

    const toggleControl = () => {
        setControlStyle(prev => 
            prev === ControlStyle.ORBIT ? ControlStyle.FIRST_PERSON : ControlStyle.ORBIT
        )
    }

    const setOrbitControl = () => setControlStyle(ControlStyle.ORBIT)
    const setFirstPersonControl = () => setControlStyle(ControlStyle.FIRST_PERSON)

    const contextValue = {
        controlStyle,
        setControlStyle,
        toggleControl,
        setOrbitControl,
        setFirstPersonControl,
        isOrbit: controlStyle === ControlStyle.ORBIT,
        isFirstPerson: controlStyle === ControlStyle.FIRST_PERSON
    }

    return (
        <ControlContext.Provider value={contextValue}>
            {controlStyle === ControlStyle.ORBIT ? (
                <OrbitControls />
            ) : (
                <PointerLockControls />
            )}
            {children}
        </ControlContext.Provider>
    )
}