const mongoose = require("mongoose");

// Define the game schema
const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming a 'User' model exists for your accounts
      required: true,
    },
    tasks: [
      {
        name: { type: String, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
        side: { type: String, enum: ["left", "right"], required: true },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    numBananas: {
      type: Number,
      required: true,
      default: 0,
    },
    purchasedMonkeys: {
      type: [Boolean], // Array of booleans to track purchases
      default: [true, false, false, false], // Default: only the first monkey is purchased
    },
    selectedMonkey: {
      type: Number, // Tracks the currently selected monkey
      default: 0, // Default to the first monkey
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` for the document
);

const GameInfo = mongoose.model("GameInfo", gameSchema);
module.exports = GameInfo;
