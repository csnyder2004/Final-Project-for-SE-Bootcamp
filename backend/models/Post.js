import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // 🏷️ Post Title
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 150,
    },

    // 📝 Post Content
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: 5000,
    },

    // 🗂️ Category (for filtering/grouping)
    category: {
      type: String,
      required: true,
      default: "Game Day Talk",
      trim: true,
      index: true,
      enum: [
        "Game Day Talk",
        "Players & Recruiting",
        "Stats & Analysis",
        "Vols History",
        "SEC Rivalries",
        "Fan Zone",
      ],
    },

    // 👤 Linked Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
    versionKey: false, // Removes "__v" field for cleaner responses
  }
);

// 🔍 Optional: text index for search functionality
postSchema.index({ title: "text", content: "text", category: 1 });

export default mongoose.model("Post", postSchema);
