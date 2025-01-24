import React, { useEffect, useState, useRef, useContext } from "react";
import Phaser from "phaser";
import axios from "axios";
import { UserContext } from "../App";
import monkeyImg from "../../assets/monkey.png";
import monkeyImg2 from "../../assets/monkey2.png";
import monkeyImg3 from "../../assets/monkey3.png";
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Popup from "../Popup";
// import Shop from './Shop'; // Import Shop scene
import { useNavigate } from "react-router-dom";

// Create an Axios instance with a custom base URL
const api = axios.create({
  baseURL: "http://localhost:3000", // Set base URL for the API
});

const Tree = () => {
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);  // Access context values

  // Check if userId is missing and redirect immediately
  useEffect(() => {
    if (!userId) {
      console.log("Missing userId, redirecting to homepage...");
      navigate("/"); // This should redirect to the homepage
    }
  }, [userId, navigate]);

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name
  // const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list
  const [treeState, setTreeState] = useState({
    height: 150, // Initialize height
    branches: [], // Initialize branches
  });
  const gameRef = useRef(null); // Ref to track the Phaser game instance

  // Fetch tasks and tree data only if userId is available
  useEffect(() => {
    if (!userId) {
      console.error("User ID is not available.");
      navigate("/"); // Redirect to homepage if userId is not available
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch tree data
        const treeResponse = await axios.get("/api/tree", {
          params: { userId: userId },
        });
        console.log("Fetched tree data from backend:", treeResponse.data);
        const { tree } = treeResponse.data;
        setTreeState(tree || { height: 150, branches: [] }); // Ensure treeState is initialized

        // Fetch tasks data
        const tasksResponse = await api.get("/api/tasks", { params: { userId: userId } });
        console.log("Fetched tasks:", tasksResponse.data);
        setTasks(tasksResponse.data.tasks || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          handleLogout();
          navigate("/"); // Redirect to homepage on unauthorized error
        }
      }
    };

    fetchData();
  }, [userId, navigate, handleLogout]);

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
    let costText; // Reference to the cost text in the shop
    let purchaseButton; // Reference to the purchase button in the shop
    let shopOpen = false; // Track if the shop is open
    let lastChangeTime = 0;

    const updateBananaCounter = (newCount) => {
      setBananaCounter(newCount);
    };

    // Example: Increment banana count in Phaser
    function collectBanana() {
      setBananaCounter((prev) => prev + 1);
    }

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

      //SHOP//
      shopContainer = this.add.container(window.innerWidth * 1.5, window.innerHeight / 2);
      shopContainer.setVisible(false);

      const shopBackground = this.add.rectangle(0, 0, window.innerWidth/2.5, window.innerHeight/2, 0xffffff, 1);
      shopBackground.setOrigin(0.5, 0.5);
      shopContainer.add(shopBackground);

      const shopText = this.add.text(0, -shopBackground.height / 2, 'Customization Shop', { fontSize: '32px', fill: '#000' });
      shopText.setOrigin(0.5, -0.5);
      shopContainer.add(shopText);

      const closeButton = this.add.text(shopBackground.width / 2, -shopBackground.height / 2, 'x', { fontSize: '24px', fill: '#000' });
      closeButton.setOrigin(2, -0.5);
      closeButton.setInteractive();
      closeButton.on('pointerdown', () => {
        closeShop();
      });
      shopContainer.add(closeButton);

      purchaseButton = this.add.text(0, shopBackground.height*.4, "Purchased", { fontSize: "16px", fill: "#000" });
      purchaseButton.setOrigin(0.5, 0.5);
      purchaseButton.setInteractive();
      purchaseButton.on("pointerdown", () => purchaseMonkey());
      shopContainer.add(purchaseButton);

      const leftArrow = this.add.text(-shopBackground.width*.15, shopBackground.height*-.1, '<', { fontSize: '32px', fill: '#000' });
      leftArrow.setOrigin(1, 0.5);
      leftArrow.setInteractive();
      leftArrow.on('pointerdown', () => changeMonkey(-1)); // Change monkey to previous image
      shopContainer.add(leftArrow);

      const rightArrow = this.add.text(shopBackground.width*.15, shopBackground.height*-.1, '>', { fontSize: '32px', fill: '#000' });
      rightArrow.setOrigin(0, 0.5);
      rightArrow.setInteractive();
      rightArrow.on('pointerdown', () => changeMonkey(1)); // Change monkey to next image
      shopContainer.add(rightArrow);

      monkeyDisplay = this.add.sprite(0, shopBackground.height*-.1, "monkey1");
      monkeyDisplay.setDisplaySize(100, 80);
      shopContainer.add(monkeyDisplay);

      costText = this.add.text(
        0,
        80,
        `Cost: ${monkeyPrices[monkeyNumber]} Bananas`,
        { fontSize: "16px", fill: "#000" }
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

        if (!purchasedMonkeys[monkeyNumber] && prevCounter >= price) {
          console.log('Purchased!');

          setPurchasedMonkeys((prevPurchasedMonkeys) => {
            const updatedMonkeys = [...prevPurchasedMonkeys];
            updatedMonkeys[monkeyNumber] = true;
            purchaseButton.setText("Purchased"); // Update button immediately
            return updatedMonkeys;
          });

          return prevCounter - price; // Deduct the price
        } else {
          console.log('Not enough bananas or already purchased.');
          alert('Not enough bananas or already purchased!');
          return prevCounter;
        }
      });
    }

    function openShop() {
      console.log('Opening shop...');
      shopOpen = true;
      monkeyMovementEnabled = false; // Disable monkey movement
      monkey.x = window.innerWidth*1.2
      monkey.y = window.innerHeight * .8
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

    function update() {
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
      saveTaskData(task);
    }
  };

  // Function to save task data to backend
