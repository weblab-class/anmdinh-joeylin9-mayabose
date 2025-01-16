import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import TaskManager from "../AddTask"; // Import TaskManager component

const Tree = () => {
  const [game, setGame] = useState(null); // State to hold the Phaser game instance
  const [scene, setScene] = useState(null); // State to hold the active Phaser scene
  const [showTaskManager, setShowTaskManager] = useState(false); // State to toggle TaskManager visibility
  const [tasks, setTasks] = useState([]); // State to hold tasks

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-game",
      backgroundColor: "#ADD8E6",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
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

    let tree;
    let branches = [];
    let branchSide = "left";
    let monkey;
    let cursors;
    let keys;

    function preload() {
      this.load.image("monkey", monkeyImg);
    }

    function create() {
      tree = this.add.rectangle(
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 60, // Near the bottom (y-axis)
        50, // Width of the tree
        150, // Increased height of the tree for a more noticeable growth
        0x4a3d36 // Brown color for the tree (same color for branches)
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center

      // Create the ground as a green rectangle
      this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 10,
        window.innerWidth,
        50,
        0x228b22
      ).setOrigin(0.5, 1);

      // Create the monkey sprite with physics
      monkey = this.physics.add.image(400, 300, "monkey"); // Initial position
      monkey.setScale(0.1); // Scale down the monkey size
      monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

      // Set the monkey's depth to ensure it's on top of the tree and branches
      monkey.setDepth(1);

      // Set up keyboard input
      cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
      keys = this.input.keyboard.addKeys("W,S,A,D"); // WASD keys

      // Save references for use in growTree
      this.tree = tree; // Save the tree object in the scene
      this.branches = branches; // Save the branches array
      this.branchSide = branchSide; // Save the branch side tracker

      setScene(this);
    }

    function update() {
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
      }
    }

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const growTree = () => {
    if (scene && scene.tree) {
      const treeObj = scene.tree; // Access the tree object from the scene
      const newHeight = treeObj.height + 150; // Increased height growth for a more noticeable change

      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          // Ensure the tree's width stays constant
          treeObj.setSize(50, treeObj.height); // Keep the tree's width at 50
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + 10;
          const branchX =
            scene.branchSide === "left"
              ? treeObj.x - 50 // Move the branch further out to the left
              : treeObj.x + 50; // Move the branch further out to the right
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left";

          // Create a new branch with a thickness of 25 (same color as the tree)
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            50, // Set the width (thickness) of the branch to 25
            15, // Height of the branch
            0x4a3d36 // Same brown color for the branch as the tree
          );
          scene.branches.push(branch);
        },
      });
    }
  };

  const handleAddTask = (task) => {
    setTasks([...tasks, task]); // Add the task to the list
    setShowTaskManager(false); // Close the TaskManager window
  };

  return (
    <div>
      <button onClick={() => setShowTaskManager(true)}>Add Task</button>
      <button onClick={growTree}>Grow Tree</button>
      <div
        id="phaser-game"
        style={{
          width: "100%",
          height: "100vh",
          border: "1px solid black",
          position: "relative",
        }}
      />
      {/* Conditionally render TaskManager */}
      {showTaskManager && (
        <TaskManager onAddTask={handleAddTask} />
      )}
    </div>
  );
};

export default Tree;