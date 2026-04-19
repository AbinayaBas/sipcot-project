// controllers/authController.js
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const Industry = require('../models/Industry');
const { generateToken } = require('../middleware/auth');

// @desc  Register new user
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, companyName, phone, designation } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, companyName, phone, designation });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password').populate('industry');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact administrator.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName, industry: user.industry, notifications: user.notifications?.filter(n => !n.read).length || 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('industry');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, companyName, phone, designation } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, companyName, phone, designation }, { new: true, runValidators: true });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role === 'admin' ? 'admin' : 'industry',
      action: 'account_profile_updated',
      summary: `${user.name} updated account profile`,
      entityType: 'User',
      entityId: user._id,
      industryId: user.industry || undefined,
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
