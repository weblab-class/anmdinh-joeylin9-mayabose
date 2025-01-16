import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";

const Tree = () => {
  const [game, setGame] = useState(null); // state to hold the Phaser game instance
  const [scene, setScene] = useState(null); // state to hold the active Phaser scene

  useEffect(() => {
    // Phaser game configurationaaa]]
    const config = {
      type: Phaser.AUTO, // Automatically choose the rendering type (WebGL or Canvas)
      width: window.innerWidth, // Set game width to the full window width
      height: window.innerHeight, // Set game height to the full window height
      parent: "phaser-game", // Attach the game canvas to the div with ID "phaser-game"
      backgroundColor: "#ADD8E6", // Set a light blue background
      physics: {
        default: "arcade", // Use arcade physics for simple 2D interactions
        arcade: {
          gravity: { y: 300 }, // Apply gravity to pull the monkey down
          debug: false, // Disable physics debugging
        },
      },
      scene: {
        preload, // Preload game assets
        create, // Set up the game scene
        update, // Game update logic (runs continuously)
      },
    };

    const newGame = new Phaser.Game(config); // Create a new Phaser game with the above configuration
    setGame(newGame); // Save the game instance in the state

    let tree; // Variable to hold the tree object
    let branches = []; // Array to store branch objects
    let branchSide = "left"; // Track which side the next branch will appear
    let monkey; // Variable for the monkey sprite
    let cursors; // Cursor keys for keyboard input
    let keys; // WASD keys for keyboard input
    let ground; // Variable for the ground

    function preload() {
      this.load.image("monkey", monkeyImg); // Preload the monkey image
    }

    function create() {
      // Create the tree as a vertical rectangle
      tree = this.add.rectangle(
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

      setScene(this); // Save the scene reference for use outside the Phaser game loop
    }

    function update() {
      // Ensure the monkey stays at the ground level (fixed y-position)
      if (monkey.y !== window.innerHeight - 60) {
        monkey.y = window.innerHeight - 60; // Reset monkey's y-position to the ground level
      }

      // Monkey movement logic
      if (cursors.left.isDown || keys.A.isDown) {
        monkey.setVelocityX(-500); // Move left
      } else if (cursors.right.isDown || keys.D.isDown) {
        monkey.setVelocityX(500); // Move right
      } else {
        monkey.setVelocityX(0); // Stop horizontal movement
      }

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

    // Clean up the Phaser game when the component unmounts
    return () => {
      newGame.destroy(true);
    };
  }, []);

  const growTree = () => {
    if (scene && scene.tree) {
      const treeObj = scene.tree; // Access the tree object from the scene
      const newHeight = treeObj.height + 150; // Increased height growth for a more noticeable change

      // Create a tween animation for growing the tree
      scene.tweens.add({
        targets: treeObj, // Target the tree object
        height: newHeight, // Set the new height
        duration: 500, // Animation duration in milliseconds
        ease: "Linear", // Linear easing for smooth animation
        onUpdate: () => {
          // Ensure the tree's width stays constant
          treeObj.setSize(50, treeObj.height); // Keep the tree's width at 50
        },
        onComplete: () => {
          // Add a new branch when the animation completes
          const branchY = treeObj.y - treeObj.height + 10; // Y-coordinate of the branch
          const branchX =
            scene.branchSide === "left"
              ? treeObj.x - 50 // Move the branch further out to the left
              : treeObj.x + 50; // Move the branch further out to the right
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
      <button onClick={growTree}>Add Task</button> {/* Button to grow the tree */}
      <div
        id="phaser-game"
        style={{
          width: "100%", // Full width
          height: "100vh", // Full height
          border: "1px solid black", // Black border
          position: "relative", // Relative positioning for layout
        }}
      />
    </div>
  );
};

export default Tree;
