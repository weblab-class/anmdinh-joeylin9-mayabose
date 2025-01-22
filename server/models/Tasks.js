// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // 'name' is required
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],  // The difficulty must be one of these values
    required: true,  // 'difficulty' is required
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Assuming a 'User' model exists for your accounts
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
