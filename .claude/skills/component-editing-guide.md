# Component Editing Guide

## 1. Cross-Component Communication

### EventChannelHub
**Location:** `packages/digital-space-toolkit/EventChannelHub.js`

**Use for:** Cross-component messaging (3D ↔ UI, debug panel ↔ scene)

**Channels:**
- `CONTROL_CHANNELS` - UI controls → 3D objects
- `DEBUG_SCENE_CHANNELS` - 3D → UI feedback
- `INFO_CHANNELS` - State info
- `DEBUG_CHANNELS` - Debug data

**Pattern:**
```javascript
eventChannelHub.publish(CHANNEL_NAME, { uuid, property, value });
eventChannelHub.subscribe(CHANNEL_NAME, handler);
```

### SceneObjectRegistry
**Location:** `packages/digital-space-toolkit/DigitalScene/SceneObjectRegistry.js`

**Use for:** Looking up Three.js objects by UUID or name

**Methods:**
```javascript
sceneObjectRegistry.getThreeObject(uuid);
sceneObjectRegistry.findByName(name);
```

## 2. DebugPanel Components

**Location:** `packages/digital-space-toolkit/DebugPanel/CommonComponent/`

**ALWAYS use these components when building DebugPanel UI:**

- `DebugBlock` - Container with title, expand/collapse, delete
- `BarHandle` - Slider with label and value display
- `CoordDisplayer` - X/Y/Z coordinate inputs
- `TextInputBox` - Single text input with copy button
- `ColorPicker` - Color selection
- `CheckBox` - Boolean toggle
- `EnumSelect` - Dropdown selection
- `MinMaxHandle` - Min/max range slider

**Pattern for nested sections:**
```jsx
<DebugBlock title="Main" initialExpanded={true}>
    <BarHandle label="Intensity" value={1} />
    <DebugBlock title="Advanced" initialExpanded={false} isNested={true}>
        <TextInputBox label="shadowCameraFar" value="200" editable={false} />
    </DebugBlock>
</DebugBlock>
```

## 3. Type Structure & Serialization

**Light Interface:**
```typescript
{
    name: string;
    type: string;
    color?: string;
    intensity: number;
    advanced?: Record<string, any>;
}
```

Basic: name, type, color, intensity  
Advanced: position, target, shadow settings (in `advanced` object)

### When to Consider Serialization

**Serialization** = Converting UI state ↔ Data structure for saving/loading

**Always handle serialization when:**

1. **Data structure changes** - Old data (flat) vs new data (nested `advanced`)
   - Support both when loading: check `light.advanced?.position` then fallback to `light.position`
   - Save with new structure: put position/target in `advanced` object

2. **Saving to backend** - `onItemSerialized` callback in DebugPanel lists
   - Convert UI state to backend type structure
   - Example: LightList converts `localData` → Light interface

3. **Loading from backend** - Parse incoming data to UI state
   - Handle missing fields with defaults
   - Sanitize vectors: `{ x, y, z }` or `[x, y, z]` → `{ x, y, z }`

4. **Backward compatibility** - Support old data after type changes
   - Check new structure first, fallback to old
   - Migrate on save (read old, write new)

**Pattern:**
```javascript
// Loading (support both old and new)
const position = light.advanced?.position || light.position || defaultPosition;

// Saving (use new structure)
const serialized = {
    name, type, color, intensity,
    advanced: { position, target, ...shadowSettings }
};
```