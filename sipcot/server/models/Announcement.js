// models/Announcement.js - Admin announcements / circulars
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 140 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 5000 },
    announcementType: {
      type: String,
      enum: ['general', 'deadline', 'inspection', 'policy'],
      default: 'general',
    },
    effectiveDate: { type: Date },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    audience: { type: String, enum: ['all', 'park', 'type'], default: 'all' },
    audienceValue: { type: String, trim: true }, // e.g. park name or industry type
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);

