# Digital Space Toolkit

A React Three Fiber toolkit for building interactive 3D scenes with debug controls.

## Architecture

### Core Systems

**EventHub** - Pub/sub event system for component communication
- `CONTROL_CHANNELS` - Scene object manipulation (position, rotation, visibility)
- `INFO_CHANNELS` - State broadcasts (camera info, scene state changes)
- `DEBUG_CHANNELS` - Debug features (performance monitoring)

**Registry** - UUID-based object lookup
- `SceneObjectRegistry` - Maps Three.js objects to metadata
- `TagRegistry` - Maps tag prefixes to React components

**Store** - Shared state storage
- `InfoStoreHub` - Stores camera control data

**Controllers** - Scene behavior logic
- `SceneController` - Manages scene states (big-view, level-view)
- `LevelsController` - Handles layer investigation and visibility

### Structure

```
DigitalSpace (Canvas wrapper)
├── DigitalSpaceControl (Camera controls)
├── DigitalScene (Scene loader)
│   ├── SceneModels (Model renderer)
│   └── SceneLights (Light renderer)
├── ControlTunnel (Event → Three.js bridge)
├── DebugScene (Helpers, gizmos)
└── DebugPanel (UI controls)
```

### Backend Gateways

**DataRegistry** - Scene data CRUD
- `getScene()`, `upsert()`, `download()`

**WebRegistry** - File URL resolution
- `getFileUrl()` - Converts file paths to URLs

## Model Types

**Base Model** - Standard 3D model
**Frame Model** - Model with interactive Html tags, visibility controlled by layer investigation
