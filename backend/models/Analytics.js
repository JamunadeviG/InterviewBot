const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for analytics queries
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ action: 1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
