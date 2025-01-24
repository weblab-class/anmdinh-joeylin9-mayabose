const mongoose = require("mongoose");

// Define the game schema
const gameSchema = new mongoose.Schema(
  {
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
        createdAt: {
          type: Date,
          default: Date.now, // Automatically set creation timestamp for each task
        },
      },
    ],
    numBananas: {
      type: Number, // Use Number for simplicity
      required: true,
      default: 0,
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` for the whole document
);

// Create and export the model
const GameInfo = mongoose.model("GameInfo", gameSchema);

module.exports = GameInfo;
