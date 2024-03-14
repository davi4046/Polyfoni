import Model from "../../../architecture/Model";

interface NoteVMState {
    start: number;
    end: number;
}

export default class NoteVM extends Model<NoteVMState> {}
