const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://kanzur95_db_user:2FsqopqWG0QPk2Gz@assignment.vmxgoo0.mongodb.net/?appName=assignment';
const uri2 = 'mongodb+srv://kanzur95_db_user:kanzur2002@assignment.vmxgoo0.mongodb.net/?appName=assignment';

async function testUri(uri, name) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`SUCCESS: ${name} works!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`FAIL: ${name} failed: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log("Testing MongoDB URIs...");
  await testUri(uri1, 'URI 1 (2Fsq...)');
  await testUri(uri2, 'URI 2 (kanz...)');
}
run();
