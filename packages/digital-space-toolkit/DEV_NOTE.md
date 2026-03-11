# Dev Notes

## Naming: localName vs model.name
- `localName` in ModelItem/LightItem is UI-only (editable display name)
- `model.name` / `light.name` (from props) is the original name used for Three.js object lookup
- Event channel publishes use the prop name, not localName
- `scene.getObjectByName()` finds objects by original name — renaming in panel is cosmetic only

## Add Model Flow: Upsert + SCENE_RELOAD
- Adding a model upserts to backend then publishes `SCENE_RELOAD` (not local state update)
- `DigitalScene` subscribes to `SCENE_RELOAD`, re-fetches from backend, re-publishes `INTERNAL_DEBUG_SCENE`
- `DebugPanel` receives fresh scene data — no need to manually sync ModelList

## Delete Model Flow: Local State + MODEL_LIST_UPDATE
- ModelList now uses local state (`localData`) just like LightList
- Deleting a model removes it from `localData` and publishes `MODEL_LIST_UPDATE` with `action: 'remove'`
- `DigitalScene` subscribes to `MODEL_LIST_UPDATE` and removes the model from its own `localModels`
- No backend round-trip needed — just unload locally (same pattern as light delete)

## In Progress
- ModelList: add model works via upsert + reload
- ModelList: delete model works via local state + `MODEL_LIST_UPDATE` channel