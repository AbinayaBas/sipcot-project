// models/Industry.js - Industry Schema
const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Industry name is required'], trim: true },
  registrationNumber: { type: String, unique: true, sparse: true },
  type: {
    type: String,
    enum: ['Manufacturing', 'Textile', 'Chemical', 'Pharmaceutical', 'Electronics', 'Food Processing', 'Engineering', 'IT/ITES', 'Other'],
    required: true
  },
  category: { type: String, enum: ['Large', 'Medium', 'Small', 'Micro'], default: 'Medium' },
  sipcotPark: { type: String, required: true },
  location: {
    address: String,
    city: String,
    district: String,
    state: { type: String, default: 'Tamil Nadu' },
    pincode: String
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    designation: String,
    alternateName: String,
    alternatePhone: String,
    alternateEmail: String,
  },
  allottedArea: { value: Number, unit: { type: String, default: 'acres' } },
  commencementYear: { type: Number },
  status: { type: String, enum: ['Active', 'Inactive', 'Under Construction', 'Closed'], default: 'Active' },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Industry', IndustrySchema);
