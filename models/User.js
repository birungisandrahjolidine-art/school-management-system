const mongoose = require("mongoose");
const crypto = require("crypto");

const ROLES = ["teacher", "admin", "librarian", "bursar"];

const SCRYPT_KEYLEN = 64;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      match: [
        /^[a-z0-9._-]+$/,
        "Username may only contain letters, numbers, dots, hyphens and underscores",
      ],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    fullName: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.statics.ROLES = ROLES;

// scrypt keeps this dependency-free while still using a real KDF + per-user salt.
userSchema.statics.hashPassword = function (password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  return `scrypt:${salt}:${derived.toString("hex")}`;
};

userSchema.statics.verifyPassword = function (password, storedHash) {
  const parts = String(storedHash || "").split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const derived = crypto.scryptSync(String(password), parts[1], SCRYPT_KEYLEN);
  const expected = Buffer.from(parts[2], "hex");

  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
};

userSchema.methods.verifyPassword = function (password) {
  return this.constructor.verifyPassword(password, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
