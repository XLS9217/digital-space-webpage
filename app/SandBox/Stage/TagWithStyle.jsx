import React from 'react';

export function ClassroomTag({ name }) {
    return (
        <div className="stage-tag stage-tag--classroom" onClick={() => alert(`${name} clicked`)}>
            {name}
        </div>
    )
}

export function MeetingTag({ name }) {
    return (
        <div className="stage-tag stage-tag--meeting" onClick={() => alert(`${name} clicked`)}>
            {name}
        </div>
    )
}