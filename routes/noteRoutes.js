const express = require('express')
const router = express.Router()
const Note = require('../models/Note')

// READ (all)
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 })
    res.json(notes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE
router.post('/', async (req, res) => {
  try {
    const note = new Note(req.body)
    const saved = await note.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.json({ message: 'Note deleted' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
