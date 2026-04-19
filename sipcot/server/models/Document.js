// models/Document.js - Admin documents (circulars, guidelines, forms)
const mongoose = require('mongoose');

/** Current official categories (admin upload form). */
const DOCUMENT_CATEGORIES = [
  'Guideline',
  'Circular / Notice',
  'SOP / Procedure',
  'Form / Template',
  'Compliance Document',
];

/** Legacy values kept so existing DB documents remain valid. */
const LEGACY_DOCUMENT_CATEGORIES = ['Circular', 'Form', 'Report', 'Other'];

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1200 },
    category: {
      type: String,
      enum: [...DOCUMENT_CATEGORIES, ...LEGACY_DOCUMENT_CATEGORIES],
      default: 'Guideline',
    },
    versionYear: { type: String, trim: true, maxlength: 40 },
    audience: { type: String, enum: ['all', 'park', 'type'], default: 'all' },
    audienceValue: { type: String, trim: true },
    downloadCount: { type: Number, default: 0, min: 0 },
    file: {
      originalName: String,
      filename: String,
      mimeType: String,
      size: Number,
      path: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
