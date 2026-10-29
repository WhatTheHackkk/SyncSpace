import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    organizingClub: {
      type: String,
      required: true,
      trim: true,
    },
    eligibleSemesters: {
      type: [String],
      required: true,
      default: [],
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
