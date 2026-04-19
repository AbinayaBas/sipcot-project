// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  anomaliesPreview,
  submitData,
  getMyData,
  updateData,
  deleteData,
} = require('../controllers/dataController');

router.post('/anomalies-preview', protect, anomaliesPreview);
router.post('/', protect, submitData);
router.get('/my', protect, getMyData);
router.put('/:id', protect, updateData);
router.delete('/:id', protect, deleteData);

module.exports = router;
