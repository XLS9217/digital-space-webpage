export default function EditorButton({ children, onClick }) {
  return (
    <button className="editor-button" type="button" onClick={onClick}>
      {children}
    </button>
  )
}