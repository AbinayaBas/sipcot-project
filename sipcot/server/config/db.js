// config/db.js - MongoDB Connection
const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sipcot_db';
  const connectOnce = async () => {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  };

  try {
    await connectOnce();
  } catch (error) {
    // On some Windows networks, SRV DNS lookups can fail even when TCP 27017 works.
    // If we detect SRV lookup failure, retry once using public DNS resolvers.
    const msg = String(error?.message || '');
    const shouldRetrySrv =
      uri.startsWith('mongodb+srv://') &&
      (msg.includes('querySrv') || msg.includes('_mongodb._tcp'));

    if (shouldRetrySrv) {
      try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        await connectOnce();
        return;
      } catch (retryErr) {
        console.error(`❌ MongoDB Error: ${retryErr.message}`);
        console.error(
          'SRV DNS lookup failed. Fix options: (1) use a non-SRV connection string from Atlas (mongodb://host1,host2,host3/...), or (2) change your DNS to 1.1.1.1/8.8.8.8, or (3) try a different network/VPN.'
        );
        process.exit(1);
      }
    }

    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
