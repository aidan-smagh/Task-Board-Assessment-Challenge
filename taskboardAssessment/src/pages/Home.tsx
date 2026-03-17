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

    //add task perameters
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<Status>("todo");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("normal");
    const [due_date, setDue_Date] = useState("");

    //drag and drop
    const [dragIndicator, setDragIndicator] = useState<string | null>(null);

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
        const {error} = await supabase
            .from('tasks')
            .update({status: newStatus})
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
        } catch (err) {
            console.error(err);
            setError("Failed to add task");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            {/* form */}
            <form onSubmit={handleSubmit} className="add-task-form">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" />
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="description" />
                <input value={due_date} onChange={e => setDue_Date(e.target.value)} placeholder="due_date" />

                <select onChange={e => setStatus(e.target.value as Status)}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                </select>
                <select onChange={e => setPriority(e.target.value as Priority)}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                </select>
                <button type="submit">Add Task</button>
            </form>
            {/* todo column */}
            <div className="flex gap-4 justify-center">
                <div className="bg-gray border border-gray-200 rounded-xl shadow-sm p-6 basis-64"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, 'todo')}>
                    <p className="text-med font-medium text-gray-600 mb-4">To Do</p>
                    <div>
                        {error && <div className="error-message">{error}</div>}
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="tasks-grid">
                                {tasks.map((task) => (
                                    task.status?.startsWith("todo") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* in progress column */}
                <div className="bg-gray border border-gray-200 rounded-xl shadow-sm p-6 basis-64"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, 'in_progress')}>
                    <p className="text-med font-medium text-blue-700 mb-4">In Progress</p>
                    <div>
                        {error && <div className="error-message">{error}</div>}
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="tasks-grid">
                                {tasks.map((task) => (
                                    task.status?.startsWith("in_progress") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* in review column */}
                <div className="bg-gray border border-gray-200 rounded-xl shadow-sm p-6 basis-64"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, 'in_review')}>
                    <p className="text-med font-medium text-purple-700 mb-4">In Review</p>
                    <div>
                        {error && <div className="error-message">{error}</div>}
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="tasks-grid">
                                {tasks.map((task) => (
                                    task.status?.startsWith("in_review") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* done column */}
                <div className="bg-gray border border-gray-200 rounded-xl shadow-sm p-6 basis-64"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, 'done')}>
                    <p className="text-med font-medium text-green-700 mb-4">Done</p>
                    <div>
                        {error && <div className="error-message">{error}</div>}
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="tasks-grid">
                                {tasks.map((task) => (
                                    task.status?.startsWith("done") && <TaskCard task={task} onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home