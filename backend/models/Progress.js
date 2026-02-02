const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    role: { 
      type: String, 
      required: true 
    },

    // ONLY dynamic progress
    topics: [
      {
        topicId: { 
          type: String, 
          required: true 
        },

        completedResources: {
          type: [String],   // ["html1", "html2"]
          default: []
        }
      }
    ]
  },
  { timestamps: true }
);

// One document per user per role
ProgressSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
