const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// POST /api/messages - Public endpoint (submit message)
router.post(
    '/',
    [
        body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Name is required (max 100 chars)'),
        body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message is required (max 2000 chars)')
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, message } = req.body;

            // Create new message
            const newMessage = new Message({
                name,
                message
            });

            await newMessage.save();

            res.status(201).json({
                success: true,
                message: 'Message sent successfully'
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// GET /api/messages - Admin only (get all messages)
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/messages/:id/reply - Admin only (reply to message)
router.post(
    '/:id/reply',
    auth,
    [
        body('reply').trim().notEmpty().isLength({ max: 2000 }).withMessage('Reply is required (max 2000 chars)')
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { reply } = req.body;

            const message = await Message.findById(req.params.id);
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }

            message.reply = reply;
            await message.save();

            res.json({
                success: true,
                message: 'Reply saved successfully',
                data: message
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

module.exports = router;
