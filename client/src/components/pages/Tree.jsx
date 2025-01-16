import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Shop from './Shop'; // Import Shop scene

const Tree = () => {
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name

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
          gravity: { y: 0},
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
    let keys; // WASD keys for keyboard input
    let ground; // Variable for the ground

    function preload() {
      this.load.image("monkey", monkeyImg);
    }

    function create(data) {
      // Create the tree as a vertical rectangle
      tree = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 60,
        50,
        150,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center

      // Create the monkey sprite with physics
      const startY = data && data.y ? data.y : window.innerHeight - 100; // Use passed y position or default
      monkey = this.physics.add.image(window.innerWidth*.94, startY, "monkey"); // Initial position
      monkey.setDisplaySize(100, 80);
      monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen
      
      // Create the ground as a green rectangle
      ground = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 10,
        window.innerWidth,
        50,
        0x228b22
      ).setOrigin(0.5, 1);

      // // Create the monkey sprite with physics
      // monkey = this.physics.add
      //   .image(window.innerWidth / 2, window.innerHeight - 60, "monkey")
      //   .setScale(0.075)
      //   .setOrigin(0.5, 1)
      //   .setCollideWorldBounds(true);

      // monkey.body.setAllowGravity(false); // Disable gravity for the monkey initially
      // this.physics.add.collider(monkey, ground);

      // Set up keyboard input for monkey movement
      cursors = this.input.keyboard.createCursorKeys();
      // keys = this.input.keyboard.addKeys("W,S,A,D");

      // Save references for use in growTree
      this.tree = tree;
      this.branches = branches;
      this.branchSide = branchSide;

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

      // Move the monkey up or down
      if (cursors.up.isDown) {
        monkey.setVelocityY(-750); // Move up
      } else if (cursors.down.isDown) {
        monkey.setVelocityY(750); // Move down
      } else {
        monkey.setVelocityY(0); // Stop vertical movement
      }

      if (monkey.x >= (window.innerWidth*0.95)) { 
        this.scene.start('Shop', { x: monkey.x, y: monkey.y }); // Pass monkey's position to Shop scene
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
      const treeObj = scene.tree;
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

          const branch = scene.add.rectangle(
            branchX,
            branchY,
            50,
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