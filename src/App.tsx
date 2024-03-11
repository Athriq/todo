import { Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import TodoItem from './components/TodoItem'
import { SortBy, TodoStatus } from "./libs/enums"
import { useCallback, useEffect, useState } from "react"
import './App.css'
import TodoItemDialog from "./components/TodoItemDialog"
import { TodoData } from "./libs/types"
import { DB, ObjectWithKey } from "./libs/db"

export default function App() {
    const [filter, setFilter] = useState(TodoStatus.Undefined);
    const [sort, setSort] = useState(SortBy.Undefined);

    const [items, setItems] = useState<ObjectWithKey<TodoData>[] | null>(null);

    const updateItems = useCallback(() => {
        const db = DB.getInstance();

        const filterData = (data: ObjectWithKey<TodoData>[]) => {
            if (filter === TodoStatus.Undefined) {
                return data;
            }

            return data.filter(d => {
                if (filter == TodoStatus.Done) {
                    return d.value.complete;
                } else if (filter == TodoStatus.NotDone) {
                    return !d.value.complete;
                }
                return undefined;
            })
        }

        const sortData = (data: ObjectWithKey<TodoData>[]) => {
            if (!sort) {
                return data;
            }

            return data.sort((a: ObjectWithKey<TodoData>, b: ObjectWithKey<TodoData>) => {
                const dateA = new Date(a.value.timeCreated);
                const dateB = new Date(b.value.timeCreated);

                switch (+sort) {
                    case SortBy.TimeCreated:
                        return dateB.getTime() - dateA.getTime();
                    case SortBy.Priority:
                        if (a.value.priority < b.value.priority) {
                            return 1;
                        } else if (a.value.priority > b.value.priority) {
                            return -1;
                        }
                        return 0;
                    default:
                        return 0;
                }
            })
        }

        db.openConnection()
            .then(() => {
                return db.retrieveAllObjects<TodoData>("todoItems");
            })
            .then((data) => {
                if (filter) {
                    data = filterData(data);
                }
                if (sort) {
                    data = sortData(data);
                }
                setItems(data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                db.closeConnection();
            });
    }, [filter, sort])

    useEffect(() => {
        updateItems();
    }, [filter, sort, updateItems])

    const onItemAdded = () => {
        updateItems();
    }

    const onItemEdit = () => {
        updateItems();
    }

    const onItemDelete = (key: string) => {
        const db = DB.getInstance();
        db.openConnection()
            .then(() => {
                return db.deleteObject("todoItems", key)
            })
            .then(() => {
                updateItems();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                db.closeConnection();
            });
    }

    return (
        <>
            <h1 className="font-bold">Todo List</h1>
            <div className="flex justify-center mt-8">
                <div className="w-3/4 space-y-4">
                    <div className="flex justify-between">
                        <TodoItemDialog onSubmit={onItemAdded}></TodoItemDialog>
                        <div className="flex space-x-2">
                            <FormControl>
                                <InputLabel id="sortLabel">Urut Berdasarkan</InputLabel>
                                <Select
                                    className="bg-white text-start w-40"
                                    labelId="sortLabel"
                                    label="Urut Berdasarkan"
                                    value={sort}
                                    onChange={(event) => {
                                        setSort(event.target.value as SortBy);
                                    }}
                                >
                                    <MenuItem value={SortBy.Undefined}>Tidak ada</MenuItem>
                                    <MenuItem value={SortBy.TimeCreated}>Waktu Dibuat</MenuItem>
                                    <MenuItem value={SortBy.Priority}>Prioritas</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="filterLabel">Filter</InputLabel>
                                <Select
                                    className="bg-white text-start w-40"
                                    labelId="filterLabel"
                                    label="Filter"
                                    value={filter}
                                    onChange={(event) => {
                                        setFilter(event.target.value as TodoStatus);
                                    }}
                                >
                                    <MenuItem value={TodoStatus.Undefined}>Semua</MenuItem>
                                    <MenuItem value={TodoStatus.NotDone}>Belum Selesai</MenuItem>
                                    <MenuItem value={TodoStatus.Done}>Selesai</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className="bg-slate-200 rounded-lg p-6 space-y-4">
                        {items && items.length > 0 ?
                            items.map((item) =>
                                <TodoItem
                                    data={item.value}
                                    key={item.primaryKey}
                                    uuid={item.primaryKey}
                                    onEditCallback={onItemEdit}
                                    onDeleteCallback={onItemDelete}
                                />
                            ) :
                            "Ayoo, isi Todo List-mu!!"}
                    </div>
                </div>
            </div>
        </>
    )
}
