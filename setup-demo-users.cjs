// Setup demo users in Firebase RTDB
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccount.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alyusrinstitute-net-default-rtdb.firebaseio.com/"
  });
}

const database = admin.database();

const demoUsers = {
  admin_001: {
    email: "admin@alyusr.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    active: true,
    createdAt: new Date().toISOString()
  },
  teacher_001: {
    email: "teacher@alyusr.com",
    password: "teacher123",
    name: "Teacher User",
    role: "teacher",
    active: true,
    createdAt: new Date().toISOString()
  },
  student_001: {
    email: "student@alyusr.com",
    password: "student123",
    name: "Student User",
    role: "student",
    active: true,
    createdAt: new Date().toISOString()
  }
};

async function setupDemoUsers() {
  try {
    console.log("🔧 Setting up demo users in Firebase RTDB...");
    
    for (const [userId, userData] of Object.entries(demoUsers)) {
      await database.ref(`users/${userId}`).set(userData);
      console.log(`✅ Created ${userData.role} user: ${userData.email}`);
    }
    
    console.log("🎉 Demo users setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up demo users:", error);
    process.exit(1);
  }
}

setupDemoUsers();