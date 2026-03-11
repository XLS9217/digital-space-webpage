# Dev Notes

## Naming: localName vs model.name
- `localName` in ModelItem/LightItem is UI-only (editable display name)
- `model.name` / `light.name` (from props) is the original name used for Three.js object lookup
- Event channel publishes use the prop name, not localName
- `scene.getObjectByName()` finds objects by original name — renaming in panel is cosmetic only

## In Progress
- ModelList: `NewModelItem` appearance done (name + file validation, EnumSelect for type)
- Next: wire up actual add/delete logic for models (same pattern as LightList with localModels + MODEL_LIST_UPDATE channel)