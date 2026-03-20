import type {Task, Status} from "../types";

interface TaskProps {
    task: Task
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
    onDelete: () => void;
    onUpdate: (updates: {title?: string, description?: string, due_date?: string, status?: Status}) => void;
    onClick: () => void;
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

const getDueDateColors = (due_date: string) => {
    const today = new Date();
    const due = new Date(due_date);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 3) return 'text-yellow-500'
    return 'text-gray-400'
}

const priorityBorder = {
    low: 'border-l-green-400',
    normal: 'border-l-yellow-400',
    high: 'border-l-red-400'
}

function TaskCard({task, onDragStart, onDelete, onClick}: TaskProps) {
    return (
    <div className={`relative bg-white border border-gray-200 border-l-4 ${priorityBorder[task.priority ?? 'normal']} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group`}
    draggable
    onDragStart={onDragStart}
    onClick={onClick}
    >
        <button className="absolute top-0 right-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            >
                x
        </button>
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
            {/*<span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status ?? 'todo']}`}>
                {task.status?.replace('_', ' ')}
            </span>
            */}
            {task.due_date && (
            <span className={`text-xs ${getDueDateColors(task.due_date)} px-12`}>
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
        )}
        </div>
    </div>
    )
}

export default TaskCard