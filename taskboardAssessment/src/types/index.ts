export interface Task {
    id: string,
    title: string,
    status: 'todo' | 'in_progress' | 'in_review' | 'done',
    user_id: string,
    created_at: string,
    description: string,
    priority: 'low' | 'normal' | 'high',
    due_date: string,
    assignee_id: string
}
