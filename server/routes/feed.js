import express from 'express';
import Post from '../models/Post.js';
import Event from '../models/Event.js';

const router = express.Router();

/**
 * @route   GET /api/feed/:userSemester
 * @desc    Fetch all posts populated with Event and User data,
 *          strictly filtering out events where eligibleSemesters
 *          does not include the :userSemester.
 */
router.get('/:userSemester', async (req, res) => {
  try {
    const rawSemester = req.params.userSemester;
    if (!rawSemester) {
      return res.status(400).json({
        success: false,
        message: 'userSemester parameter is required',
      });
    }

    const decodedSemester = decodeURIComponent(rawSemester).trim();

    // Find all events whose eligibleSemesters array contains the requested semester
    // Case-insensitive regex match or exact match to support both "Sem 4" and "4"
    const eligibleEvents = await Event.find({
      eligibleSemesters: {
        $elemMatch: { $regex: new RegExp(`^${decodedSemester}$`, 'i') },
      },
    }).select('_id');

    const eligibleEventIds = eligibleEvents.map((evt) => evt._id);

    // Fetch posts linked to eligible events and populate both poster and event details
    const posts = await Post.find({
      eventId: { $in: eligibleEventIds },
    })
      .populate('posterId', 'name collegeEmail semester')
      .populate('eventId')
      .sort({ createdAt: -1 });

    // Filter out any broken references if an event or poster was deleted
    const validPosts = posts.filter(
      (post) => post.posterId && post.eventId && post.eventId.eventName
    );

    return res.status(200).json({
      success: true,
      count: validPosts.length,
      userSemester: decodedSemester,
      posts: validPosts,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching feed posts',
      error: error.message,
    });
  }
});

export default router;
