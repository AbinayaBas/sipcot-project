const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ALLOWED_CATEGORIES = [
  'Guideline',
  'Circular / Notice',
  'SOP / Procedure',
  'Form / Template',
  'Compliance Document',
  'Circular',
  'Form',
  'Report',
  'Other',
];

const uploadsDir = path.resolve(__dirname, '..', 'uploads', 'documents');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname)
      .replace(/[^\w.\-]+/g, '_')
      .slice(0, 80);
    cb(null, `${Date.now()}_${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Create document (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
      const {
        title,
        description,
        category = 'Guideline',
        audience = 'all',
        audienceValue,
        versionYear,
      } = req.body;
      const cat = ALLOWED_CATEGORIES.includes(category) ? category : 'Guideline';
      const doc = await Document.create({
        title,
        description,
        category: cat,
        versionYear: versionYear?.trim() || undefined,
        audience,
        audienceValue: audience === 'all' ? undefined : audienceValue,
        createdBy: req.user.id,
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        },
      });
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// List documents (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { active = 'true', category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;
    if (category) query.category = category;

    const total = await Document.countDocuments(query);
    const list = await Document.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: list, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Download (admin)
router.get('/:id/download', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!doc.file?.path) return res.status(404).json({ success: false, message: 'File missing' });
    await Document.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    return res.download(doc.file.path, doc.file.originalName || 'document');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle active
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete (also remove file)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const filePath = doc.file?.path;
    await doc.deleteOne();
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

