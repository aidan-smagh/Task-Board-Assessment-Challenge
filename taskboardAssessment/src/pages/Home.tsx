import type { Task as TaskType } from "../types";
import { getAllTasks } from "../hooks/queries";
import { useState, useEffect } from "react";
import TaskCard from "../components/Task";
import addTask from "../hooks/addTask";
import type { Status } from "../types";
import type { Priority } from "../types";


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
            <div className="flex gap-4">
                <div className="bg-gray border border-gray-200 rounded-xl shadow-sm p-6 basis-64">
                    <p className="text-med font-medium text-gray-500 mb-4">To Do</p>
                    <div>
                        {error && <div className="error-message">{error}</div>}
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="tasks-grid">
                                {tasks.map((task) => (
                                    <TaskCard task={task} key={task.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-black border border-gray-200 rounded-xl shadow-sm p-6 basis-64">
                    <p className="text-med font-medium text-gray-500 mb-4">In Progress</p>
                </div>
                <div className="bg-black border border-gray-200 rounded-xl shadow-sm p-6 basis-64">
                    <p className="text-med font-medium text-gray-500 mb-4">In Review</p>
                </div>
                <div className="bg-black border border-gray-200 rounded-xl shadow-sm p-6 basis-64">
                    <p className="text-med font-medium text-gray-500 mb-4">Done</p>
                </div>
            </div>
        </div>
    );
}

            export default Home