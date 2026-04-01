import React from 'react'
import './Editor.css'

export default function EditorTag({ name }) {
    const handleClick = () => {
        console.log('Tag clicked:', name)
    }

    return (
        <span className="editor-tag" onClick={handleClick}>
            {name}
        </span>
    )
}