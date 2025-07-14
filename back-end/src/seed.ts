import "dotenv/config";
import mongoose from "mongoose";
import connectMongoose from "./config/mongoose";
import User from "./models/User";
import { Role } from "./models/Role";
import { hashPassword } from "./utils/authFunctions";

async function seed() {
  await connectMongoose();

  const users = [
    {
      email: "superadmin@example.com",
      password: "password123",
      role: Role.SUPERADMIN,
    },
    {
      email: "owner@example.com",
      password: "password123",
      role: Role.OWNER,
    },
    {
      email: "registered@example.com",
      password: "password123",
      role: Role.REGISTERED,
    },
    {
      email: "unregistered@example.com",
      password: "password123",
      role: Role.UNREGISTERED,
    },
  ];

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    const upserted = await User.findOneAndUpdate(
      { email: user.email },
      {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded user: ${upserted.email} (${upserted.role})`);
  }

  await mongoose.disconnect();
  console.log("✅ Seeding complete.");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.disconnect();
}); 