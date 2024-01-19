import express from "express";
import {
    createNote,
    deleteAllNotes,
    deleteNote,
    getAllNotes,
    getNoteById,
    searchNotes,
    updateNote
} from "../controllers/NoteController.js";

const noteRoutes = express.Router()

noteRoutes.post('/create-note', createNote)
noteRoutes.get('/get-all-notes', getAllNotes)
noteRoutes.get('/get-note/:noteId', getNoteById)
noteRoutes.get('/search-notes', searchNotes)
noteRoutes.put('/update-note', updateNote)
noteRoutes.delete('/delete-note/:noteId', deleteNote)
noteRoutes.delete('/delete-notes', deleteAllNotes)

export default noteRoutes