import type {Task} from "../types";

interface TaskProps {
    task: Task
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
}

const priorityColors = {
    low: 'bg-green-100 text-green-700',
    normal: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700', 
}

const statusColors = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    in_review: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700',
}

function TaskCard({task, onDragStart}: TaskProps) {
    return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow" 
    draggable
    onDragStart={onDragStart}>
         <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority ?? 'normal']}`}>
                {task.priority}
            </span>
        </div>
        {task.description && (
            <p className="text-sm text-gray-500 mb-3">{task.description}</p>
        )}
        <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status ?? 'todo']}`}>
                {task.status?.replace('_', ' ')}
            </span>
            {task.due_date && (
            <span className="text-xs text-gray-400">
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
        )}
        </div>
    </div>
    )
}

export default TaskCard