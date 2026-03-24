export default function EditorTopbar({ onTitleClick }) {
  return (
    <div className="editor-topbar">
      <button
        type="button"
        className="editor-topbar__title"
        onClick={onTitleClick}
      >
        Digital Space
      </button>
    </div>
  )
}