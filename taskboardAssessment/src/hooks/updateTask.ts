import {supabase} from "../lib/supabase"
import type {Status, Priority} from "../types"

export const updateTask = async(id: string, updates: {title?: string, description?: string, due_date?:string, status?:Status, priority?:Priority}): Promise<void> => {
    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
    if (error) throw error
}