const mongoose = require('mongoose');
const uri = "mongodb+srv://kanzur95_db_user:kanzur2002@assignment.vmxgoo0.mongodb.net/medihealth_doctor_db?retryWrites=true&w=majority&appName=assignment";

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const doctors = await db.collection('doctors').find({}).toArray();
  console.log(JSON.stringify(doctors.map(d => ({id: d._id, email: d.email, name: (d.firstName||'') + ' ' + (d.lastName||''), approved: d.isApproved})), null, 2));
  await mongoose.disconnect();
}

check();
