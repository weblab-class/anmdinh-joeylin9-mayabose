import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import monkeyImg2 from "../../assets/monkey2.png";
import monkeyImg3 from "../../assets/monkey3.png";
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Popup from "../PopUp";

const Tree = () => {
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name
  const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list
  // Add state to manage popup visibility and input
  const [popupVisible, setPopupVisible] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [onBranch, setOnBranch] = useState(false); // Tracks if the monkey is currently on a branch
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Update the input value when the user types
  };

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
    let ground; // Variable for the ground
    let mound; // Variable for the mound
    let camera; // Camera reference
    let market; // Variable for the market image
    let shopContainer; // Container for the shop UI
    let monkeyMovementEnabled = true;
    let monkeyDisplay; // Reference to the monkey display in the shop
    let monkeysAvailable = ['monkey1', 'monkey2', 'monkey3']; // Reference to the monkey number in the shop
    let monkeyNumber = 0; // Reference to the monkey number in the shop

    function preload() {
      this.load.image('monkey1', monkeyImg); // Preload the monkey image
      this.load.image('monkey2', monkeyImg2); // Preload the monkey image
      this.load.image('monkey3', monkeyImg3); // Preload the monkey image
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

      market = this.add.image(window.innerWidth * 1.5, window.innerHeight * .75, 'market');
      market.setDisplaySize(window.innerWidth/5, window.innerHeight/2.5);
      market.setOrigin(0.5, 0.5); // Center the image
      this.physics.add.existing(market, true);

      
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

      // Save references for use in growTree
      this.tree = tree;
      this.branches = branches;
      this.branchSide = branchSide;

      // Create the monkey sprite with physics
      monkey = this.physics.add.sprite(window.innerWidth /2 , window.innerHeight/2, "monkey1");
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

      mound = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight * 0.89,
        window.innerWidth*3,
        window.innerHeight / 2,
        0x4caf50
      );
      mound.setOrigin(0.5, 0);
      this.physics.add.existing(mound, true); // Add static physics to the rectangle

      // Set up custom keys for monkey movement
      this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);


      // Set up the camera to follow the monkey
      camera = this.cameras.main;
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow

      // Set up the camera to follow the monkey
      camera = this.cameras.main;
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow

      // Create the shop container (initially off-screen to the right)
      shopContainer = this.add.container(window.innerWidth * 1.5, window.innerHeight / 2);
      shopContainer.setVisible(false);

      // Add a background to the shop container
      const shopBackground = this.add.rectangle(0, 0, window.innerWidth/2.5, window.innerHeight/2, 0xffffff, 1);
      shopBackground.setOrigin(0.5, 0.5);
      shopContainer.add(shopBackground);

      // Add some text to the shop container
      const shopText = this.add.text(0, -shopBackground.height / 2, 'Customization Shop', { fontSize: '32px', fill: '#000' });
      shopText.setOrigin(0.5, -0.5);
      shopContainer.add(shopText);

      // Add a close button to the shop container
      const closeButton = this.add.text(shopBackground.width / 2, -shopBackground.height / 2, 'x', { fontSize: '24px', fill: '#000' });
      closeButton.setOrigin(2, -0.5);
      closeButton.setInteractive();
      closeButton.on('pointerdown', () => {
        closeShop(); // Call function to handle shop closing
      });
      shopContainer.add(closeButton);

      // Add overlap detection between monkey and market
      this.physics.add.overlap(monkey, market, () => {
        openShop(); // Call function to handle shop opening
      });
      

      // Create arrow buttons to change monkey image
      const leftArrow = this.add.text(-100, 0, '<', { fontSize: '32px', fill: '#000' });
      leftArrow.setOrigin(1, 0.5);
      leftArrow.setInteractive();
      leftArrow.on('pointerdown', () => changeMonkey(-1)); // Change monkey to previous image
      shopContainer.add(leftArrow);

      const rightArrow = this.add.text(100, 0, '>', { fontSize: '32px', fill: '#000' });
      rightArrow.setOrigin(0, 0.5);
      rightArrow.setInteractive();
      rightArrow.on('pointerdown', () => changeMonkey(1)); // Change monkey to next image
      shopContainer.add(rightArrow);

      monkeyDisplay = this.add.sprite(0, 0, "monkey1");
      monkeyDisplay.setDisplaySize(100, 80);
      shopContainer.add(monkeyDisplay);

      // Add overlap detection between monkey and market
      this.physics.add.overlap(monkey, market, () => {
        openShop(); // Call function to handle shop opening
      });

      setScene(this);
    }

    function changeMonkey(direction) {
      let newIndex = monkeyNumber + direction;

      if (newIndex < 0) {
        newIndex = monkeysAvailable.length - 1;
      } else if (newIndex >= monkeysAvailable.length) {
        newIndex = 0;
      }

      monkeyNumber = newIndex;
      monkeyDisplay.setTexture(monkeysAvailable[monkeyNumber]);
      monkey.setTexture(monkeysAvailable[monkeyNumber]);
    }
  
    function openShop() {
      console.log('Opening shop...');
      monkeyMovementEnabled = false; // Disable monkey movement
      monkey.x = window.innerWidth*1.2
      monkey.y = window.innerHeight * .8
      shopContainer.setVisible(true);
      camera.stopFollow(); // Stop following the monkey
      camera.pan(shopContainer.x, shopContainer.y, 500, 'Linear', true); // Pan to shop container
    }
    
    // Function to close the shop and return the camera to follow the monkey
    function closeShop() {
      console.log('Closing shop...');
      monkeyMovementEnabled = true; // Re-enable monkey movement
      shopContainer.setVisible(false);
      camera.pan(monkey.x, monkey.y, 500, 'Linear', true); // Pan back to the monkey
      camera.once('camerapancomplete', () => {
        camera.startFollow(monkey, true, 0.1, 0.1); // Resume following the monkey
      });
    }

    function update() {
      if (monkeyMovementEnabled) {
        // Process monkey movement
        if (this.leftKey.isDown) {
          monkey.setVelocityX(-750);
        } else if (this.rightKey.isDown) {
          monkey.setVelocityX(750);
        } else {
          monkey.setVelocityX(0); // Stop horizontal movement
        }
    
        if (this.upKey.isDown && monkey.body.touching.down) {
          monkey.setVelocityY(-600); // Jump
        }
      } else {
        // Disable movement
        console.log('stopped');
        monkey.setVelocityX(0);
        monkey.setVelocityY(0); // Stop vertical movement as well if necessary
      }

      if (this.downKey.isDown && this.physics.overlap(monkey, this.tree)) {
        // Prevent the monkey from moving beneath the ground level
        if (!this.physics.overlap(monkey, mound)) {
          monkey.y += 10;
        }
      }

      if (this.upKey.isDown && this.physics.overlap(monkey, this.tree)) {
        monkey.y -= 10;
      }
    
      // Check if the monkey is on the tree or a branch, and disable gravity
      if (this.physics.overlap(monkey, this.tree) ||
          this.branches.some(branch => this.physics.overlap(monkey, branch))) {
        monkey.body.setGravityY(-1000); // Disable gravity when on tree or branch
        monkey.setVelocityY(0); // Stop any downward movement
      } else {
        monkey.body.setGravityY(0); // Re-enable gravity when not on the tree/branch
      }

      if (this.branches.some(branch => this.physics.overlap(monkey, branch))) {
          setPopupVisible(true);
        }
       else {
        // Hide the popup when the monkey is not on any branch
        setPopupVisible(false);
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

  const handleSubmit = () => {
    console.log("Task Submitted:", inputValue); // You can handle the task submission here
    //setPopupVisible(false);
     // process data
  };

  
  const growTree = (task) => {
    if (scene && scene.tree) {
      const treeObj = scene.tree;
      const newHeight = treeObj.height + 150;
  
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
  
          // Add the branch to the branches array and physics world
          if (scene && scene.branches) {
            scene.branches.push(branch);
          }
          
          scene.physics.add.existing(branch, true); // Enable physics for the branch
          branch.body.updateFromGameObject(); // Update the body to reflect the current game object

          // // Add a collider between the monkey and the branch
  
          // Determine the starting x position for bananas based on branch side
          const bananaStartX =
            scene.branchSide === "left"
              ? branchX - 100
              : branchX + 100 - 50 * (task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3);
  
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
              bananaStartX + i * bananaSpacing,
              branchY,
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
          <TaskManager onAddTask={(task) => { growTree(task); handleAddTask(task); }} onCancel={handleCancel} />
      </>
      )}
          
          {popupVisible && (
              <Popup
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                setPopupVisibility={setPopupVisible}
                style={{
                  zIndex: 1000, // Ensure this is higher than any other elements
                }}
              />
      )}
    </div>
  );
}
  
export default Tree;
