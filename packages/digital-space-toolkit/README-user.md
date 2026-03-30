# User Guide

## Debug Panel

Access the debug panel by enabling `debug={true}` on DigitalSpace.

### General Settings

**Background** - Set scene background color and toggle visibility

**Performance** - Toggle performance monitor with position selector (top-left, top-right, bottom-left, bottom-right)

### Models

**Add Model**
1. Click `+` icon in Model List
2. Enter name and file location
3. Select model type (base or frame)

**Edit Model**
- Position, rotation, scale via coordinate inputs
- Toggle visibility with eye icon
- Click model name to rename

**Frame Models**
- Show Html tags only when layer is investigated
- Tags grouped by prefix (e.g., `PREFIX_tagname`)
- Hover to preview individual tags

### Lights

**Add Light**
1. Click `+` icon in Light List
2. Enter name
3. Select type (AmbientLight or DirectionalLight)

**Edit Light**
- Position, intensity, color controls
- Toggle helper visualization
- Drag gizmo in scene to reposition

### Level Groups

**Create Level Group**
1. Click `+` icon in Group List
2. Enter group name
3. Type is automatically set to "levels"

**Add Layers**
- Click `+` at top/bottom to add layers
- Layers numbered sequentially
- Drag models into layer tag list

**Investigate Layer**
1. Click "Investigate" on a layer
2. Layers above lift up and hide
3. Target layer becomes visible
4. Frame models in layer show Html tags

**Camera Snapshot**
- Click camera icon to save current view
- Saved view restores when investigating layer

**Lift Target** - Set Y-offset for lifted layers

### State Management

**Big View** - Default state, all layers visible

**Level View** - Active when investigating a layer
- Click "← Back" to return to big view
- Only active layer models visible

### Actions

**Print** - Log object to console

**Download** - Export scene as ZIP file

**Upload** - Save scene configuration to backend
