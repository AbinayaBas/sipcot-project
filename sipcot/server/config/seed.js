// config/seed.js - Populate DB with sample data
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env (required for seeding).');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seed = async () => {
  await connectDB();
  const User = require('../models/User');
  const Industry = require('../models/Industry');
  const DataRecord = require('../models/DataRecord');
  const Announcement = require('../models/Announcement');
  const ScheduleItem = require('../models/ScheduleItem');
  const Document = require('../models/Document');

  await Promise.all([
    User.deleteMany({}),
    Industry.deleteMany({}),
    DataRecord.deleteMany({}),
    Announcement.deleteMany({}),
    ScheduleItem.deleteMany({}),
    Document.deleteMany({}),
  ]);
  console.log('Collections cleared');

  // Create admin
  const admin = await User.create({ name: 'SIPCOT Admin', email: 'admin@sipcot.com', password: 'Admin@123', role: 'admin', companyName: 'SIPCOT', designation: 'General Manager' });

  // Create industry users
  const users = await User.insertMany([
    { name: 'Rajesh Kumar', email: 'rajesh@techfab.com', password: await bcrypt.hash('Pass@123', 12), role: 'industry', companyName: 'TechFab Industries', designation: 'Managing Director', phone: '9876543210' },
    { name: 'Priya Sharma', email: 'priya@sunpharma.com', password: await bcrypt.hash('Pass@123', 12), role: 'industry', companyName: 'Sun Pharma Ltd', designation: 'CEO', phone: '9876543211' },
    { name: 'Arun Selvan', email: 'arun@texstyle.com', password: await bcrypt.hash('Pass@123', 12), role: 'industry', companyName: 'TexStyle Fabrics', designation: 'Director', phone: '9876543212' },
    { name: 'Meena Devi', email: 'meena@electrotek.com', password: await bcrypt.hash('Pass@123', 12), role: 'industry', companyName: 'ElectroTek Solutions', designation: 'CFO', phone: '9876543213' },
    { name: 'Vijay Anand', email: 'vijay@agrofresh.com', password: await bcrypt.hash('Pass@123', 12), role: 'industry', companyName: 'AgroFresh Processing', designation: 'MD', phone: '9876543214' }
  ]);

  const parks = ['Hosur I', 'Hosur II', 'Perundurai', 'Oragadam', 'Sriperumbudur'];
  const types = ['Manufacturing', 'Pharmaceutical', 'Textile', 'Electronics', 'Food Processing'];

  // Create industries
  const industries = await Industry.insertMany(users.map((u, i) => ({
    name: u.companyName,
    type: types[i],
    category: ['Large', 'Medium', 'Large', 'Small', 'Medium'][i],
    sipcotPark: parks[i],
    location: { city: parks[i].split(' ')[0], district: ['Krishnagiri', 'Krishnagiri', 'Erode', 'Kanchipuram', 'Kanchipuram'][i], state: 'Tamil Nadu', pincode: ['635109', '635110', '638052', '602105', '602117'][i] },
    contactPerson: { name: u.name, email: u.email, phone: u.phone, designation: u.designation },
    allottedArea: { value: [25, 18, 12, 8, 15][i] },
    commencementYear: [2015, 2018, 2016, 2020, 2019][i],
    status: 'Active',
    registrationNumber: `SIPCOT/TN/${2015 + i}/00${i + 1}`,
    user: u._id
  })));

  // Link industries to users
  await Promise.all(users.map((u, i) => User.findByIdAndUpdate(u._id, { industry: industries[i]._id })));

  // Create data records (includes 1 rejected + 2 pending 2024 submissions so admin UI / dashboard align)
  const records = [];
  for (let i = 0; i < industries.length; i++) {
    for (const year of [2022, 2023, 2024]) {
      let status;
      let adminRemarks;
      let reviewedBy;
      let reviewedAt;

      if (i === 0 && year === 2023) {
        status = 'Rejected';
        adminRemarks =
          'Mismatch in employment totals vs supporting annexure. Correct figures and attach signed worksheets, then resubmit.';
        reviewedBy = admin._id;
        reviewedAt = new Date('2023-05-08');
      } else if (i === 0 && year === 2024) {
        status = 'Under Review';
        reviewedBy = admin._id;
        reviewedAt = new Date('2024-04-02');
      } else if (i === 4 && year === 2023) {
        status = 'Rejected';
        adminRemarks =
          'Supporting documentation incomplete for third-party verification. Please resubmit with signed annexures.';
        reviewedBy = admin._id;
        reviewedAt = new Date('2023-05-12');
      } else if (year === 2024) {
        status = i < 3 ? 'Approved' : 'Submitted';
        if (status === 'Approved') {
          reviewedBy = admin._id;
          reviewedAt = new Date(`${year}-04-15`);
        }
      } else {
        status = 'Approved';
        reviewedBy = admin._id;
        reviewedAt = new Date(`${year}-04-15`);
      }

      records.push({
        industry: industries[i]._id,
        submittedBy: users[i]._id,
        year,
        quarter: 'Annual',
        investment: { value: 500 + i * 200 + (year - 2022) * 100, unit: 'Lakhs INR' },
        turnover: { value: 1200 + i * 300 + (year - 2022) * 150, unit: 'Lakhs INR' },
        employment: { total: 200 + i * 50 + (year - 2022) * 20, male: 140 + i * 30, female: 60 + i * 20, skilled: 100 + i * 25, unskilled: 100 + i * 25, local: 80 + i * 15 },
        waterUsage: { value: 50 + i * 15 },
        powerUsage: { value: 10000 + i * 2500 },
        csrTotal: 10 + i * 5,
        csrActivities: [{ activity: 'Education Support', amount: 5 + i, beneficiaries: 100 + i * 20, description: 'Scholarship for local students' }],
        effluentTreatment: true,
        rainwaterHarvesting: i % 2 === 0,
        solarPower: i * 50,
        status,
        adminRemarks,
        submittedAt: new Date(`${year}-03-31`),
        reviewedBy,
        reviewedAt,
      });
    }
  }
  await DataRecord.insertMany(records);

  await Announcement.create({
    title: 'Q4 submission deadline — 31 March',
    message:
      'All operational units must file the Q4 / annual statutory return bundle no later than 31 March (close of reporting window). Late filings may be reflected in compliance summaries and estate-level reviews.',
    announcementType: 'deadline',
    effectiveDate: new Date('2026-03-31'),
    priority: 'high',
    audience: 'all',
    createdBy: admin._id,
  });

  await ScheduleItem.create({
    title: 'Inspection — Hosur I',
    description: 'Estate compliance walk-through; keep statutory registers, consent copies, and safety drill logs available at the unit office.',
    date: new Date('2026-06-15T09:30:00'),
    type: 'Inspection',
    location: 'Hosur I · Industrial Estate',
    audience: 'all',
    eventStatus: 'upcoming',
    createdBy: admin._id,
  });

  const docDir = path.join(__dirname, '..', 'uploads', 'documents');
  fs.mkdirSync(docDir, { recursive: true });
  const docFilename = `${Date.now()}_Safety_Guidelines_2026_seed.txt`;
  const docPath = path.join(docDir, docFilename);
  fs.writeFileSync(
    docPath,
    'SIPCOT Industrial Estate — Safety & housekeeping guidelines (seed file).\nReplace with the official consolidated PDF for 2026.\n',
    'utf8'
  );

  await Document.create({
    title: 'Safety Guidelines 2026',
    description: 'Consolidated safety and housekeeping expectations for estate units (reference copy).',
    category: 'Guideline',
    versionYear: '2026',
    audience: 'all',
    createdBy: admin._id,
    file: {
      originalName: 'Safety Guidelines 2026.pdf',
      filename: docFilename,
      mimeType: 'text/plain',
      size: fs.statSync(docPath).size,
      path: docPath,
    },
  });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@sipcot.com / Admin@123');
  console.log('Industry: rajesh@techfab.com / Pass@123');
  mongoose.disconnect();
};

seed().catch(console.error);
