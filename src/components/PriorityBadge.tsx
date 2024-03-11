import { TaskPriority, getTaskPriorityString } from "../libs/enums";

export function PriorityBadge(props: { priority: TaskPriority }) {
    let bgColor = "";
    switch (props.priority) {
        case TaskPriority.Normal:
            bgColor = "bg-green-200";
            break;
        case TaskPriority.Medium:
            bgColor = "bg-orange-200";
            break;
        case TaskPriority.Important:
            bgColor = "bg-red-200";
            break;
    }

    const badgeStyle = `${bgColor} px-2 rounded-md text-gray-600`;

    return (
        <div className={badgeStyle}>
            {getTaskPriorityString(props.priority)}
        </div>
    );
}