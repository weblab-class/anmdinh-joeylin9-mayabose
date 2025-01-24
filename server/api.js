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
// const Task = require("./models/Tasks");
// const TreeData = require("./models/TreeData");
const GameInfo = require("./models/GameInfo");

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

// GET route: Fetch game data for a user (e.g., from database)
router.get('/gameInfo', async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    console.log("userId:", userId);
    console.log("!userId is:", !userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Fetch game info for the user from the database
    const gameInfo = await GameInfo.findOne({ userId });

    // If no game info is found, return an object with numBananas set to 0
    if (!gameInfo) {
      return res.json({ numBananas: 0, tasks: [] }); // Ensure tasks is also an empty array
    }

    // Return the gameInfo object if found
    res.json(gameInfo);
  } catch (err) {
    console.error("Error fetching game info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// POST route: Accepts user input (e.g., game data) and saves to the database
router.post('/gameInfo', async (req, res) => {
  try {
    const { userId, tasks, numBananas } = req.body;  // Data sent in POST request body
    console.log("Received game data:", { userId, tasks, numBananas });

    if (!userId || !tasks) {
      return res.status(400).json({ message: "Missing required fields: userId or tasks" });
    }

    // Check if the user already has game info
    let gameInfo = await GameInfo.findOne({ userId });

    if (!gameInfo) {
      // If no game info exists for the user, create a new gameInfo document
      gameInfo = new GameInfo({
        userId,
        tasks: tasks,  // Start with the list of tasks
        numBananas: numBananas || 0,  // Default numBananas value
      });
      await gameInfo.save();  // Save the new game info
      return res.status(201).json({ message: 'Game info created and tasks added', data: gameInfo });
    }

    // If game info exists, update the tasks list
    gameInfo.tasks = tasks;  // Replace tasks with the new list
    gameInfo.numBananas = numBananas;  // Optionally update numBananas
    await gameInfo.save();  // Save the updated game info

    res.status(200).json({ message: 'Tasks updated successfully', data: gameInfo });

  } catch (err) {
    console.error("Error saving game info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Catch-all for undefined API routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
