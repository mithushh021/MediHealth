const mongoose = require('mongoose');
const uri = "mongodb+srv://kanzur95_db_user:kanzur2002@assignment.vmxgoo0.mongodb.net/medihealth_doctor_db?retryWrites=true&w=majority&appName=assignment";

async function forceApprove() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const result = await db.collection('doctors').updateMany({}, { $set: { isApproved: true } });
  console.log(`Updated ${result.modifiedCount} doctors to Approved: true`);
  await mongoose.disconnect();
}

forceApprove();
