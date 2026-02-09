import { useEffect } from 'react'
import tagRegistry from 'digital-space-tool/TagRegistry.js'
import './Stage.css'

function ClassroomTag({ name }) {
    return (
        <div className="stage-tag stage-tag--classroom">
            {name}
        </div>
    )
}

function MeetingTag({ name }) {
    return (
        <div className="stage-tag stage-tag--meeting">
            {name}
        </div>
    )
}

export default function TagStyleRegister() {
    useEffect(() => {
        tagRegistry
            .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
            .register('MEETING', MeetingTag)

        return () => {
            tagRegistry
                .unregister('CLASSROOM')
                .unregister('MEETING')
        }
    }, [])

    return null
}
