import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import TaskManager from "../AddTask"; // Import TaskManager component

const Tree = () => {
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name


  useEffect(() => {
    // Phaser game configurationaaa]]
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-game",
      backgroundColor: "#ADD8E6",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 }, // Apply gravity to pull the monkey down
          debug: false, // Disable physics debugging
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    let tree; // Variable to hold the tree object
    let branches = []; // Array to store branch objects
    let branchSide = "left"; // Track which side the next branch will appear
    let monkey; // Variable for the monkey sprite
    let cursors; // Cursor keys for keyboard input
    let keys; // WASD keys for keyboard input
    let ground; // Variable for the ground

    function preload() {
      this.load.image("monkey", monkeyImg);
    }

    function create() {
      tree = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 60,
        50,
        50,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1);

      this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 10,
        window.innerWidth,
        50,
        0x228b22
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 60, // Near the bottom (y-axis)
        50, // Width of the tree
        150, // Height of the tree
        0x4a3d36 // Brown color for the tree (same color for branches)
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center

      // Create the ground as a green rectangle
      ground = this.add.rectangle(
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 10, // Bottom of the screen (y-axis)
        window.innerWidth, // Full screen width
        50, // Height of the ground
        0x228b22 // Green color for the ground
      ).setOrigin(0.5, 1);

      // Create the monkey sprite with physics, positioned just above the ground
      monkey = this.physics.add.image(window.innerWidth / 2, window.innerHeight - 60, "monkey"); // Initial position
      monkey.setScale(0.075); // Scale down the monkey size
      monkey.setOrigin(0.5, 1); // Set origin to bottom, so feet are aligned with the ground
      monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

      // Set gravity to pull the monkey down (it will be handled manually)
      monkey.body.setAllowGravity(false); // Disable gravity for the monkey initially

      // Add a collider for the monkey and ground
      this.physics.add.collider(monkey, ground);

      // Set the monkey's depth to ensure it's on top of the tree and branches
      monkey.setDepth(1);

      // Set up keyboard input for monkey movement
      cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
      keys = this.input.keyboard.addKeys("W,S,A,D"); // WASD keys

      // Save references for use in growTree
      this.tree = tree; // Save the tree object in the scene
      this.branches = branches; // Save the branches array
      this.branchSide = branchSide; // Save the branch side tracker

      setScene(this);
    }

    function update() {
      // Ensure the monkey stays at the ground level (fixed y-position)
      if (monkey.y !== window.innerHeight - 60) {
        monkey.y = window.innerHeight - 60; // Reset monkey's y-position to the ground level
      }

      // Monkey movement logic
      if (cursors.left.isDown || keys.A.isDown) {
        monkey.setVelocityX(-500);
      } else if (cursors.right.isDown || keys.D.isDown) {
        monkey.setVelocityX(500);
      } else {
        monkey.setVelocityX(0);
      }

      if (cursors.up.isDown || keys.W.isDown) {
        monkey.setVelocityY(-500);
      } else if (cursors.down.isDown || keys.S.isDown) {
        monkey.setVelocityY(500);
      } else {
        monkey.setVelocityY(0);
      // Jumping logic
      if ((cursors.up.isDown || keys.W.isDown) && monkey.body.touching.down) {
        monkey.body.setAllowGravity(true); // Enable gravity for jumping
        monkey.setVelocityY(-500); // Jump only if the monkey is touching the ground
      }

      // Disable gravity once the monkey lands back on the ground
      if (monkey.body.touching.down && monkey.body.velocity.y === 0) {
        monkey.body.setAllowGravity(false); // Disable gravity when on the ground
      }
    }

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const handleAddTask = (task) => {
    if (task) {
        setTaskName(task);
        setTasks([...tasks, task]); // Add the task
        growTree(); // Grow the tree
    }
    setShowTaskManager(false); // Close TaskManager
  };

  const handleCancel = () => {
    setShowTaskManager(false); // Close the TaskManager without adding a task
  };


  const growTree = () => {
    if (scene && scene.tree) {
      const treeObj = scene.tree; // Access the tree object from the scene
      const newHeight = treeObj.height + 150; // Increased height growth for a more noticeable change

      // Create a tween animation for growing the tree
      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          treeObj.setSize(50, treeObj.height);
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + 10;
          const branchX =
            scene.branchSide === "left" ? treeObj.x - 20 : treeObj.x + 20;
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left"; // Alternate branch side

          // Create a new branch with a thickness of 25 (same color as the tree)
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            50, // Set the width (thickness) of the branch to 25
            15, // Height of the branch
            0x4a3d36 // Same brown color for the branch as the tree
          );
          scene.branches.push(branch); // Add the branch to the branches array
        },
      });
    }
  };

  return (
    <div>
      <button onClick={() => setShowTaskManager(true)}>Add Task</button>
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
            onClick={handleCancel} // Close the popup when clicking outside
          />
          <TaskManager onAddTask={handleAddTask} onCancel={handleCancel} />
        </>
      )}
    </div>
  );
};

export default Tree;
