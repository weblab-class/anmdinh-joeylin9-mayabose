import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana.png";
import TaskManager from "../AddTask"; // Import TaskManager component

const Tree = () => {
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name
  const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list

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
      ],
      input: {
        keyboard: {
          capture: ['UP', 'DOWN', 'LEFT', 'RIGHT'], // Capture only arrow keys
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    let tree; // Variable to hold the tree object
    let branches = []; // Array to store branch objects
    let branchSide = "left"; // Track which side the next branch will appear
    let monkey; // Variable for the monkey sprite
    let camera; // Camera reference
    let upKey, downKey, leftKey, rightKey; // Custom key variables
    let ground; // Variable for the ground
    let camera; // Camera reference
    let market; // Variable for the market image

    function preload() {
      this.load.image("monkey", monkeyImg);
      this.load.image('market', marketImg); // Preload the market image
      this.load.image("banana", bananaImg); // Load banana image here
    }

    function create(data) {

      //` SHOP SCENE

      const welcomeText = this.add.text(window.innerWidth * 1.5 , window.innerHeight / 2, 'The Shop', {
        fontSize: '32px',
        fill: '#000',
      });
      welcomeText.setOrigin(0.5, 0.5); // Center the text

      const market = this.add.image(window.innerWidth * 1.5, window.innerHeight * .75, 'market');
      market.setDisplaySize(window.innerWidth/5, window.innerHeight/2.5);
      market.setOrigin(0.5, 0.5); // Center the image

      
      // TREE SCENE

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
      const startY = data && data.y ? data.y : window.innerHeight * 0.5; // Use passed y position or default
      monkey = this.physics.add.sprite(window.innerWidth * 0.94, startY, "monkey");
      monkey.setDisplaySize(100, 80);

      ground = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight * 0.9,
        window.innerWidth*3,
        window.innerHeight / 2,
        0x4caf50
      );
      ground.setOrigin(0.5, 0);
      this.physics.add.existing(ground, true); // Add static physics to the rectangle
    
      this.physics.add.collider(monkey, ground);

      // Set up custom keys for monkey movement
      upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

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
      if (leftKey.isDown) {
        monkey.setVelocityX(-750);
      } else if (rightKey.isDown) {
        monkey.setVelocityX(750);
      } else {
        monkey.setVelocityX(0); // Stop horizontal movement
      }

      if (upKey.isDown) {
        if (this.physics.overlap(monkey, this.tree)) {
          monkey.y -= 10;
        } else if (monkey.body.touching.down) {
          monkey.setVelocityY(-600);
        }
      }

      if (downKey.isDown && this.physics.overlap(monkey, this.tree)) {
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

      if (this.physics.overlap(monkey, this.tree)) {
        monkey.body.setGravityY(-1000); // Disable gravity when touching the tree
        monkey.setVelocityY(0);
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
          const taskName = task.name || "Default Task";
  
          // Create the branch
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            200,
            15,
            0x4a3d36
          );
          scene.branches.push(branch); // Add the branch to the branches array
  
          // Determine the starting x position for bananas based on branch side
          const bananaStartX =
            scene.branchSide === "left"
              ? branchX - 100 // Leftmost side of the left branch
              : branchX + 100 - 50 * (task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3); // Rightmost side of the right branch
  
          // Add task text to the branch
          scene.add.text(branchX, branchY - 20, taskName, {
            font: "20px Courier New",
            fill: "#000",
            align: "center",
          });
  
          // Add bananas based on difficulty, spaced horizontally
          const bananaCount =
            task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
          const bananaSpacing = 50; // Horizontal spacing between bananas
          for (let i = 0; i < bananaCount; i++) {
            const banana = scene.add.sprite(
              bananaStartX + i * bananaSpacing, // Offset each banana by spacing
              branchY, // Slightly above the branch
              "banana"
            );
            banana.setOrigin(0.5, 0.5);
            banana.setDisplaySize(50, 50); // Adjust the size as needed
            banana.setDepth(10); // Ensure it appears in front of other objects
          }
  
          // Alternate branch side for the next branch
          scene.branchSide = scene.branchSide === "left" ? "right" : "left";
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
          <TaskManager onAddTask={(task) => {growTree(task); handleAddTask(task);}} onCancel={handleCancel}/>
        </>
      )}
    </div>
  );
};

export default Tree;
