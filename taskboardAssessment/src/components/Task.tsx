interface TaskProps {
    task: {
        id: string,
        title: string,
        status: 'todo' | 'in_progress' | 'in_review' | 'done',
        user_id: string,
        created_at: string,
        description: string,
        priority: 'low' | 'normal' | 'high',
        due_date: string,
        assignee_id: string
    }
}

function Task({task}: TaskProps) {
    return (
    <div className="task">
        <div className="task-title"></div>
        <div className="task-info">
            <h3>{task.id}</h3>
            <h3>{task.title}</h3>
            <h3>{task.status}</h3>
            <h3>{task.user_id}</h3>
            <h3>{task.created_at}</h3>
            <h3>{task.description}</h3>
            <h3>{task.priority}</h3>
            <h3>{task.due_date}</h3>
            <h3>{task.assignee_id}</h3>
        </div>
    </div>
    )
}

export default Task 