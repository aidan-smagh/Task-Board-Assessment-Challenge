import {supabase} from "../lib/supabase"

export const getAllTasks = async () => {
  const { data, error } = await supabase
        .from("tasks")
        .select("*");

    if (error) {
        throw error;
    }
    return data ?? [];
}