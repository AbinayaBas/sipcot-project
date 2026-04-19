// models/ScheduleItem.js - Inspections / review schedule entries
const mongoose = require('mongoose');

const LEGACY_TYPES = ['Deadline', 'Training', 'Other'];

const ScheduleItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    date: { type: Date, required: [true, 'Date is required'] },
    type: {
      type: String,
      enum: ['Inspection', 'Submission Deadline', 'Review Meeting', 'Compliance Check', ...LEGACY_TYPES],
      default: 'Inspection',
    },
    location: { type: String, trim: true, maxlength: 220 },
    reminder24h: { type: Boolean, default: false },
    eventStatus: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    audience: { type: String, enum: ['all', 'park', 'type'], default: 'all' },
    audienceValue: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScheduleItem', ScheduleItemSchema);
