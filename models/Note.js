import {model, Schema} from 'mongoose';

const NoteSchema = new Schema(
    {
        title: {
            type: String,
            default: "",
            required: true,
        },
        content: {
            type: String,
            default: "",
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Note = model('Note', NoteSchema);
export default Note;