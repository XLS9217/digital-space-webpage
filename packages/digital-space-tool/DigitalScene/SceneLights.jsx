export default function SceneLights({ lights = [] }) {
    if (!lights || lights.length === 0) {
        console.warn("No lights in scene, adding ambient light")
        return (
            <>
                <ambientLight intensity={0.5} />
            </>
        )
    }

    return (
        <>
            {lights.map((light, index) => {
                const position = light.position 
                    ? [light.position.x, light.position.y, light.position.z] 
                    : undefined;

                switch (light.type) {
                    case 'AmbientLight':
                        return <ambientLight key={index} intensity={light.intensity} color={light.color} />;
                    case 'DirectionalLight':
                        return (
                            <directionalLight
                                key={index}
                                position={position}
                                intensity={light.intensity}
                                color={light.color}
                                castShadow
                            />
                        );
                    case 'PointLight':
                        return (
                            <pointLight
                                key={index}
                                position={position}
                                intensity={light.intensity}
                                color={light.color}
                                castShadow
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    )
}