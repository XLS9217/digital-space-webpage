export default function EditorTextbox({ value, onChange, onKeyDown, placeholder }) {
  const handleChange = (event) => {
    onChange(event.target.value)
  }

  return (
    <input
      className="editor-textbox"
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
    />
  )
}