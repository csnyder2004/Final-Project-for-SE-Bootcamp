// backend/models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },

    // 👇 NEW: Category field
    category: {
      type: String,
      required: true,
      default: "General",   // ensures old posts still work
      trim: true,
      index: true,
    },

    // Assuming you already set author like this; keep your existing structure
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
