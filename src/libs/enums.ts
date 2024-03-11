export enum TodoStatus {
    Undefined,
    Done,
    NotDone
}

export enum SortBy {
    Undefined,
    TimeCreated,
    Priority
}

export enum TaskPriority {
    Normal,
    Medium,
    Important
}

export function getTaskPriorityString(value: TaskPriority) {
    switch (value) {
        case TaskPriority.Normal: return "Biasa"
        case TaskPriority.Medium: return "Sedang"
        case TaskPriority.Important: return "Penting"
    }
}
