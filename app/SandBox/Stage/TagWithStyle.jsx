export function ClassroomTag({ name }) {
    return (
        <div className="stage-tag stage-tag--classroom">
            {name}
        </div>
    )
}

export function MeetingTag({ name }) {
    return (
        <div className="stage-tag stage-tag--meeting">
            {name}
        </div>
    )
}