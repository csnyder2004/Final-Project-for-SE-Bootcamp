import mongoose from "mongoose";

// =======================
// 🧩 User Schema
// =======================
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // ⛔️ hide password by default for safety
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
    versionKey: false, // removes "__v"
  }
);

// =======================
// 🧠 Indexing for faster lookups
// =======================
userSchema.index({ email: 1, username: 1 });

// =======================
// 🔄 Normalize before save
// (ensures consistent lowercase email + trimmed username)
// =======================
userSchema.pre("save", function (next) {
  if (this.isModified("email")) this.email = this.email.toLowerCase().trim();
  if (this.isModified("username")) this.username = this.username.trim();
  next();
});

// =======================
// ✅ Model Export
// =======================
export default mongoose.model("User", userSchema);
