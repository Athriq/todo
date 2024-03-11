import { TaskPriority } from "./enums";

// TodoData model
export interface TodoData {
    task: string,

    priority: TaskPriority,

    /**
     * Awalnya ingin typenya Date, tapi karena object dari interface ini akan disalurkan ke
     * component react sebagai prop, harus dibikin sbg primtif string
     */
    timeCreated: string, 

    complete: boolean
}
