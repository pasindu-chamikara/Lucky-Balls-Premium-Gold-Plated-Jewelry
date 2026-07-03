const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Path to the service account key
const serviceAccountPath = path.join(__dirname, "..", "service-account-key.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: service-account-key.json not found in the root directory.");
  console.error("Please download it from Firebase Console > Project Settings > Service Accounts.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully granted admin privileges to user: ${uid}`);
    
    // Verify it was set
    const userRecord = await admin.auth().getUser(uid);
    console.log("Current custom claims:", userRecord.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting custom claim:", error);
    process.exit(1);
  }
}

const targetUid = process.argv[2];

if (!targetUid) {
  console.error("Please provide a UID.");
  console.error("Usage: node scripts/set-admin.js <USER_UID>");
  process.exit(1);
}

setAdminClaim(targetUid);
