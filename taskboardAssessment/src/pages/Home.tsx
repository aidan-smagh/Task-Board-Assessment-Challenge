import type { Task as TaskType } from "../types";
import { getAllTasks } from "../hooks/queries";
import { useState, useEffect } from "react";
import TaskCard from "../components/Task";
import addTask from "../hooks/addTask";
import type { Status } from "../types";
import type { Priority } from "../types";
import { supabase } from "../lib/supabase";


function Home() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    //add task perameters for form
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<Status>("todo");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("normal");
    const [due_date, setDue_Date] = useState("");
    const [showForm, setShowForm] = useState(false);

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

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.clearData()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-2">
            <p className="text-gray-600 text-2xl font-semibold">Task Manager</p>
            <div className="mb-8 flex justify-end items-center px-4">
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
                        <input value={due_date} onChange={e => setDue_Date(e.target.value)} placeholder="Due date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        <select value={status} onChange={e => setStatus(e.target.value as Status)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Done</option>
                        </select>
                        <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                        </select>
                        <button type="submit" className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors">
                            Add Task
                        </button>
                    </form>
                )}

            <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'todo')}>
                    <p className="text-sm font-medium text-gray-600 mb-4">To Do</p>
                    <div className="flex flex-col gap-3">
                        {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
                            tasks.map(task =>
                                task.status?.startsWith("todo") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                            )
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'in_progress')}>
                    <p className="text-sm font-medium text-blue-700 mb-4">In Progress</p>
                    <div className="flex flex-col gap-3">
                        {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
                            tasks.map(task =>
                                task.status?.startsWith("in_progress") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                            )
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'in_review')}>
                    <p className="text-sm font-medium text-purple-700 mb-4">In Review</p>
                    <div className="flex flex-col gap-3">
                        {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
                            tasks.map(task =>
                                task.status?.startsWith("in_review") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                            )
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'done')}>
                    <p className="text-sm font-medium text-green-700 mb-4">Done</p>
                    <div className="flex flex-col gap-3">
                        {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
                            tasks.map(task =>
                                task.status?.startsWith("done") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home