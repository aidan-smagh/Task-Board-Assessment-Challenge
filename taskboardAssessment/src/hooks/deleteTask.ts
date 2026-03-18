import {supabase} from "../lib/supabase"

export const deleteTask = async(id: string): Promise<void> => {
    const {error} = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) throw error;
}
