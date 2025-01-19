import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import groundImg from "../../assets/ground.png";
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

    function preload() {
      this.load.image("monkey", monkeyImg);
      this.load.image("ground", groundImg);
    }

    function create(data) {
      // Create the tree as a vertical rectangle
      tree = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight *.9,
        50,
        150,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1); // Anchor the tree's origin to the bottom center
      this.physics.add.existing(tree, true);

      // Create the monkey sprite with physics
      const startY = data && data.y ? data.y : window.innerHeight *.775; // Use passed y position or default
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
      // this.physics.add.collider(monkey, tree);

      // Set up keyboard input for monkey movement
      cursors = this.input.keyboard.createCursorKeys();

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

      if (monkey.x >= (window.innerWidth*0.95)) { 
        this.scene.start('Shop', { x: monkey.x, y: monkey.y });
      }

      if (this.physics.overlap(monkey, this.tree)) {
        monkey.body.setGravityY(-1000); // Disable gravity when touching the tree
        monkey.setVelocityY(0);
        console.log('tree')
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
      setTaskName(task);
      setTasks([...tasks, task]); // Add the task
      setShowTaskManager(false);
    }
  };

  const handleCancel = () => {
    setShowTaskManager(false); // Close the TaskManager without adding a task
  };

  const growTree = (task) => {
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
          treeObj.body.updateFromGameObject();
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + 10;
          const branchX =
            scene.branchSide === "left" ? treeObj.x - 100 : treeObj.x + 100;
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left"; // Alternate branch side
          
          const taskName = task?.name || "Default Task";
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            200,
            15,
            0x4a3d36
          );


          scene.add.text(branchX, branchY - 30, String(taskName || "Default Task"), {
            font: "20px Courier New",
            fill: "#000",
            fontColor: 'white',
            align: "left",
          });
          
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
          <TaskManager onAddTask={(task) => {growTree(task); handleAddTask(task);}} onCancel={handleCancel}/>
        </>
      )}
    </div>
  );
};

export default Tree;