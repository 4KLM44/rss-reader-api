const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')

const app = express()
const db = new Database('feeds.db')

// Mise en place de la base de données au démarrage
db.exec(`
  CREATE TABLE IF NOT EXISTS feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
  )
`)

app.use(cors())
app.use(express.json())

// GET — récupère tous les flux
app.get('/feeds', (req, res) => {
  const feeds = db.prepare('SELECT * FROM feeds').all()
  res.json(feeds)
})

// POST — ajoute un flux
app.post('/feeds', (req, res) => {
  const { name, url, color } = req.body
  if (!name || !url || !color) {
    return res.status(400).json({ error: 'Champs manquants' })
  }
  try {
    const stmt = db.prepare('INSERT INTO feeds (name, url, color) VALUES (?, ?, ?)')
    const result = stmt.run(name, url, color)
    res.json({ id: result.lastInsertRowid, name, url, color })
  } catch (e) {
    res.status(409).json({ error: 'Ce flux existe déjà' })
  }
})

// DELETE — supprime un flux
app.delete('/feeds/:id', (req, res) => {
  db.prepare('DELETE FROM feeds WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API démarrée sur le port ${PORT}`))