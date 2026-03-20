import type { Task as TaskType } from "../types";
import { getAllTasks } from "../hooks/getAllTasks";
import { deleteTask } from "../hooks/deleteTask"
import { updateTask } from "../hooks/updateTask"
import { useState, useEffect } from "react";
import TaskCard from "../components/Task";
import addTask from "../hooks/addTask";
import type { Status } from "../types";
import type { Priority } from "../types";
import { supabase } from "../lib/supabase";


function Home() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [_error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    //add task perameters for form
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<Status>("todo");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("normal");
    const [due_date, setDue_Date] = useState("");
    const [showForm, setShowForm] = useState(false);

    //deleting
    const [successMessage, setSuccessMessage] = useState("");

    //updating
    const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

    //search and filter
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (priorityFilter === 'all' || t.priority === priorityFilter));

    //counts
    const todoCount = filteredTasks.filter(t => t.status === 'todo').length;
    const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length
    const inReviewCount = filteredTasks.filter(t => t.status === 'in_review').length
    const doneCount = filteredTasks.filter(t => t.status === 'done').length

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const allTasks = await getAllTasks();
                console.log(allTasks);
                setTasks(allTasks);
            } catch (err) {
                console.log(err);
                setError("Failed to load tasks");
            }
            finally {
                setLoading(false);
            }
        }
        loadTasks();
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: string) => {
        e.dataTransfer.setData("text", task)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
        e.preventDefault();
        const taskID = e.dataTransfer.getData("text");

        //update in db
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskID)
        if (error) {
            console.error(error)
            return
        }
        //set local state
        setTasks(prev => prev.map(task =>
            task.id === taskID ? { ...task, status: newStatus } : task
        ));
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please input valid information to add new task.")
            return;
        }
        try {
            const newTask = await addTask({
                title,
                status,
                description,
                priority,
                due_date: due_date || undefined
            });

            setTasks(prev => [...prev, newTask]);
            console.log("Created:", newTask);

            // Reset form fields
            setTitle("");
            setDescription("");
            setPriority("normal");
            setStatus("todo");
            setDue_Date("");
            setShowForm(false);
        } catch (err) {
            console.error(err);
            setError("Failed to add task");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            setSuccessMessage("Task successfully deleted");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error(err);
        }
    }
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }

    const handleUpdate = async (id: string, updates: { title?: string, description?: string, due_date?: string, status?: Status , priority?: Priority}) => {
        try {
            await updateTask(id, updates);
            setTasks(prev => prev.map(task =>
                task.id === id ? { ...task, ...updates } : task
            ));
            setSuccessMessage("Task successfully updated.");
        } catch (err) {
            console.error(err);
        }
    }
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-4">
            <p className="text-gray-600 text-2xl font-semibold">Task Manager</p>
            {successMessage && (
                <div className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">
                    {successMessage}
                </div>
            )}
            <div className="mb-8 flex items-center px-10 py-5 md:justify-center gap-3">
                <input value={searchQuery} onChange={handleSearch} placeholder="Search Tasks" className="bg-gray-900 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"></input>
                <select className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors" onChange={e => setPriorityFilter((e.target.value as Priority | "all"))}>
                    <option value="all">All priorities</option>
                    <option value="low">Low priority</option>
                    <option value="normal">Normal priority</option>
                    <option value="high">High priority</option>
                </select>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add Task'}
                </button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit} className="flex gap-3 mt-4 mb-8">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                    <input type="date" value={due_date} onChange={e => setDue_Date(e.target.value)} placeholder="Due date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    <select value={status} onChange={e => setStatus(e.target.value as Status)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <option value="" disabled>Select status</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                    </select>
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <option value="" disabled>Select priority</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit" className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors">
                        Add Task
                    </button>
                </form>
            )}

            <div className="flex gap-4 h-[calc(100vh-200px)]">
                {/* columns */}
                <div className="flex gap-4 flex-1">
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, 'todo')}>
                        <p className="text-sm font-medium text-gray-600 mb-4 py-2">To Do <span className="text-gray-400">({todoCount})</span></p>
                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="text-sm text-gray-400">Loading...</div>
                            ) : todoCount === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-6">No tasks yet</div>
                            ) : (
                                filteredTasks.filter(t => t.status === 'todo').map(task => (
                                    <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} onDelete={() => handleDelete(task.id)} onUpdate={(updates) => handleUpdate(task.id, updates)} onClick={() => setSelectedTask(task)} key={task.id} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, 'in_progress')}>
                        <p className="text-sm font-medium text-gray-600 mb-4 py-2">In Progress <span className="text-gray-400">({inProgressCount})</span></p>
                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="text-sm text-gray-400">Loading...</div>
                            ) : inProgressCount === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-6">No tasks yet</div>
                            ) : (
                                filteredTasks.filter(t => t.status === 'in_progress').map(task => (
                                    <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} onDelete={() => handleDelete(task.id)} onUpdate={(updates) => handleUpdate(task.id, updates)} onClick={() => setSelectedTask(task)} key={task.id} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, 'in_review')}>
                        <p className="text-sm font-medium text-gray-600 mb-4 py-2">In Review <span className="text-gray-400">({inReviewCount})</span></p>
                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="text-sm text-gray-400">Loading...</div>
                            ) : inReviewCount === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-6">No tasks yet</div>
                            ) : (
                                filteredTasks.filter(t => t.status === 'in_review').map(task => (
                                    <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} onDelete={() => handleDelete(task.id)} onUpdate={(updates) => handleUpdate(task.id, updates)} onClick={() => setSelectedTask(task)} key={task.id} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, 'done')}>
                        <p className="text-sm font-medium text-gray-600 mb-4 py-2">Done <span className="text-gray-400">({doneCount})</span></p>
                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="text-sm text-gray-400">Loading...</div>
                            ) : doneCount === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-6">No tasks yet</div>
                            ) : (
                                filteredTasks.filter(t => t.status === 'done').map(task => (
                                    <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} onDelete={() => handleDelete(task.id)} onUpdate={(updates) => handleUpdate(task.id, updates)} onClick={() => setSelectedTask(task)} key={task.id} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* expanded panel */}
                {selectedTask && (
                    <div className="w-64 bg-gray-200 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4 overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-600 text-2xl font-semibold">Edit Task</p>
                            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <input
                            value={selectedTask.title ?? ''}
                            onChange={e => setSelectedTask({ ...selectedTask, title: e.target.value })}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="Title"
                        />
                        <input
                            value={selectedTask.description ?? ''}
                            onChange={e => setSelectedTask({ ...selectedTask, description: e.target.value })}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            placeholder="Description"
                        />
                        <input
                            type="date"
                            value={selectedTask.due_date ?? ''}
                            onChange={e => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                        />
                        <select value={selectedTask.status ?? ''} onChange={e => setSelectedTask({ ...selectedTask, status: e.target.value as Status })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Done</option>
                        </select>
                        <select value={selectedTask.priority ?? ''} onChange={e => setSelectedTask({ ...selectedTask, priority: e.target.value as Priority})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                        </select>
                        <div className="flex gap-3 justify-end mt-auto">
                            <button onClick={() => setSelectedTask(null)} className="text-sm text-gray-500 hover:text-gray-700">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpdate(selectedTask.id, {
                                        title: selectedTask.title,
                                        description: selectedTask.description,
                                        due_date: selectedTask.due_date,
                                        status: selectedTask.status,
                                        priority: selectedTask.priority
                                    })
                                    setSelectedTask(null)
                                }}
                                className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Home