const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// READ (all) - можно без логина
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// CREATE - только с логином
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    // простая валидация (подстрой под поля твоей модели Note)
    if (!title || !content) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const note = new Note({
      ...req.body,
      // если ты добавишь поле user в Note, можно включить это:
      // user: req.session.userId
    });

    const saved = await note.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ error: 'Bad request' });
  }
});

// UPDATE - только с логином
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: 'Bad request' });
  }
});

// DELETE - только с логином
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    return res.status(400).json({ error: 'Bad request' });
  }
});

module.exports = router;
