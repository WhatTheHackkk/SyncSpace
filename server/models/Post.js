import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    posterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    isSpecificRoleNeeded: {
      type: Boolean,
      default: false,
    },
    requestedSkills: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
