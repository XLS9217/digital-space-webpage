# Dev Notes

## Naming: localName is the source of truth
- `localName` in ModelItem/LightItem is the live name used for all event publishing
- Renaming via DebugBlock publishes `OBJECT_UPDATE_BY_NAME` with `property: 'name'` to sync the 3D object
- All subsequent events (position, visibility, etc.) use `localName`, not the original prop
- `DebugTunnel` handles the `name` property by finding the object with the old name and setting `object.name = newValue`

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