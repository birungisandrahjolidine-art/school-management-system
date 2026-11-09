require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const USERNAME = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const existing = await User.findOne({ username: USERNAME });

  if (existing) {
    console.log(`Account "${USERNAME}" already exists with role "${existing.role}".`);
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      console.log("Promoted the existing account to admin.");
    }
  } else {
    await User.create({
      username: USERNAME,
      role: "admin",
      fullName: "System Administrator",
      passwordHash: User.hashPassword(PASSWORD),
    });

    console.log(`Created administrator account "${USERNAME}".`);
    console.log(`Temporary password: ${PASSWORD}`);
    console.log("Change this password from the Users page after signing in.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Could not create the admin account:", err.message);
  process.exit(1);
});
