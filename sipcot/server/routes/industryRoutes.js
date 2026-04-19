// routes/industryRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { registerIndustry, getMyIndustry, updateMyIndustry, getAllIndustries, getIndustry, adminAddIndustry, adminUpdateIndustry, adminDeleteIndustry } = require('../controllers/industryController');

router.post('/', protect, registerIndustry);
router.get('/my', protect, getMyIndustry);
router.put('/my', protect, updateMyIndustry);
router.get('/', protect, authorize('admin'), getAllIndustries);
router.post('/admin', protect, authorize('admin'), adminAddIndustry);
router.get('/:id', protect, authorize('admin'), getIndustry);
router.put('/:id', protect, authorize('admin'), adminUpdateIndustry);
router.delete('/:id', protect, authorize('admin'), adminDeleteIndustry);

module.exports = router;
