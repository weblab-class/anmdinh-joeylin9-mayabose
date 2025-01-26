import React, { useEffect, useState, useRef, useContext } from "react";
import Phaser from "phaser";
import { UserContext } from "../App";
import monkeyImg from "../../assets/monkey.png";
import monkeyImg2 from "../../assets/monkey2.png";
import monkeyImg3 from "../../assets/monkey3.png";
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana.png";
import grassImg from "../../assets/grass.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Popup from "../Popup";
// import Shop from './Shop'; // Import Shop scene
import { useNavigate } from "react-router-dom";
import { fetchGameInfo, saveTaskData } from '../gameDataHandler';

const Tree = () => {
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);  // Access context values
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name
  // const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list
  const [treeState, setTreeState] = useState({
    height: 150, // Initialize height
    branches: [], // Initialize branches
    bananas: [],
  });
  const gameRef = useRef(null); // Ref to track the Phaser game instance
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [bananaCounter, setBananaCounter] = useState(0);
  const [selectedMonkeyIndex, setSelectedMonkeyIndex] = useState(0); // Current selected monkey in the shop
  const [purchasedMonkeys, setPurchasedMonkeys] = useState([true, false, false]); // Purchase state for monkeys
  const monkeyPrices = [0, 10, 20]; // Prices for each monkey
  // Add state to manage popup visibility and input
  const [popupVisible, setPopupVisible] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [onBranch, setOnBranch] = useState(false); // Tracks if the monkey is currently on a branch
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state for tasks
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // State for settings popup
  const [selectedTaskName, setSelectedTaskName] = useState("")


  const handleInputChange = (input) => {
    setInputValue(input); // Update the input value state
    handleSave(input);  // Call the handleSave function with updated value
  };


  // Fetch game info only when userId is available
  useEffect(() => {
    if (!userId) {
      console.log("Missing userId, redirecting to homepage...");
      navigate("/"); // Redirect to homepage if userId is not available
      return;
    }

    const getGameInfo = async () => {
      try {
        const data = await fetchGameInfo(userId);
        setTasks(data.tasks || []);  // Set tasks (empty array for new users)
        setBananaCounter(data.bananaCounter || 0);  // Set banana counter
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching game info (Tree.jsx):", error);
        setLoading(false); // Set loading to false even on error
      }
    };

    getGameInfo(); // Fetch game info
  }, [userId, navigate]);

  useEffect(() => {
    if (loading) return;
    if (game) return;
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game',
      backgroundColor: '#ADD8E6',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: windowHeight*2 },
          debug: false,
        },
      },
      scene: [
        { key: 'Tree', preload, create, update }, // Tree scene
      ],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      input: {
        keyboard: {
          capture: ['UP', 'DOWN', 'LEFT', 'RIGHT'], // Capture only arrow keys
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, [loading]);

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
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
    let costText; // Reference to the cost text in the shop
    let purchaseButton; // Reference to the purchase button in the shop
    let shopOpen = false; // Track if the shop is open
    let lastChangeTime = 0;
    let bananas = [];

    // Example: Increment banana count in Phaser
    function collectBanana(numBananasCollected) {
      setBananaCounter((prev) => {
        console.log("Previous bananaCounter value:", prev); // Log the previous state
        return prev + numBananasCollected;
      });
    }

    function preload() {
      console.log('Preloading assets...');
      this.load.image('monkey1', monkeyImg); // Preload the monkey image
      this.load.image('monkey2', monkeyImg2); // Preload the monkey image
      this.load.image('monkey3', monkeyImg3); // Preload the monkey image
      this.load.image('market', marketImg); // Preload the market image
      this.load.image("banana", bananaImg); // Load banana image here
      this.load.image("grass", grassImg);
    }

    function update() {
      // Boundaries for the world
      monkey.x = Phaser.Math.Clamp(monkey.x, 344.5-2*windowWidth/3, Infinity);
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow
      camera.setBounds(-windowWidth / 2, -5000, Infinity, Infinity);
      // console.log('Monkey X:', monkey.x, 'Monkey Y:', monkey.y);

      // INFINITE BANANA COLLECTION
      const qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      qKey.on("down", () => {
        setBananaCounter((prevCount) => prevCount + 1);
      });

      // SHOP UPDATES
      if (shopOpen) {
        const currentTime = Date.now(); // Get the current time in milliseconds

        if (this.leftKey.isDown && currentTime - lastChangeTime > 100) {
          changeMonkey(-1);
          lastChangeTime = currentTime; // Update the last change time
        }

        if (this.rightKey.isDown && currentTime - lastChangeTime > 100) {
          changeMonkey(1);
          lastChangeTime = currentTime; // Update the last change time
        }
      }

      if (monkeyMovementEnabled) {
        // Process monkey movement
        if (this.leftKey.isDown) {
          monkey.setVelocityX(-windowWidth/2);
        } else if (this.rightKey.isDown) {
          monkey.setVelocityX(windowWidth/2);
        } else {
          monkey.setVelocityX(0); // Stop horizontal movement
        }

        if (this.upKey.isDown && monkey.body.touching.down) {
          monkey.setVelocityY(-windowHeight); // Jump
        }
      } else {
        // Disable movement
        monkey.setVelocityX(0);
        monkey.setVelocityY(0); // Stop vertical movement as well if necessary
      }

      if (this.downKey.isDown && this.physics.overlap(monkey, this.tree)) {
        // Prevent the monkey from moving beneath the ground level
        if (!this.physics.overlap(monkey, mound)) {
          monkey.y += windowHeight*(1/75);
        }
      }

      if (this.upKey.isDown && this.physics.overlap(monkey, this.tree)) {
        monkey.y -= windowHeight*(1/75);
      }

      // Check if the monkey is on the tree or a branch, and disable gravity
      if (this.physics.overlap(monkey, this.tree) ||
          this.branches.some(branch => this.physics.overlap(monkey, branch))) {
        monkey.body.setGravityY(-windowHeight*2); // Disable gravity when on tree or branch
        monkey.setVelocityY(0); // Stop any downward movement
      } else {
        monkey.body.setGravityY(0); // Re-enable gravity when not on the tree/branch
      }


       // Flag to track if the popup should be show

       for (const branch of this.branches) {
        const isLeftBranch = branch.x < this.tree.x; // Example condition for left branch
        const monkeyBounds = monkey.getBounds(); // Get monkey's bounds
        const branchBounds = branch.getBounds(); // Get branch's bounds

        // Check if the monkey is currently overlapping with the branch
        const isOverlapping = this.physics.overlap(monkey, branch);

        if (isOverlapping) {
          // If the monkey is overlapping, we need to display the popup for this branch
          let popupShown = false;

          // Check leftmost half of left branch
          if (
            isLeftBranch &&
            monkeyBounds.right >= branchBounds.left && // Monkey's right side touches branch's left
            monkeyBounds.right <= branchBounds.left + branchBounds.width / 2 // Within the left half
          ) {
            if (!popupShown) {
              setPopupVisible(true); // Show the popup

              // Find the text directly above the leftmost half of the left branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) && // that height above the branch
                  Math.abs(child.x - branchBounds.x) <= 50
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                console.log('Selected task name:', taskName);
              }

              popupShown = true; // Prevent multiple popups from showing for this branch
              break; // Exit the loop once the popup is shown
            }
          }

          // Check rightmost half of right branch
          if (
            !isLeftBranch &&
            monkeyBounds.left >= branchBounds.left + branchBounds.width / 2 && // Within the right half
            monkeyBounds.left <= branchBounds.right // Monkey's left side touches branch's right
          ) {
            if (!popupShown) {
              setPopupVisible(true); // Show the popup

              // Find the text directly above the rightmost half of the right branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) && // Ensure text is within 60 pixels above the branch
                  Math.abs(child.x - branchBounds.x) <= 50
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                console.log('Selected task name:', taskName);
              }

              popupShown = true; // Prevent multiple popups from showing for this branch
              break; // Exit the loop once the popup is shown
            }
          }
        }

        // If the monkey is no longer overlapping with any branch, hide the popup
        if (!isOverlapping) {
          setPopupVisible(false);
        }
      }
    }

    function create() {
      if (bananaCounter === undefined) {
        console.error('Banana counter is not initialized.');
        return;
      }
      console.log('Creating shop and game elements');

      // Tree setup based on tasks length
      const treeBaseHeight = windowHeight*(150/765);
      const treeHeight = treeBaseHeight + tasks.length * 100; // Dynamic tree height

      tree = this.add.rectangle(
        windowWidth / 2,
        windowHeight * 0.9,
        windowHeight*(50/765),
        treeHeight,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1);
      this.physics.add.existing(tree, true);

      // Save references for use in growTree
      this.tree = tree;
      this.branches = branches;
      this.bananas = bananas;
      this.branchSide = branchSide;

      // Initialize branches with tasks, ensuring bananas are added and order is reversed
      this.branches = [];
      this.bananas = [];
      tasks.reverse().forEach((task, index) => {
        // Assuming tree height is initialized at 0 or a default value
        const treeObj = this.tree;
        const branchY = treeObj.y - treeObj.height + windowHeight*(10/765) + (index * 100); // Position relative to tree height


        // Ensure task.side is used correctly for left/right placement
        const branchX = task.side === "left" ? treeObj.x - windowWidth*(100/1494) :
          treeObj.x + windowWidth*(100/1494); // Correct placement based on task.side

        // Create the branch
        const branch = this.add.rectangle(
          branchX,
          branchY,
          windowWidth*(200/1494),
          windowHeight*(15/765),
          0x4a3d36
        );

        // Add the branch to the branches array and physics world
        if (this && this.branches) {
          this.branches.push(branch);
        }

        this.physics.add.existing(branch, true); // Enable physics for the branch
        branch.body.updateFromGameObject(); // Update the body to reflect the current game object
        this.physics.add.existing(branch, true); // Enable physics for the branch
        branch.body.updateFromGameObject(); // Update the body to reflect the current game object

        // Add task text to the branch
        const taskName = task.name || "Default Task";
        const bananaStartX =
          task.side === "left"
            ? branchX - windowWidth*(100/1494) // Adjust start position for "left" side
            : branchX + windowWidth*(100/1494) - windowWidth*(50/1494) * (task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3); // Adjust for "right" side

        this.add.text(bananaStartX - windowWidth*(20/1494), branchY - windowHeight*(50/765), taskName, {
          font: windowWidth * (20 / 1494),
          fontFamily: 'Courier New',
          fill: "#000",
          align: "center",
          fontWeight: windowWidth * (80 / 1494),
        });

        // Add bananas based on difficulty, spaced horizontally
        const bananaCount =
          task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
        const bananaSpacing = windowWidth*(50/1494); // Horizontal spacing between bananas
        for (let i = 0; i < bananaCount; i++) {
          const banana = this.add.sprite(
            bananaStartX + i * bananaSpacing,
            branchY,
            "banana"
          );
          banana.setOrigin(0.5, 0.5);
          banana.setDisplaySize(windowHeight*(3/50), windowHeight*(3/50)); // Adjust the size as needed
          banana.setDepth(10); // Ensure it appears in front of other objects

          if (this && this.bananas) {
            this.bananas.push(banana);
          }
        }

        // Alternate branch side for the next branch
        this.branchSide = this.branchSide === "left" ? "right" : "left";
      });

      //` SHOP SCENE

      const welcomeText = this.add.text(windowWidth * 1.5 , windowHeight / 2, 'The Shop', {
        fontSize: windowWidth*(32/1494),
        fill: '#000',
      });
      welcomeText.setOrigin(0.5, 0.5); // Center the text

      market = this.add.image(windowWidth * 1.5, windowHeight * .75, 'market');
      market.setDisplaySize(windowWidth/5, windowHeight/2.5);
      market.setOrigin(0.5, 0.5); // Center the image
      this.physics.add.existing(market, true);

      // Create the monkey sprite with physics
      monkey = this.physics.add.sprite(windowWidth /2 , windowHeight * 0.9 - windowHeight*(45/765), "monkey1");
      monkey.setDisplaySize(windowWidth*.075, windowHeight*.1);

      ground = this.add.rectangle(
        windowWidth / 2,
        windowHeight * 0.9,
        windowWidth*3,
        windowHeight / 2,
        0x4caf50
      );
      ground.setOrigin(0.5, 0);
      this.physics.add.existing(ground, true); // Add static physics to the rectangle
      this.physics.add.collider(monkey, ground);

      mound = this.add.rectangle(
        windowWidth / 2,
        windowHeight * 0.89,
        windowWidth*3,
        windowHeight / 2,
        0x4caf50
      );
      mound.setOrigin(0.5, 0);
      this.physics.add.existing(mound, true); // Add static physics to the rectangles

      for (let i = 0; i < 100; i++) {
        const randomX = Math.random() * windowWidth*5 // Random X within screen width
        const randomWidth = Math.random() * (windowWidth*(3/40)-windowWidth*(3/100)) + (windowWidth*(3/100));
        const randomHeight = Math.random() * (windowHeight*(1/10)-windowHeight*(1/20)) + (windowHeight*(1/25));
        // Add the grass patch at the random position
        const grassPatch = this.add.image(randomX-windowWidth, windowHeight*.875, 'grass');
        grassPatch.setDisplaySize(randomWidth, randomHeight)
      }

      // Set up custom keys for monkey movement
      this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

      camera = this.cameras.main;
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow
      camera.setBounds(-windowWidth / 2, -5000, Infinity, Infinity);
      camera.setZoom(1); // Set initial zoom level (normal zoom)

      //SHOP//
      shopContainer = this.add.container(windowWidth * 1.5, windowHeight / 2);
      shopContainer.setVisible(false);

      const shopBackground = this.add.rectangle(0, 0, windowWidth/2.5, windowHeight/2, 0xffffff, 1);
      shopBackground.setOrigin(0.5, 0.5);
      shopContainer.add(shopBackground);

      const shopText = this.add.text(0, -shopBackground.height / 2, 'Customization Shop', { fontSize: windowWidth*(32/1494), fill: '#000' });
      shopText.setOrigin(0.5, -0.5);
      shopContainer.add(shopText);

      const closeButton = this.add.text(shopBackground.width / 2, -shopBackground.height / 2, 'x', { fontSize: windowWidth*(24/1494), fill: '#000' });
      closeButton.setOrigin(2, -0.5);
      closeButton.setInteractive();
      closeButton.on('pointerdown', () => {
        closeShop();
      });
      shopContainer.add(closeButton);

      purchaseButton = this.add.text(0, shopBackground.height*.4, "Purchased", { fontSize: windowWidth*(16/1494), fill: "#000" });
      purchaseButton.setOrigin(0.5, 0.5);
      purchaseButton.setInteractive();
      purchaseButton.on("pointerdown", () => purchaseMonkey());
      shopContainer.add(purchaseButton);

      const leftArrow = this.add.text(-shopBackground.width*.15, shopBackground.height*-.1, '<', { fontSize: windowWidth*(32/1494), fill: '#000' });
      leftArrow.setOrigin(1, 0.5);
      leftArrow.setInteractive();
      leftArrow.on('pointerdown', () => changeMonkey(-1)); // Change monkey to previous image
      shopContainer.add(leftArrow);

      const rightArrow = this.add.text(shopBackground.width*.15, shopBackground.height*-.1, '>', { fontSize: windowWidth*(32/1494), fill: '#000' });
      rightArrow.setOrigin(0, 0.5);
      rightArrow.setInteractive();
      rightArrow.on('pointerdown', () => changeMonkey(1)); // Change monkey to next image
      shopContainer.add(rightArrow);

      monkeyDisplay = this.add.sprite(0, shopBackground.height*-.1, "monkey1");
      monkeyDisplay.setDisplaySize(windowWidth*.075, windowHeight*.1);
      shopContainer.add(monkeyDisplay);

      costText = this.add.text(
        0,
        windowHeight*(80/765),
        `Cost: ${monkeyPrices[monkeyNumber]} Bananas`,
        { fontSize: windowWidth*(16/1494), fill: "#000" }
      );
      costText.setOrigin(0.5, 0.5); // Center the text
      shopContainer.add(costText);

      this.physics.add.overlap(monkey, market, () => {
        openShop();
      });

      setScene(this);
    }

    function changeMonkey(direction) {
      setPurchasedMonkeys((currentPurchasedMonkeys) => {
        let newIndex = monkeyNumber + direction;

        if (newIndex < 0) {
          newIndex = monkeysAvailable.length - 1;
        } else if (newIndex >= monkeysAvailable.length) {
          newIndex = 0;
        }

        // Update the button text based on the React state
        purchaseButton.setText(currentPurchasedMonkeys[newIndex] ? "Purchased" : "Purchase");

        monkeyNumber = newIndex;
        costText.setText(`Cost: ${monkeyPrices[newIndex]} Bananas`);
        monkeyDisplay.setTexture(monkeysAvailable[newIndex]);
        monkey.setTexture(monkeysAvailable[newIndex]);

        return currentPurchasedMonkeys;
      });
    }

    function purchaseMonkey() {
      setBananaCounter((prevCounter) => {
        const price = monkeyPrices[monkeyNumber];

        if (prevCounter < price) {
          alert('Not enough bananas!')
          return prevCounter
        } else if (purchaseButton._text === "Purchased") {
          alert('Monkey already purchased!')
          return prevCounter
        }else{
          console.log('Purchased!');

          setPurchasedMonkeys((prevPurchasedMonkeys) => {
            const updatedMonkeys = [...prevPurchasedMonkeys];
            updatedMonkeys[monkeyNumber] = true;
            purchaseButton.setText("Purchased"); // Update button immediately
            return updatedMonkeys;
          });

          return prevCounter - price; // Deduct the price
        }
      });
    }

    function openShop() {
      console.log('Opening shop...');
      shopOpen = true;
      monkeyMovementEnabled = false; // Disable monkey movement
      monkey.x = windowWidth*1.2
      monkey.y = windowHeight * .8
      shopContainer.setVisible(true);
      camera.stopFollow(); // Stop following the monkey
      camera.pan(shopContainer.x, shopContainer.y, 500, 'Linear', true); // Pan to shop container
      lastChangeTime = Date.now() + 500;
    }

    function closeShop() {
      setPurchasedMonkeys((prevPurchasedMonkeys) => {
        if (prevPurchasedMonkeys[monkeyNumber]) {
          console.log("Closing shop...");
          shopOpen = false;
          lastChangeTime = 0;
          monkeyMovementEnabled = true; // Re-enable monkey movement
          shopContainer.setVisible(false);
          camera.pan(monkey.x, monkey.y, 500, "Linear", true); // Pan back to the monkey
          camera.once("camerapancomplete", () => {
            camera.startFollow(monkey, true, 0.1, 0.1); // Resume following the monkey
          });
        } else {
          alert(`You must purchase this monkey first!`);
        }

        return prevPurchasedMonkeys; // Ensure state remains unchanged
      });
    }

  const handleAddTask = (task) => {
    if (task) {
      const updatedTasks = [task, ...tasks]; // Add the task to the tasks list
      setTasks(updatedTasks); // Update the tasks state
      setShowTaskManager(false);
      saveTaskData(userId, updatedTasks, bananaCounter, setTasks); // Pass the updated tasks list to saveTaskData
    }
  };

  const handleCancel = () => {
    setShowTaskManager(false); // Close the TaskManager without adding a task
  };

  const handleSave = (input) => {
    console.log("got through!")
    console.log('taskname', selectedTaskName);
    console.log('Updated input:', input);

    // Find the task with the selected name
    const task = tasks.find(t => t.name === selectedTaskName);

    if (task) {
      console.log('Found task:', task);

      // Use the callback form of setTasks to ensure we're updating the latest state
      setTasks((prevTasks) => {
        // Update the task's notes
        const updatedTasks = prevTasks.map(existingTask => {
          if (existingTask.name === selectedTaskName) {
            return { ...existingTask, notes: input }; // Update only the task that matches the selectedTaskName
          }
          return existingTask; // Keep the other tasks the same
        });

        // Trigger save function to persist the updated task list
        saveTaskData(userId, updatedTasks, bananaCounter, setTasks);

        return updatedTasks; // Return the updated tasks to be set
      });
    } else {
      console.log('Task not found!');
    }
  };

  let task = tasks.find(t => t.name === selectedTaskName);

  const handleCollectBananas = (taskName) => {
    console.log('taskname', taskName)
    if (task) {
      const bananasToCollect = task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
      collectBanana(bananasToCollect);
      console.log("Tasks before removal:", tasks);
      const updatedTasks = tasks.filter(t => t.name !== selectedTaskName);
      console.log("Tasks after removal:", updatedTasks);
      setTasks(updatedTasks);
      // Save the updated task list and banana counter after the update
      setTimeout(() => {
        saveTaskData(userId, updatedTasks, bananaCounter, setTasks);
      }, 0); // Trigger saving after state update is complete
    } else {
      console.log("No task selected.");
    }
    removeBranchFromFrontend(taskName);
  };
  
  const removeBranchFromFrontend = (taskName) => {
    console.log('starting process')
    console.log('name', taskName)

        // Improved text search logic
        const textToRemove = scene.children.list.find(child => {
          return child instanceof Phaser.GameObjects.Text && child.text === String(taskName);
        });

    console.log('text', textToRemove);
      if (textToRemove) {
        const loc = textToRemove.y + windowHeight*(50/765);
        const bananaY = loc;
        textToRemove.destroy();
        console.log('destoryed text')
      // Iterate through all children in the scene to find and remove the corresponding items
      const currentBranch = scene.branches.find(branch => Math.abs(branch.y - loc) < 50);
      if (currentBranch) {
        // Remove the branch from scene and the branches array
        scene.branches = scene.branches.filter(branch => branch !== currentBranch);
        currentBranch.destroy();  // Destroy the branch
    
        // Remove bananas corresponding to the task
        const bananasToRemove = scene.children.list.filter(child => child.texture && child.texture.key === "banana" && Math.abs(child.y - bananaY) < 50);
        console.log('bananas', bananasToRemove)
        bananasToRemove.forEach(banana => {
          scene.bananas = scene.bananas.filter(b => b !== banana);  // Remove from bananas array
          banana.destroy();  // Destroy the banana
        });

        const shrinkAmount = 150; // Amount by which the tree shrinks (same as the growth in growTree)
        const newHeight = Math.max(treeObj.height - shrinkAmount, 50); // Prevent shrinking below minimum height

  //       scene.tweens.add({
  //         targets: treeObj,
  //         height: newHeight,
  //         duration: 500,
  //         ease: "Linear",
  //         onUpdate: () => {
  //           // Update the tree's size and physics body
  //           treeObj.setSize(50, treeObj.height);
  //           treeObj.body.updateFromGameObject();
  //         },
  //         onComplete: () => {
  //           // Move each branch down by the same amount the tree shrunk
  //           scene.branches.forEach((branch) => {
  //             branch.y += shrinkAmount; // Move branch down by the shrink amount

  //           });

  //           // Save the updated tree state
  //           const updatedTreeState = {
  //             height: treeObj.height, // Updated height of the tree
  //             branches: scene.branches, // Remaining branches on the tree
  //           };
  //           saveTreeData(updatedTreeState);

  //           // Alternate the branch side for the next branch
  //           scene.branchSide = scene.branchSide === "left" ? "right" : "left";
  //         },
  //       });
    
  //       // Reorganize the remaining branches, texts, and bananas
  //       updateBranchesAfterDeletion(currentBranch.y);
  //     }
  //   }
  // };
  
  // const updateBranchesAfterDeletion = (currentBranchY) => {
  //   console.log('step 2');
  //   // Adjust positions of remaining branches, texts, and bananas
  //   const offsetY = windowHeight * (10 / 765);  // The Y offset to shift down
  
  //   // Move branches above the deleted branch down
  //   scene.branches.forEach(branch => {
  //     if (branch.y < currentBranchY) {
  //       branch.y += offsetY; 
  //       console.log('done1')
  //     }
  //   });
  
  //   // Move task text above the deleted branch down
  //   scene.children.list.forEach(child => {
  //     if (child.text && child.y < currentBranchY) {
  //       child.y += offsetY;
  //       console.log('done2')
  //     }
  //   });
  
  //   // Move bananas above the deleted branch down
  //   scene.children.list.forEach(child => {
  //     if (child.textureKey === "banana" && child.y < currentBranchY) {
  //       child.y += offsetY;
  //     }
  //   });
}}
  };
  

  const growTree = (task) => {
    if (scene && scene.tree) {
      const treeObj = scene.tree;
      const newHeight = treeObj.height + windowHeight * (150/765); // Increased height growth for a more noticeable change

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
          const branchY = treeObj.y - treeObj.height + windowHeight*(10/765);
          const branchX =
            scene.branchSide === "left" ? treeObj.x - windowWidth*(100/1494) : treeObj.x + windowWidth*(100/1494);
          const taskName = task.name || "Default Task";

          // Create the branch
          const branch = scene.add.rectangle(
            branchX,
            branchY,
            windowWidth*(200/1494),
            windowHeight*(15/765),
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
              ? branchX - windowWidth*(100/1494)
              : branchX + windowWidth*(100/1494) - windowWidth*(50/1494) * (task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3);

          // Add task text to the branch
          scene.add.text(bananaStartX - windowWidth*(20/1494), branchY - windowHeight*(50/765), taskName, {
            font: windowWidth*(20/1494),
            fontFamily: "Courier New",
            fill: "#000",
            align: "center",
            fontWeight: windowWidth*(80/1494),
          });

          // Add bananas based on difficulty, spaced horizontally
          const bananaCount =
            task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
          const bananaSpacing = windowWidth*(50/1494); // Horizontal spacing between bananas
          if (!scene.bananas) {
            scene.bananas = [];
          }

          // Inside the `growTree` function (where bananas are created), add each banana to the `scene.bananas` array
          for (let i = 0; i < bananaCount; i++) {
            const banana = scene.add.sprite(
              bananaStartX + i * bananaSpacing,
              branchY,
              "banana"
            );
            banana.setOrigin(0.5, 0.5);
            banana.setDisplaySize(windowHeight*(3/50), windowHeight*(3/50)); // Adjust the size as needed
            banana.setDepth(10); // Ensure it appears in front of other objects

            scene.physics.add.existing(banana);
            banana.body.setAllowGravity(false); // Disable gravity if bananas shouldn't fall
            banana.body.setImmovable(true); // Make bananas immovable
            banana.body.updateFromGameObject();

            // Add the banana to the scene's bananas array
            scene.bananas.push(banana);
          }
          // Create the updated tree state to pass to saveTreeData
          const updatedTreeState = {
            height: treeObj.height,  // The updated height of the tree
            branches: scene.branches,  // All the branches currently on the tree
            bananas: scene.bananas,
          };

          // Alternate branch side for the next branch
          scene.branchSide = scene.branchSide === "left" ? "right" : "left";
        },
      });
    }
  };

  const resetZoomHandler = () => {
    const camera = game.scene.getScene('Tree')?.cameras?.main;
    if (camera) {
      camera.setZoom(1); // Reset zoom level to the initial state
    } else {
      console.error("Camera not initialized");
    }
  };

  const zoomInHandler = () => {
    const camera = game.scene.getScene('Tree')?.cameras?.main;
    if (camera && camera.zoom < 2) {
      camera.zoom += 0.1;
      console.log('Zoom level:', camera.zoom);
    } else {
      console.log('Camera: ', camera);
      console.log('Game: ', game);
      console.error('Camera or Game is not defined');
    }
  };

  const zoomOutHandler = () => {
    const camera = game.scene.getScene('Tree')?.cameras?.main;
    if (camera) {
      // Ensure zoom level doesn't go below 0.5, even with floating-point precision issues
      if (camera.zoom > 0.5) {
        camera.zoom = Math.max(camera.zoom - 0.1, 0.5);
        console.log('Zoom level:', camera.zoom);
      } else {
        console.log('Zoom level cannot go below 0.5');
      }
    } else {
      console.log('Camera: ', camera);
      console.log('Game: ', game);
      console.error('Camera or Game is not defined');
    }
  };

  const isArrayEmpty = (arr) => Array.isArray(arr) && arr.length === 0;

  return (
    <div>
      {/* Add Task Button */}
      <button
        onClick={() => setShowTaskManager(true)}
        style={{
          position: "absolute",
          top: windowHeight*(10/765),
          left: windowWidth*(10/1494),
          padding: windowWidth*(10/1494),
          fontFamily: "Courier New",
          fontSize: windowWidth*(15/1494),
          zIndex: 9999,
        }}
      >
        <strong>Add Task</strong>
      </button>

      {/* Show All Tasks Button */}
      <button
        onClick={() => setShowAllTasks(!showAllTasks)}
        style={{
          position: "absolute",
          top: windowHeight*(10/765),
          left: windowWidth*(120/1494),
          padding: windowWidth*(10/1494),
          fontFamily: "Courier New",
          fontSize: windowWidth*(15/1494),
          zIndex: 9999,
        }}
      >
        <strong>{showAllTasks ? "Hide Tasks" : "Show All Tasks"}</strong>
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: "absolute",
          top: windowHeight*(10/765),
          right: windowWidth*(10/1494),
          padding: windowWidth * (10/1494),
          fontFamily: "Courier New",
          fontSize: windowWidth*(15/1494),
          zIndex: 9999,
        }}
      >
        <strong>Settings</strong>
      </button>

      {/* Settings Popup */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: "0",
            right: "0",
            width: windowWidth * (300/1494),
            height: windowWidth * (200/765),
            backgroundColor: "white",
            padding: windowWidth * (20 / 1494),
            borderRadius: windowWidth * (15 / 1494),
            zIndex: 2000,
            fontSize: windowWidth * (16/1494),
          }}
        >
          <h1>Settings</h1>
          <button
            onClick={() => {
              setShowHelp(true); // Open Help popup
              setShowSettings(false); // Close Settings popup
            }}
            style={{
              padding: windowWidth * (10 / 1494),
              margin: windowWidth * (15 / 1494),
              fontFamily: "Courier New",
              fontSize: windowWidth * (15 / 1494),
            }}
          >
            Help
          </button>
          <button
            onClick={() => {
              handleLogout(); // Call logout function
              setShowSettings(false); // Close Settings popup
            }}
            style={{
              padding: windowWidth * (10 / 1494),
              margin: windowWidth * (10 / 1494),
              fontFamily: "Courier New",
              fontSize: windowWidth * (15 / 1494),
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Help Popup */}
      {showHelp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: windowWidth * (30 / 1494),
              borderRadius: windowWidth * (10 / 1494),
              width: "80%",
              maxWidth: windowWidth * (600 / 1494),
              position: "relative",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: "absolute",
                top: windowHeight*(10/765),
                right: windowWidth * (10 / 1494),
                fontSize: windowWidth * (24 / 1494),
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <h2>Welcome to Monkey See Monkey Do!</h2>
            <p>Here's how to use the app:</p>
            <ul>
              <li style={{ marginBottom: windowWidth * (10 / 1494) }}>Use the arrow keys to move the monkey</li>
              <li style={{ marginBottom: windowWidth * (10 / 1494) }}>Click "Add Task" to create new tasks</li>
              <li style={{ marginBottom: windowWidth * (10 / 1494) }}>To find a task, climb the tree or click "Show All Tasks", then click the task</li>
              <li style={{ marginBottom: windowWidth * (10 / 1494) }}>Completing tasks gives you bananas which can be used in the shop to customize your monkey</li>
              <li>Have fun!</li>
            </ul>
          </div>
        </div>
      )}

      {/* Show All Tasks Section */}
      {showAllTasks && (
  <div style={{ marginTop: windowHeight * (20 / 765), padding: windowWidth * (10 / 1494), backgroundColor: "#f4f4f4" }}>
    <h4>All Tasks</h4>
    <ul>
      {tasks.map((task, index) => (
        <li key={index}>
          <strong>{task.name}</strong> - {task.difficulty} <br />
          <em>Notes:</em> {task.notes || "No notes available"} {/* Display task notes */}
        </li>
      ))}
    </ul>
  </div>
)}


      {/* Game and Task Manager */}
      <div
        id="phaser-game"
        style={{
          width: "100%",
          height: "100vh",
          border: "0px solid black",
          position: "relative",
        }}
      />
      {showTaskManager && (
        <>
          <div
            style={{
              position: "fixed",
              top: 15,
              left: 5,
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 999,
            }}
            onClick={handleCancel}
          />
          <TaskManager
            onAddTask={(task) => {
              growTree(task);
              handleAddTask(task);
            }}
            onCancel={handleCancel}
            tasks={tasks}  // Pass the tasks prop here
          />
        </>
      )}

      {/* Zoom Controls */}
      <div
        style={{
          position: "absolute",
          bottom: windowHeight * (10 / 765),
          right: windowWidth * (20 / 1494),
          display: "flex",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <button
          onClick={zoomInHandler}
          style={{
            fontSize: windowWidth * (24 / 1494),
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: windowWidth * (10 / 1494),
          }}
        >
          +
        </button>
        <button
          onClick={zoomOutHandler}
          style={{
            fontSize: windowWidth * (24 / 1494),
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: windowWidth * (10 / 1494),
          }}
        >
          -
        </button>
        <button
          onClick={resetZoomHandler}
          style={{
            fontSize: windowWidth * (18 / 1494),
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: windowWidth * (10 / 1494),
          }}
        >
          Reset Zoom
        </button>
      </div>

{popupVisible && !(isArrayEmpty(branches)) && (
              <Popup
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onSubmit={handleSave}
                handleCollect={handleCollectBananas}
                setPopupVisibility={setPopupVisible}
                style={{
                zIndex: 1000, // Ensure this is higher than any other elements
                }}
              />
      )}

{popupVisible && (
  <Popup
    defaultValue={task?.notes} // Use optional chaining to avoid errors if task is undefined
    name={selectedTaskName}
    onSubmit={handleSave}
    handleCollect={handleCollectBananas}
    setPopupVisibility={setPopupVisible}
    style={{
      zIndex: 1000, // Ensure this is higher than any other elements
      width: windowWidth * (100 / 1494), // Adjust the width to be smaller
      height: 'auto', // Allow height to adjust based on content
      padding: windowWidth * (15 / 1494), // Reduce the padding to make it smaller
      border: windowWidth * (5 / 1494),
    }}
  />
)}



      {/* Bananas Display */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: windowWidth*.085,
          fontFamily: "Courier New",
          marginTop: windowHeight * (10 / 765),
          fontWeight: windowWidth * (100 / 1494),
        }}
      >
        <p style={{ fontSize: windowWidth * (18 / 1494) }}>
          <strong>Bananas: {bananaCounter}</strong>
        </p>
      </div>
    </div>
  );

}


export default Tree;
