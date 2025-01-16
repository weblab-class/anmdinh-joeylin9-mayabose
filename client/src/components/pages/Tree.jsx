import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";

const Tree = () => {
  const [game, setGame] = useState(null); // state to hold the Phaser game instance
  const [scene, setScene] = useState(null); // state to hold the active Phaser scene

  useEffect(() => {
    // Phaser game configuration
    const config = {
      type: Phaser.AUTO, // Automatically choose the rendering type (WebGL or Canvas)
      width: window.innerWidth, // Set game width to the full window width
      height: window.innerHeight, // Set game height to the full window height
      parent: "phaser-game", // Attach the game canvas to the div with ID "phaser-game"
      backgroundColor: "#ADD8E6", // Set a light blue background
      physics: {
        default: "arcade", // Use arcade physics for simple 2D interactions
        arcade: {
          gravity: { y: 0 }, // Disable gravity
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

    function preload() {
      this.load.image("monkey", monkeyImg); // Preload the monkey image
    }

    function create() {
      // Create the tree as a vertical rectangle
      tree = this.add.rectangle(
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 60, // Near the bottom (y-axis)
        50, // Width of the tree (updated from 10 to 50)
        50, // Initial height of the tree
        0x4a3d36 // Brown color for the tree
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center

      // Create the ground as a green rectangle
      this.add.rectangle(
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 10, // Bottom of the screen (y-axis)
        window.innerWidth, // Full screen width
        50, // Height of the ground
        0x228b22 // Green color for the ground
      ).setOrigin(0.5, 1);

      // Create the monkey sprite with physics
      monkey = this.physics.add.image(400, 300, "monkey"); // Initial position
      monkey.setScale(0.1); // Scale down the monkey size
      monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

      // Set up keyboard input
      cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
      keys = this.input.keyboard.addKeys("W,S,A,D"); // WASD keys

      // Save references for use in growTree
      this.tree = tree; // Save the tree object in the scene
      this.branches = branches; // Save the branches array
      this.branchSide = branchSide; // Save the branch side tracker

      setScene(this); // Save the scene reference for use outside the Phaser game loop
    }

    function update() {
      // Move the monkey left or right
      if (cursors.left.isDown || keys.A.isDown) {
        monkey.setVelocityX(-500); // Move left
      } else if (cursors.right.isDown || keys.D.isDown) {
        monkey.setVelocityX(500); // Move right
      } else {
        monkey.setVelocityX(0); // Stop horizontal movement
      }

      // Move the monkey up or down
      if (cursors.up.isDown || keys.W.isDown) {
        monkey.setVelocityY(-500); // Move up
      } else if (cursors.down.isDown || keys.S.isDown) {
        monkey.setVelocityY(500); // Move down
      } else {
        monkey.setVelocityY(0); // Stop vertical movement
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
      const newHeight = treeObj.height + 50; // Increase the tree height by 50 pixels

      // Create a tween animation for growing the tree
      scene.tweens.add({
        targets: treeObj, // Target the tree object
        height: newHeight, // Set the new height
        duration: 500, // Animation duration in milliseconds
        ease: "Linear", // Linear easing for smooth animation
        onUpdate: () => {
          treeObj.setSize(50, treeObj.height); // Keep the width at 50, update the height dynamically
        },
        onComplete: () => {
          // Add a new branch when the animation completes
          const branchY = treeObj.y - treeObj.height + 10; // Y-coordinate of the branch
          const branchX =
            scene.branchSide === "left"
              ? treeObj.x - 20 // Branch on the left
              : treeObj.x + 20; // Branch on the right
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left"; // Alternate branch side

          // Create a new branch as a brown rectangle
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            30, // Width of the branch
            5, // Height of the branch
            0x8b4513 // Brown color for the branch
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
