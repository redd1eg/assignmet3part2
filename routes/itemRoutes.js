const express = require('express')
const router = express.Router()
const Item = require('../models/Item')

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find()
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE item
router.post('/', async (req, res) => {
  try {
    const item = new Item(req.body)
    const savedItem = await item.save()
    res.status(201).json(savedItem)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// UPDATE item
router.put('/:id', async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id)
    res.json({ message: 'Item deleted' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
