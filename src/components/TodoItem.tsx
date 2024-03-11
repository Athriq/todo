import { Checkbox, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { TodoData } from "../libs/types";
import { PriorityBadge } from "./PriorityBadge";
import { DB } from "../libs/db";
import TodoItemDialog from "./TodoItemDialog";

export default function TodoItem(props: {
    uuid: string,
    data: TodoData,
    onEditCallback: (id: string) => void,
    onDeleteCallback: (id: string) => void
}) {
    const [complete, setComplete] = useState(props.data.complete);
    const [taskStyle, setTaskStyle] = useState("");

    useEffect(() => {
        if (complete) {
            setTaskStyle("font-medium text-start line-through text-gray-400");
        } else {
            setTaskStyle("font-medium text-start text-gray-600");
        }
    }, [complete]);

    const date = new Date(props.data.timeCreated);
    const dateTime = date.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="bg-white p-4 rounded-md flex justify-between">
            <div className="flex space-x-2">
                <Checkbox
                    checked={complete}
                    onChange={(event) => {
                        setComplete(event.target.checked);
                        const db = DB.getInstance();
                        db.openConnection()
                            .then(() => {
                                const newData = { ...props.data };
                                newData.complete = event.target.checked;
                                return db.updateObject<TodoData>("todoItems", props.uuid, newData);
                            })
                            .catch((error) => {
                                console.error(error);
                            })
                            .finally(() => {
                                db.closeConnection();
                            });
                    }}
                />
                <div>
                    <div className="flex space-x-2">
                        <h3 className={taskStyle}>{props.data.task}</h3>
                        <PriorityBadge priority={props.data.priority} />
                    </div>
                    <p className="text-sm text-gray-400 text-start">{dateTime}</p>
                </div>
            </div>
            <div className="flex space-x-2">
                <TodoItemDialog
                    variant="text"
                    existingData={{ primaryKey: props.uuid, value: props.data }}
                    onSubmit={() => {
                        props.onEditCallback(props.uuid)
                    }} />
                <Button
                    onClick={() => {
                        props.onDeleteCallback(props.uuid);
                    }}
                >
                    Remove
                </Button>
            </div>
        </div>
    )
}
