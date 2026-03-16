import type {Task as TaskType} from "../types";
import {getAllTasks} from "../hooks/queries";
import {useState, useEffect} from "react";
import TaskCard from "../components/Task";

function Home() {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
            <div className="loading">Loading...</div>
        ) : (
            <div className="tasks-grid">
                {tasks.map((task) => (
                    <TaskCard task={task} key={task.id}/>
                ))}
            </div>
        )}
        </div>
    );
}

export default Home