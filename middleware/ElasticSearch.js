import {Client} from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config()

export const elasticSearchClient = new Client({
    cloud: {
        id: process.env.ELASTICSEARCH_CLOUD_ID
    },
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    }
})

export const indexNoteInElasticsearch = async (note) => {
    try {
        const {_id, title, content} = note

        await elasticSearchClient.index({
            index: 'notes',
            id: _id.toString(),
            body: {
                title: title,
                content: content
            }
        })
        console.log(`Note with id ${_id} indexed in elasticsearch`)
    } catch (e) {
        console.error("Error indexing note: ", e)
    }
}

export const removeNoteFromElasticsearch = async (noteId) => {
    try {
        await elasticSearchClient.delete({
            index: 'notes',
            id: noteId.toString()
        })
        console.log(`Note with with ${noteId} removed from elasticsearch`)
    } catch (e) {
        console.error("Error removing note from elasticsearch: ", e)
    }
}