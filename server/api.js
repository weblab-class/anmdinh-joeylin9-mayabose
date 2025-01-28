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
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const gameInfo = await GameInfo.findOne({ userId });

    if (!gameInfo) {
      // Return default values if no game info exists
      return res.json({
        numBananas: 0,
        tasks: [],
        purchasedMonkeys: [true, false, false, false],
        selectedMonkey: 0,
      });
    }

    res.json(gameInfo); // Return all fields, including the new ones
  } catch (err) {
    console.error("Error fetching game info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// POST route: Accepts user input (e.g., game data) and saves to the database
router.post('/gameInfo', async (req, res) => {
  try {
    const { userId, tasks, numBananas, purchasedMonkeys, selectedMonkey } = req.body;

    if (!userId || !tasks) {
      return res.status(400).json({ message: "Missing required fields: userId or tasks" });
    }

    let gameInfo = await GameInfo.findOne({ userId });

    if (!gameInfo) {
      // Create new game info with default values
      gameInfo = new GameInfo({
        userId,
        tasks,
        numBananas: numBananas || 0,
        purchasedMonkeys: purchasedMonkeys || [true, false, false, false],
        selectedMonkey: selectedMonkey || 0,
      });

      await gameInfo.save();
      return res.status(201).json({ message: 'Game info created successfully', data: gameInfo });
    }

    // Update existing game info
    gameInfo.tasks = tasks.map(task => {
      const existingTask = gameInfo.tasks.find(t => t._id && t._id.toString() === task._id);
      return existingTask ? { ...task, createdAt: existingTask.createdAt } : { ...task, createdAt: new Date() };
    });

    gameInfo.numBananas = numBananas;
    gameInfo.purchasedMonkeys = purchasedMonkeys || gameInfo.purchasedMonkeys;
    gameInfo.selectedMonkey = selectedMonkey || gameInfo.selectedMonkey;

    await gameInfo.save();
    res.status(200).json({ message: 'Game info updated successfully', data: gameInfo });
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
