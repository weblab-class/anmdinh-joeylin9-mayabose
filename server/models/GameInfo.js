const mongoose = require("mongoose");

// Define the game schema
const gameSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Assuming a 'User' model exists for your accounts
    required: true,
  },
  tasks: [
    {
      name: { type: String, required: true }, // Task name
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true }, // Task difficulty
      notes: { type: String }, // Additional notes
    }
  ],
  numBananas: {
    type: Number, // Use Number instead of Int16Array for simplicity
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation timestamp
  },
});

// Create and export the model
const GameInfo = mongoose.model("GameInfo", gameSchema);

module.exports = GameInfo;
