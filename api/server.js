import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import './song.model.js'
import sequelize from './db.js'
import songsRouter from './songs.routes.js'
import uploadsRouter from './uploads.routes.js'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/songs', songsRouter)
app.use('/api/uploads', uploadsRouter)

// ensure DB is ready before listen
const PORT = process.env.PORT || 8082
const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync() // dev: create table if missing
    app.listen(PORT, () => console.log(`API listening on ${PORT}`))
  } catch (e) {
    console.error('Failed to start API:', e)
    process.exit(1)
  }
}
start()
