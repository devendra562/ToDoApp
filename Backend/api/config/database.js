// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL);
//     console.log("✅ MongoDB Connected");
//   } catch (err) {
//     console.error("❌ MongoDB Connection Failed", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

try {
  mongoose.connect(process.env.MONGODB_URL);
  console.log('Mongo Connected Successfully');
} catch (error) {
  console.log('Connection faild!', error);
}