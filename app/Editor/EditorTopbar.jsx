import EditorTextbox from './CommonComponent/EditorTextbox'
import EditorButton from './CommonComponent/EditorButton'

export default function EditorTopbar({ sceneNameInput, onSceneNameChange, onGo, onNew }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onGo()
    }
  }

  return (
    <div className="editor-topbar">
      <div className="editor-topbar__title">Digital Space</div>
      <div className="editor-topbar__controls">
        <EditorTextbox
          value={sceneNameInput}
          onChange={onSceneNameChange}
          onKeyDown={handleKeyDown}
          placeholder="Scene name"
        />
        <EditorButton onClick={onGo}>GO</EditorButton>
        <EditorButton onClick={onNew}>NEW</EditorButton>
      </div>
    </div>
  )
}