// Test Firebase RTDB connection and write operations
import admin from "firebase-admin";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Initialize Firebase Admin with service account
  const serviceAccount = await import('./firebaseServiceAccount.json', { assert: { type: 'json' } });
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount.default),
      databaseURL: "https://alyusrinstitute-net-default-rtdb.firebaseio.com/"
    });
  }

  const database = admin.database();

  console.log("🔥 Testing Firebase RTDB connection...");

  // Test 1: Write a test entry to verify connection
  console.log("📝 Test 1: Writing test entry...");
  const testRef = await database.ref('test/connection').set({
    message: "Firebase connection test",
    timestamp: new Date().toISOString(),
    source: "backend_test"
  });
  console.log("✅ Test entry written successfully");

  // Test 2: Write to forms/contactMessages node
  console.log("📝 Test 2: Writing to forms/contactMessages...");
  const contactRef = await database.ref('forms/contactMessages').push({
    name: "Test Contact",
    email: "test@example.com", 
    subject: "Test Subject",
    message: "This is a test contact form submission",
    approved: false,
    timestamp: new Date().toISOString(),
    submittedAt: admin.database.ServerValue.TIMESTAMP
  });
  console.log("✅ Contact form test entry written with ID:", contactRef.key);

  // Test 3: Write to new RTDB structure
  console.log("📝 Test 3: Writing to contactForms node...");
  const newContactRef = await database.ref('contactForms').push({
    name: "Test Contact RTDB",
    email: "test-rtdb@example.com",
    phone: "+1234567890",
    subject: "RTDB Test Subject", 
    message: "This is a test for the new RTDB structure",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: "unread",
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  console.log("✅ New RTDB structure test entry written with ID:", newContactRef.key);

  // Test 4: Read back the data to verify
  console.log("📖 Test 4: Reading back data...");
  const snapshot = await database.ref('contactForms').once('value');
  const data = snapshot.val();
  console.log("✅ Data read successfully. Entry count:", Object.keys(data || {}).length);
  
  // Test 5: Show the actual data structure
  console.log("📋 Test 5: Current contactForms data structure:");
  if (data) {
    Object.entries(data).forEach(([id, entry]) => {
      console.log(`ID: ${id}`);
      console.log(`Entry:`, JSON.stringify(entry, null, 2));
      console.log('---');
    });
  } else {
    console.log("No data found in contactForms");
  }

  // Test 6: Verify new lowercase forms structure
  console.log("📖 Test 6: Reading new lowercase forms structure...");
  
  const formsSnapshot = await database.ref('forms').once('value');
  const formsData = formsSnapshot.val();
  
  if (formsData) {
    console.log("✅ Lowercase forms structure found with sections:", Object.keys(formsData));
    
    // Check each form type
    Object.entries(formsData).forEach(([formType, submissions]) => {
      const count = Object.keys(submissions || {}).length;
      console.log(`  - ${formType}: ${count} submissions`);
      
      if (count > 0) {
        const firstEntry = Object.values(submissions)[0];
        console.log(`    Sample entry:`, JSON.stringify(firstEntry, null, 2));
      }
    });
  } else {
    console.log("❌ No forms data found");
  }

  // Test 7: Clean up old uppercase Forms nodes
  console.log("🧹 Test 7: Cleaning up old uppercase Forms nodes...");
  try {
    await database.ref('Forms').remove();
    await database.ref('contactForms').remove();
    await database.ref('test').remove();
    console.log("✅ Old nodes cleaned up successfully");
  } catch (error) {
    console.log("ℹ️ Old nodes may not exist or already cleaned");
  }

  console.log("🎉 All Firebase RTDB tests passed!");

} catch (error) {
  console.error("❌ Firebase test failed:", error.message);
  console.error("Full error:", error);
}