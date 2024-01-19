import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import {rateLimiter} from "./middleware/RateLimiter.js";
import {redisClient} from "./middleware/Redis.js";
import noteRoutes from "./routes/NoteRoutes.js";
import {elasticSearchClient} from "./middleware/ElasticSearch.js";

dotenv.config()

const app = express()

app.use(cors())
app.use(rateLimiter)
app.use(express.json({limit: "30mb", extended: true}))
app.use('/api/v1/notes/', noteRoutes)

mongoose
    .connect(
        process.env.MONGODB_URL,
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(() => app.listen(process.env.MONGODB_PORT || 8008))
    .then(async () => {
        console.log("CONNECTED TO MONGODB")
        await redisClient
            .on('error', (err) => console.error('Redis error', err))
            .on('ready', () => console.log('Redis is ready'))
            .connect()
            .then(async () => {
                console.log("CONNECTED TO REDIS")
                await elasticSearchClient.info()
                    .then((response) => console.log("CONNECTED TO ELASTICSEARCH"))
                    .catch((e) => {
                        console.error("ElasticSearch connection error: ", e)
                        process.exit(1)
                    })
            })
            .catch((e) => {
                console.error("Redis connection error: ", e)
                process.exit(1)
            })
    })
    .catch((err) => {
        console.error("CONNECTION ERROR: ", err)
        process.exit(1)
    });