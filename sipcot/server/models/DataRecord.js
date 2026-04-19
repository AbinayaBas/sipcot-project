// models/DataRecord.js - Annual Data Submission Schema
const mongoose = require('mongoose');

const DataRecordSchema = new mongoose.Schema({
  industry: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'], default: 'Annual' },

  // Financial Data
  investment: { value: { type: Number, default: 0 }, unit: { type: String, default: 'Lakhs INR' } },
  turnover: { value: { type: Number, default: 0 }, unit: { type: String, default: 'Lakhs INR' } },
  exports: { value: { type: Number, default: 0 }, unit: { type: String, default: 'Lakhs INR' } },

  // Employment Data
  employment: {
    total: { type: Number, default: 0 },
    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 },
    skilled: { type: Number, default: 0 },
    unskilled: { type: Number, default: 0 },
    local: { type: Number, default: 0 }
  },

  // Resource Usage
  waterUsage: { value: { type: Number, default: 0 }, unit: { type: String, default: 'KLD' } },
  powerUsage: { value: { type: Number, default: 0 }, unit: { type: String, default: 'KWH/month' } },

  // CSR Activities
  csrActivities: [{
    activity: String,
    amount: Number,
    beneficiaries: Number,
    description: String
  }],
  csrTotal: { type: Number, default: 0 },

  // Environmental Compliance
  effluentTreatment: { type: Boolean, default: false },
  sewageTreatmentPlant: { type: Boolean, default: false },
  wasteManagementInPlace: { type: Boolean, default: false },
  rainwaterHarvesting: { type: Boolean, default: false },
  solarPower: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'], default: 'Draft' },
  adminRemarks: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  submittedAt: { type: Date }
}, { timestamps: true });

// Unique submission per industry per year per quarter
DataRecordSchema.index({ industry: 1, year: 1, quarter: 1 }, { unique: true });

module.exports = mongoose.model('DataRecord', DataRecordSchema);
