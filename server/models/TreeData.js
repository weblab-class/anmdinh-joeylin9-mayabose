const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Assuming a 'User' model exists for your accounts
    required: true,
  },
  height: {
    type: Number,
    required: true,  // Height of the tree
  },
  branches: [
    {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  ],  // An array of branch objects (with x and y coordinates)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TreeData = mongoose.model("TreeData", treeSchema);

module.exports = TreeData;
