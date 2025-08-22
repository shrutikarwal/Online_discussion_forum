const express = require('express');
const { createThread, getThreads, getThreadById, updateThread,deleteThread } = require('../controllers/ThreadControllers');
const { upvoteThread, downvoteThread } = require('../controllers/ThreadControllers');




const protect = require('../middleware/authMiddleware');

const router = express.Router(); // pehle router create karo

router.post('/', protect, createThread);
router.get('/', getThreads);
router.get('/:id', getThreadById);
router.put('/:id', protect, updateThread); // yaha update route add karo
router.delete('/:id', protect, deleteThread);
router.put('/:id/upvote', protect, upvoteThread);
router.put('/:id/downvote', protect, downvoteThread);

module.exports = router;
