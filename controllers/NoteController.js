import Note from "../models/Note.js";
import {
    elasticSearchClient,
    indexNoteInElasticsearch,
    removeNoteFromElasticsearch
} from "../middleware/ElasticSearch.js";
import {getDataFromRedisCache, setDataInRedisCache} from "../middleware/Redis.js";

export const createNote = async (req, res, next) => {
    try {
        const {title, content} = req.body

        const note = await Note.create({
            title: title,
            content: content
        })

        await note.save()
        await indexNoteInElasticsearch(note)
        await setDataInRedisCache('note', note, 60)

        return res.status(200).json({note: note, message: "Note created successfully!"})
    } catch (e) {
        console.error("Note create error: ", e)
        return res.status(500).json({message: "Unable to create new note!"})
    }
}

export const updateNote = async (req, res, next) => {
    try {
        const {noteId, title, content} = req.body

        const updatedNote = await Note.findById(noteId)
        if (!updatedNote) return res.status(404).json({message: "Note not found"})

        updatedNote.title = title
        updatedNote.content = content

        await updatedNote.save()
        await setDataInRedisCache('note', updatedNote, 60)

        return res.status(200).json({note: updatedNote, message: "Note updated successfully!"})
    } catch (e) {
        console.error("Note update error: ", e)
        return res.status(500).json({message: "Unable to update note!"})
    }
}

export const getNoteById = async (req, res, next) => {
    try {
        const {noteId} = req.params

        const cacheKey = `note-${noteId}`
        const cachedNote = await getDataFromRedisCache(cacheKey)
        if (cachedNote !== null) {
            await setDataInRedisCache('note', JSON.parse(cachedNote), 60)
            return res.status(200).json({
                note: JSON.parse(cachedNote),
                message: "Note fetched from Redis successfully!"
            })
        }

        const note = await Note.findById(noteId)
        if (!note) return res.status(404).json({message: "Note not found "})

        await setDataInRedisCache('note', note, 60)

        return res.status(200).json({note: note, message: "Note fetched successfully!"})
    } catch (e) {
        console.error("Note get error: ", e)
        return res.status(500).json({message: "Unable to get note!"})
    }
}

export const getAllNotes = async (req, res, next) => {
    try {
        const notes = await Note.find({})
        return res.status(200).json({notes: notes, message: "Notes fetched successfully!"})
    } catch (e) {
        console.error("Notes get error: ", e)
        return res.status(500).json({message: "Unable to get notes!"})
    }
}

export const deleteNote = async (req, res, next) => {
    try {
        const {noteId} = req.params

        const deletedNote = await Note.findByIdAndDelete(noteId)
        if (!deletedNote) return res.status(404).json({message: "Note not found "})

        await removeNoteFromElasticsearch(noteId)

        return res.status(200).json({message: "Note deleted successfully!"})
    } catch (e) {
        console.error("Note delete error: ", e)
        return res.status(500).json({message: "Unable to delete note!"})
    }
}

export const deleteAllNotes = async (req, res, next) => {
    try {
        await Note.deleteMany({})

        return res.status(200).json({message: "All notes deleted successfully!"})
    } catch (e) {
        console.error("Delete all notes error: ", e)
        return res.status(500).json({message: "Unable to delete all notes!"})
    }
}

export const searchNotes = async (req, res, next) => {
    try {
        const {query} = req.query

        const body = await elasticSearchClient.search({
            index: 'notes',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['title', 'content']
                    }
                }
            }
        })

        const hits = body.hits.hits.map((hit) => ({
            id: hit._id,
            title: hit._source.title,
            content: hit._source.content,
        }))

        return res.status(200).json({results: hits, message: "Search successful!"})
    } catch (e) {
        console.error("Search error: ", e)
        return res.status(500).json({message: "Unable to perform search!"})
    }
}