export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'low' | 'normal' | 'high'

export interface Task {
    id: string,
    title: string,
    status: Status,
    user_id?: string,
    created_at?: string,
    description?: string,
    priority?: Priority,
    due_date?: string,
    assignee_id?: string
}

export interface AddTaskParams {
    title: string,
    status: Status,
    description?: string,
    priority?: Priority,
    due_date?: string,
    assignee_id?: string | null
}
