import { supabase } from "../lib/supabase";
import type { Task, AddTaskParams } from "../types";

export const addTask = async ({
  title,
  status,
  description = "",
  priority = "normal",
  due_date = "",
  assignee_id = null,
}: AddTaskParams): Promise<Task> => {
  
  // Ensure we have an active user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await supabase.auth.signInAnonymously();
  }

  // Insert task into database
  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      title,
      status,
      description,
      priority,
      due_date: due_date || null,      // database can handle null
      user_id: user?.id || null,
      assignee_id
    }])
    .select()
    .single(); // return inserted row

  if (error) throw error;
  return data;
};

export default addTask;