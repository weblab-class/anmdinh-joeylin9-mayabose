/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

const Task = require("./models/Tasks");
const TreeData = require("./models/TreeData");

// GET /api/tasks - Fetch tasks for the logged-in user
router.get("/tasks", async (req, res) => {
  console.log("GET /api/tasks route hit");

  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Fetch tasks from MongoDB for the logged-in user
    const tasks = await Task.find({ userId: req.user._id });

    // If no tasks are found, send an empty array
    if (tasks.length === 0) {
      console.log("No tasks found for the user");
      return res.json([]); // Return an empty array instead of hardcoded tasks
    }

    // Transform tasks from the database into the desired format
    const transformedTasks = tasks.map(task => ({
      name: task.name,
      difficulty: task.difficulty,
    }));

    console.log("Sending tasks:", transformedTasks); // Log the tasks being sent
    res.json(transformedTasks); // Respond with the tasks in the correct format
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// POST /api/tasks - Create a new task for the logged-in user
router.post("/tasks", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { name, difficulty } = req.body;
  if (!name || !difficulty) {
    return res.status(400).json({ message: "Name and difficulty are required" });
  }

  try {
    // Create a new task
    const newTask = new Task({
      name,
      difficulty,
      userId: req.user._id,  // Associate the task with the logged-in user
    });

    // Save the task to MongoDB
    await newTask.save();
    console.log("Task created:", { name, difficulty });
    res.status(201).json({ message: "Task created", task: newTask }); // Return the full task object
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Error creating task" });
  }
});

// GET /api/tree - Retrieve saved tree and branch data for the logged-in user
router.get("/tree", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const treeData = await TreeData.findOne({ userId: req.user._id });

    if (treeData) {
      // If data exists for this user, return it
      return res.json(treeData);
    } else {
      // If no data is found, send a default tree state
      const defaultTreeData = {
        treeHeight: 150, // Default starting height
        branches: [], // No branches initially
      };
      return res.json(defaultTreeData);
    }
  } catch (err) {
    console.error("Error fetching tree data:", err);
    res.status(500).json({ message: "Error fetching tree data" });
  }
});

// POST /api/tree - Save updated tree and branch data for the logged-in user
router.post("/tree", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { treeHeight, branches } = req.body;
  if (treeHeight === undefined || !Array.isArray(branches)) {
    return res.status(400).json({ message: "Tree height and branches are required" });
  }

  try {
    // Find existing tree data for the user or create a new entry
    let treeData = await TreeData.findOne({ userId: req.user._id });
    if (!treeData) {
      treeData = new TreeData({ userId: req.user._id });
    }

    // Update tree height and branches
    treeData.treeHeight = treeHeight;
    treeData.branches = branches;

    // Save the tree data
    await treeData.save();

    console.log("Tree data saved:", { treeHeight, branches });
    res.status(200).json({ message: "Tree data saved successfully", treeData });
  } catch (err) {
    console.error("Error saving tree data:", err);
    res.status(500).json({ message: "Error saving tree data" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
