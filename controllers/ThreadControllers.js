const Thread = require('../models/Thread');

// Create Thread
exports.createThread = async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const thread = await Thread.create({
      title,
      description,
      tags,
      category,
      createdBy: req.user._id
    });

    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all threads with filters, search, pagination, sorting
exports.getThreads = async (req, res) => {
  try {
    const { category, tag, sort, page = 1, limit = 10, search } = req.query;
    let filter = {};

    // Filters
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
    if (tag) {
      filter.tags = { $regex: new RegExp(tag, 'i') };
    }

    // Search in title & description
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    let query = Thread.find(filter).populate('createdBy', 'name email');

    // Sorting
    if (sort === 'recent') {
      query = query.sort({ createdAt: -1 });
    } else if (sort === 'votes') {
      query = query.sort({ votes: -1 });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    const threads = await query;
    const total = await Thread.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      threads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single thread by ID
exports.getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update thread
exports.updateThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this thread' });
    }

    thread.title = req.body.title || thread.title;
    thread.description = req.body.description || thread.description;
    thread.tags = req.body.tags || thread.tags;
    thread.category = req.body.category || thread.category;

    const updatedThread = await thread.save();
    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Thread
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this thread' });
    }

    await Thread.findByIdAndDelete(req.params.id);

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Upvote Thread
exports.upvoteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.votes += 1;
    await thread.save();

    res.json({ message: 'Thread upvoted successfully', votes: thread.votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Downvote Thread
exports.downvoteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.votes -= 1;
    await thread.save();

    res.json({ message: 'Thread downvoted successfully', votes: thread.votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
