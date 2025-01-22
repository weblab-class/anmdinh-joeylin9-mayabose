import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import axios from "axios";
import monkeyImg from "../../assets/monkey.png";
import groundImg from "../../assets/ground.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Shop from './Shop'; // Import Shop scene
import { useNavigate } from "react-router-dom";

// Create an Axios instance with a custom base URL
const api = axios.create({
  baseURL: "http://localhost:3000", // Set base URL for the API
});

const Tree = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken'); // Get the token from local storage
  const userID = localStorage.getItem('userId'); // Get the userID from local storage

  // Check if token or userID is missing and redirect immediately
  useEffect(() => {
    if (!token || !userID) {
      console.log("Missing token or userID, redirecting to homepage...");
      navigate("/"); // This should redirect to the homepage
    }
  }, [token, navigate]);

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name
  const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list
  const [treeState, setTreeState] = useState({
    height: 150, // Initialize height
    branches: [], // Initialize branches
  });
  const gameRef = useRef(null); // Ref to track the Phaser game instance

  // Fetch tasks and tree data only if token is available
  useEffect(() => {
    // Fetch tasks and tree data only if token and userID are available
    if (token && userID) {
      // Fetch tree data
      axios
        .get("/api/tree", {
          params: { userId: userID },
          headers: { Authorization: `Bearer ${token}` } // Ensure token is passed in the header
        })
        .then((response) => {
          console.log("Fetched tree data from backend:", response.data);
          const { tree } = response.data;
          setTreeState(tree || { height: 150, branches: [] }); // Ensure treeState is initialized
        })
        .catch((error) => {
          console.error("Error fetching tree data:", error);
          if (error.response && error.response.status === 401) {
            navigate("/"); // Redirect if Unauthorized
          }
        });

      // Fetch tasks data
      axios
        .get("/api/tasks", {
          params: { userId: userID },
          headers: { Authorization: `Bearer ${token}` } // Ensure token is passed in the header
        })
        .then((response) => {
          console.log("Fetched tasks from backend:", response.data);
          const { tasks } = response.data;
          setTasks(tasks || []); // Ensure tasks is always an array
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
          if (error.response && error.response.status === 401) {
            navigate("/"); // Redirect if Unauthorized
          }
        });
    }
  }, [token, navigate, userID]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game',
      backgroundColor: '#ADD8E6',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1000 },
          debug: false,
        },
      },
      scene: [
        { key: 'Tree', preload, create, update }, // Tree scene
        Shop, // Shop scene is part of the same game
      ],
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    let tree; // Variable to hold the tree object
    let branches = []; // Array to store branch objects
    let branchSide = "left"; // Track which side the next branch will appear
    let monkey; // Variable for the monkey sprite
    let cursors; // Cursor keys for keyboard input
    let ground; // Variable for the ground
    let camera; // Camera reference

    function preload() {
      this.load.image("monkey", monkeyImg);
      this.load.image("ground", groundImg);
    }

    function create(data) {
      // Create the tree as a vertical rectangle
      tree = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight * 0.9,
        50,
        150,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center
      this.physics.add.existing(tree, true);

      // Create the monkey sprite with physics
      const startY = data && data.y ? data.y : window.innerHeight * 0.775; // Use passed y position or default
      monkey = this.physics.add.sprite(window.innerWidth * 0.94, startY, "monkey");
      monkey.setDisplaySize(100, 80);
      monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

      const mound = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight * 0.885,
        window.innerWidth,
        50,
        0x4CAF50
      );
      mound.setOrigin(0.5, 1);

      ground = this.physics.add.staticGroup();
      ground.create(window.innerWidth / 2, window.innerHeight * 0.98, 'ground').setScale(4).refreshBody();

      this.physics.add.collider(monkey, ground);

      // Set up keyboard input for monkey movement
      cursors = this.input.keyboard.createCursorKeys();

      // Save references for use in growTree
      this.tree = tree;
      this.branches = branches;
      this.branchSide = branchSide;

      // Set up the camera to follow the monkey
      camera = this.cameras.main;
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow

      setScene(this);
    }

    function update() {
      // Move the monkey left or right
      if (cursors.left.isDown) {
        monkey.setVelocityX(-750);
      } else if (cursors.right.isDown) {
        monkey.setVelocityX(750);
      } else {
        monkey.setVelocityX(0); // Stop horizontal movement
      }

      if (cursors.up.isDown) {
        if (this.physics.overlap(monkey, this.tree)) {
          monkey.y -= 10;
        } else if (monkey.body.touching.down) {
          monkey.setVelocityY(-600);
        }
      }

      if (cursors.down.isDown && this.physics.overlap(monkey, this.tree)) {
        // Prevent the monkey from moving beneath the ground level
        if (monkey.y < window.innerHeight * 0.770) {
          monkey.y += 10;
        }
      }

      // Check if the monkey has reached the top of the tree
      if (monkey.y <= tree.y - tree.height / 2) {
        // Scroll the view up by adjusting the camera position
        camera.scrollY -= 5; // Adjust this value for the desired scroll speed
      }

      if (monkey.x >= window.innerWidth * 0.95) {
        this.scene.start('Shop', { x: monkey.x, y: monkey.y });
      }

      if (this.physics.overlap(monkey, this.tree)) {
        monkey.body.setGravityY(-1000); // Disable gravity when touching the tree
        monkey.setVelocityY(0);
        console.log('tree');
      } else {
        monkey.body.setGravityY(0); // Re-enable gravity when not touching the tree
      }
    }

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const handleAddTask = (task) => {
    if (task) {
      setTasks([...tasks, task]); // Add the task to the tasks list
      growTree(); // Grow the tree
    }
    setShowTaskManager(false); // Close TaskManager
  };

  const handleCancel = () => {
    setShowTaskManager(false); // Close the TaskManager without adding a task
  };

  const growTree = () => {
    if (scene && scene.tree) {
      const treeObj = scene.tree;
      const newHeight = treeObj.height + 150; // Increased height growth for a more noticeable change

      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          // Ensure that the rectangle's size is updated
          treeObj.setSize(50, treeObj.height);
          treeObj.body.updateFromGameObject();
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + 10;
          const branchX =
            scene.branchSide === "left" ? treeObj.x - 100 : treeObj.x + 100;
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left"; // Alternate branch side

          const branch = scene.add.rectangle(
            branchX,
            branchY,
            200,
            15,
            0x4a3d36
          );
          scene.branches.push(branch); // Add the branch to the branches array
        },
      });
    }
  };

  return (
    <div>
      <button onClick={() => setShowTaskManager(true)}>Add Task</button>
      <button onClick={() => setShowAllTasks(!showAllTasks)}>
        {showAllTasks ? "Hide Tasks" : "Show All Tasks"}
      </button>

      {/* Show the task list if "All Tasks" is clicked */}
      {showAllTasks && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f4f4f4" }}>
          <h4>All Tasks</h4>
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                <strong>{task.name}</strong> - {task.difficulty}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        id="phaser-game"
        style={{
          width: "100%",
          height: "100vh",
          border: "1px solid black",
          position: "relative",
        }}
      />
      {showTaskManager && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
            onClick={handleCancel}
          />
          <TaskManager onAddTask={handleAddTask} onCancel={handleCancel} />
        </>
      )}
    </div>
  );
};

export default Tree;