const saveTaskData = async (task) => {
  try {
    await axios.post("/api/tasks/save", {
      task: task.name, // Assuming task has a name field
      difficulty: task.difficulty, // Send difficulty as part of the task object
    });
    console.log("Task saved successfully!");
  } catch (error) {
    console.error("Error saving task data:", error);
    if (error.response && error.response.status === 401) {
      handleLogout();
      navigate("/");
    }
  }
};

  // Function to update tree state
  const saveTreeData = async (updatedTreeState) => {
    try {
      await api.post("/api/tree/save", {
        userId: userId,
        tree: updatedTreeState,
      });
      console.log("Tree data saved successfully!");
    } catch (error) {
      console.error("Error saving tree data:", error);
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
          scene.add.text(bananaStartX - 20, branchY - 50, taskName, {
            font: "20px Courier New",
            fill: "#000",
            align: "center",
            fontWeight: "80px",
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

          // Create the updated tree state to pass to saveTreeData
          const updatedTreeState = {
            height: treeObj.height,  // The updated height of the tree
            branches: scene.branches,  // All the branches currently on the tree
          };

          // Save the updated tree state
          saveTreeData(updatedTreeState);

          // Alternate branch side for the next branch
          scene.branchSide = scene.branchSide === "left" ? "right" : "left";
        },
      });
    }
  };




  return (
    <div>
      <button onClick={() => setShowTaskManager(true)} style={{position:"relative", left: "5px", padding: "10px", fontFamily: "Courier New", marginTop: "10px", fontSize: "15px", }}><strong>Add Task</strong></button>
      <button onClick={() => setShowAllTasks(!showAllTasks)} style={{position:"relative", left: "9px", padding: "10px", fontFamily: "Courier New", marginTop: "10px", fontSize: "15px", }}>
        <strong>{showAllTasks ? "Hide Tasks" : "Show All Tasks"}</strong>
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
      <div style={{ position: 'absolute', top: -15, right: 15, fontFamily: "Courier New", marginTop: "10px", fontWeight: "100"}}>
        <p style={{fontSize: "18px"}}><strong>Bananas: {bananaCounter}</strong></p>
      </div>
    </div>
  );
}

export default Tree;
