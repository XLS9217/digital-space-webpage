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
                const key = light.name || `light-${index}`;

                switch (light.type) {
                    case 'AmbientLight':
                        return <ambientLight key={key} name={light.name} intensity={light.intensity} color={light.color} />;
                    case 'DirectionalLight':
                        return (
                            <directionalLight
                                key={key}
                                name={light.name}
                                position={position}
                                intensity={light.intensity}
                                color={light.color}
                                castShadow
                            />
                        );
                    case 'PointLight':
                        return (
                            <pointLight
                                key={key}
                                name={light.name}
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