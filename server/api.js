/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const User = require("./models/user");
const auth = require("./auth");
const socketManager = require("./server-socket");

const router = express.Router();
const Task = require("./models/Tasks");
const TreeData = require("./models/TreeData");

// Middleware to check playerId session
const checkPlayerAuth = (req, res, next) => {
  const playerId = req.session.playerId;
  if (!playerId) {
    return res.status(401).json({ message: "Player not authenticated" });
  }
  req.playerId = playerId;
  next();
};

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  res.send(req.user);
});

// POST /api/initsocket - Initialize socket for the user
router.post("/initsocket", checkPlayerAuth, async (req, res) => {
  try {
    if (req.user) {
      socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
    }
    res.send({});
  } catch (err) {
    console.error("Error initializing socket:", err);
    res.status(500).json({ message: "Error initializing socket" });
  }
});

// GET /api/tasks - Fetch tasks for the player
router.get("/tasks", checkPlayerAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ playerId: req.playerId });
    const transformedTasks = tasks.map(task => ({
      taskId: task._id,
      name: task.name,
      difficulty: task.difficulty,
    }));
    res.json(transformedTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// POST /api/tasks/save - Save task data for the player (updated)
router.post("/api/tasks/save", checkPlayerAuth, async (req, res) => {
  const { task, difficulty } = req.body;
  if (!task || !difficulty) {
    return res.status(400).json({ message: "Task and difficulty are required" });
  }

  try {
    const newTask = new Task({
      name: task,
      difficulty: difficulty,
      playerId: req.playerId,
    });
    await newTask.save();
    res.status(201).json({ message: "Task saved successfully", task: newTask });
  } catch (err) {
    console.error("Error saving task:", err);
    res.status(500).json({ message: "Error saving task" });
  }
});

// GET /api/tree - Retrieve saved tree data for the player
router.get("/tree", checkPlayerAuth, async (req, res) => {
  try {
    const treeData = await TreeData.findOne({ playerId: req.playerId });
    if (treeData) {
      return res.json(treeData);
    } else {
      const defaultTreeData = { treeHeight: 150, branches: [] };
      return res.json(defaultTreeData);
    }
  } catch (err) {
    console.error("Error fetching tree data:", err);
    res.status(500).json({ message: "Error fetching tree data" });
  }
});

// POST /api/tree/save - Save updated tree data for the player (updated)
router.post("/tree/save", checkPlayerAuth, async (req, res) => {
  const { treeHeight, branches } = req.body;
  if (treeHeight === undefined || !Array.isArray(branches)) {
    return res.status(400).json({ message: "Tree height and branches are required" });
  }

  try {
    let treeData = await TreeData.findOne({ playerId: req.playerId });
    if (!treeData) {
      treeData = new TreeData({ playerId: req.playerId });
    }
    treeData.treeHeight = treeHeight;
    treeData.branches = branches;
    await treeData.save();
    res.status(200).json({ message: "Tree data saved successfully", treeData });
  } catch (err) {
    console.error("Error saving tree data:", err);
    res.status(500).json({ message: "Error saving tree data" });
  }
});

// Catch-all for undefined API routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
