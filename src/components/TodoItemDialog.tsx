import { FormEvent, Fragment, useState } from 'react';
import {
    Button, TextField, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { TaskPriority } from '../libs/enums';
import { TodoData } from '../libs/types';
import { DB, ObjectWithKey } from '../libs/db';

export default function TodoItemDialog(props: {
    /**
     * null, undefined: sedang menambah item baru. Not null: sedang mengedit
     */
    existingData?: ObjectWithKey<TodoData>,
    variant?: 'text' | 'outlined' | 'contained'
    onSubmit: (data: TodoData) => void
}) {
    const [open, setOpen] = useState(false);

    const [task, setTask] = useState(props.existingData ? props.existingData.value.task : "");
    const [priority, setPriority] = useState(props.existingData ? props.existingData.value.priority : TaskPriority.Normal);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data: TodoData = {
            task: task,
            priority: priority,
            timeCreated: new Date().toISOString(), // lihat doc di types.ts untuk konteks
            complete: props.existingData?.value.complete ?? false
        };

        const db = DB.getInstance();
        db.openConnection()
            .then(() => {
                if (props.existingData) {
                    return db.updateObject("todoItems", props.existingData.primaryKey, data);
                } else {
                    return db.addObject("todoItems", data);
                }
            })
            .then(() => {
                if (!props.existingData) {
                    setTask("");
                    setPriority(TaskPriority.Normal);
                }
                props.onSubmit(data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                db.closeConnection();
            });

        handleClose();
    }

    return (
        <Fragment>
            <Button variant={props.variant ?? "contained"} onClick={handleClickOpen} className="w-36">
                {props.existingData ? "Edit" : "Tambah"}
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle>
                    {props.existingData ?
                        "Edit Item Todo" :
                        "Tambah Item Todo"}
                </DialogTitle>
                <DialogContent className="space-y-6">
                    <DialogContentText>
                        {props.existingData ?
                            "Ubah detail dari item Todo ini sesuai yang kamu inginkan." :
                            "Isi detail dari item Todo yang ingin kamu tambahkan."}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="task"
                        name="task"
                        label="Task"
                        type="text"
                        fullWidth
                        variant="standard"
                        multiline
                        rows={3}
                        value={task}
                        onChange={(event) => {
                            setTask(event.target.value);
                        }}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="priorityLabel">Prioritas</InputLabel>
                        <Select
                            labelId="priorityLabel"
                            label="Prioritas"
                            value={priority}
                            onChange={(event) => {
                                setPriority(event.target.value as TaskPriority);
                            }}>
                            <MenuItem value={TaskPriority.Normal}>Biasa</MenuItem>
                            <MenuItem value={TaskPriority.Medium}>Sedang</MenuItem>
                            <MenuItem value={TaskPriority.Important}>Penting</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Batal</Button>
                    <Button type="submit">Konfirmasi</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
