import React, { useEffect, useState, useRef, useContext } from "react";
import Phaser from "phaser";
import { UserContext } from "../App";
import monkeyImg from "../../assets/monkey.png";
import monkeyImg2 from "../../assets/monkey2.png";
import monkeyImg3 from "../../assets/monkey3.png";
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana3.png";
import grassImg from "../../assets/grass.png";
import cloudImg from "../../assets/cloud2-removebg-preview.png";
import TaskManager from "../AddTask"; // Import TaskManager component
import Popup from "../Popup";
// import Shop from './Shop'; // Import Shop scene
import { useNavigate } from "react-router-dom";
import { fetchGameInfo, saveTaskData } from '../gameDataHandler';

//sounds
import track18 from "../../assets/music/track18.mp3";
import step from "../../assets/music/step.mp3";
import land from "../../assets/music/land.mp3"
import climb from "../../assets/music/climb.mp3"

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
  const [musicVolume, setMusicVolume] = useState(1);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(1);
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
    if (scene) {
      // Update background music volume
      if (scene.sound && scene.sound.get('backgroundMusic')) {
        scene.sound.get('backgroundMusic').setVolume(musicVolume);
      }
  
      // Update sound effects volumes
      ['stepSound', 'landSound', 'climbSound'].forEach(soundKey => {
        const soundEffect = scene.sound.get(soundKey);
        if (soundEffect) {
          switch(soundKey) {
            case 'stepSound':
              soundEffect.setVolume(soundEffectsVolume);
              break;
            case 'landSound':
              soundEffect.setVolume(soundEffectsVolume);
              break;
            case 'climbSound':
              soundEffect.setVolume(soundEffectsVolume);
              break;
          }
        }
      });
    }
  }, [musicVolume, soundEffectsVolume, scene]);

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
      audio: {
        pauseOnBlur: false, // Disable pausing when the window loses focus
      },
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
    let clouds = [];
    let cloudSpeed = 1;
    let cloudWidth = window.innerWidth / 5; // Width of each cloud
    let cloudHeight = window.innerHeight / 5;


    //sounds
    let climbSound;
    let landSound;
    let stepSound;
    let lastSoundTime = 0;
    let backgroundMusic;

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
      this.load.audio("backgroundMusic", track18);
      this.load.audio("stepSound", step);
      this.load.audio("landSound", land);
      this.load.audio("climbSound", climb);
      this.load.image('cloud', cloudImg);
    }

    function update() {
      // Boundaries for the world
      monkey.x = Phaser.Math.Clamp(monkey.x, -windowWidth/2, Infinity);

      clouds.forEach(cloud => {
        cloud.x -= cloudSpeed;
    
        // When a cloud moves off the left side, reposition it to the right side of the screen
        if (cloud.x + cloud.width < this.cameras.main.scrollX) {
          cloud.x = this.cameras.main.scrollX + window.innerWidth;
          cloud.y = Math.random() * window.innerHeight / 2;  // Randomize vertical position
        }
      });
   

   
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
        const soundTime = Date.now();
        // Process monkey movement
        if (this.leftKey.isDown) {
          monkey.setVelocityX(-windowWidth/2);
          if (monkey.body.touching.down && soundTime-lastSoundTime > 750) {
            stepSound.play()
            lastSoundTime = soundTime
          }
        } else if (this.rightKey.isDown) {
          monkey.setVelocityX(windowWidth/2);
          if (monkey.body.touching.down && soundTime-lastSoundTime > 750) {
            stepSound.play()
            lastSoundTime = soundTime
          }
        } else {
          monkey.setVelocityX(0); // Stop horizontal movement
        }

        if (this.upKey.isDown && monkey.body.touching.down) {
          monkey.setVelocityY(-windowHeight); // Jump
        }
      } else {
        monkey.setVelocityX(0);
        monkey.setVelocityY(0);
      }

      //landing
      if (monkey.body.touching.down) {
        if (!monkey.body.wasTouching.down && 
          Phaser.Math.Distance.Between(monkey.x, monkey.y, this.tree.x, this.tree.y) > windowWidth*(1/15)){
          landSound.play()
        }
      }

      if (this.physics.overlap(monkey, this.tree)) {
        const soundTime = Date.now();
        if (this.downKey.isDown && !this.physics.overlap(monkey, mound)) {
          monkey.y += windowHeight*(1/75);
          if (soundTime-lastSoundTime > 500) {
            climbSound.play()
            lastSoundTime = soundTime
          }
        }else if (this.upKey.isDown) {
          monkey.y -= windowHeight*(1/75);
          if (soundTime-lastSoundTime > 500) {
            climbSound.play()
            lastSoundTime = soundTime
          }
        }
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

        //const branches = this.children.getChildren().filter(child => child.texture && child.texture.key === "branch");
        const isOverlapping = this.physics.overlap(monkey, branch);
        console.log('branching', this.branches)
        // Check if there are any branches remaining
        if (this.branches.length === 0) {
          console.log('entered')
          setPopupVisible(false); // Hide the popup if there are no branches left
          isOverlapping = false;
          return; // Exit early since there's nothing to check for overlaps
        }

        // Check if the monkey is currently overlapping with the branch
        console.log('overlap', isOverlapping)

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
              //console.log("Monkey is in the leftmost half of the left branch!");
              setPopupVisible(true); // Show the popup

              // Find the text directly above the leftmost half of the left branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) && // that height above the branch
                  Math.abs(child.x - branchBounds.x) <= windowWidth*(50/1494)
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                //console.log('Selected task name:', taskName);
                //console.log('Selected task name:', taskName);
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
              //console.log("Monkey is in the rightmost half of the right branch!");
              setPopupVisible(true); // Show the popup

              // Find the text directly above the rightmost half of the right branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) + 10 // Ensure text is within 60 pixels above the branch
                  //Math.abs(child.x - branchBounds.x) <= 100
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                //console.log('Selected task name:', taskName);
                //console.log('Selected task name:', taskName);
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
      const numberOfClouds = 15; // Number of clouds to generate


  // Create cloud sprites at random positions across the screen
  for (let i = 0; i < numberOfClouds; i++) {
    let cloud = this.add.sprite(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'cloud');
    cloud.setScale(0.42);  // Make clouds smaller
    cloud.setDepth(-1);
    cloud.setY(cloud.y + 0.5)  // Ensure clouds are behind other game objects
    clouds.push(cloud);
  }

    // Music volume control
    backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: musicVolume  // Use the React state directly
    });
    backgroundMusic.play();

    // Sound effects volume control
    stepSound = this.sound.add("stepSound", {
      volume: soundEffectsVolume
    });

    landSound = this.sound.add("landSound", {
      volume: soundEffectsVolume
    });

    climbSound = this.sound.add("climbSound", {
      volume: soundEffectsVolume
    });

      //bananas
      if (bananaCounter === undefined) {
        console.error('Banana counter is not initialized.');
        return;
      }
      console.log('Creating shop and game elements');

      // Tree setup based on tasks length
const treeBaseHeight = windowHeight * (150 / 765);
const treeWidth = windowHeight * (90 / 765); // Fixed tree width
const treeHeight = treeBaseHeight + tasks.length * 100; // Dynamic tree height

// Create the tree
const tree = this.add.rectangle(
  windowWidth / 2,
  windowHeight * 0.9,
  treeWidth,
  treeHeight,
  0x4a3d36
);
tree.setOrigin(0.5, 1);
this.physics.add.existing(tree, true);

// Save references for use in growTree
this.tree = tree;
this.branches = [];
this.bananas = [];
this.branchSide = "left"; // Start with left side

// Initialize branches with tasks
console.log("Tasks:", tasks);
tasks.forEach((task, index) => {
  const treeObj = this.tree;

  // Calculate branch position
  const branchY = treeObj.y - treeObj.height + windowHeight * (10 / 765) + index * 100;
  const branchX =
    task.side === "left"
      ? treeObj.x - treeObj.displayWidth / 2 - windowWidth * (100 / 1494)
      : treeObj.x + treeObj.displayWidth / 2 + windowWidth * (100 / 1494);

  // Create the branch
  const branch = this.add.rectangle(
    branchX,
    branchY,
    windowWidth * (200 / 1494),
    windowHeight * (20 / 765),
    0x4a3d36
  );

  // Add the branch to the branches array and physics world
  this.branches.push(branch);
  this.physics.add.existing(branch, true);
  branch.body.updateFromGameObject();

  // Add task text to the branch
  const taskName = task.name || "Default Task";
  this.add.text(
    branchX - windowWidth * (100 / 1494),
    branchY - windowHeight * (50 / 765),
    taskName,
    {
      font: `${windowWidth * (20 / 1494)}px Courier New`,
      fill: "#000",
      align: "center",
      fontWeight: `${windowWidth * (80 / 1494)}`,
    }
  );

  // Add bananas based on difficulty
  const bananaCount = task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
  const bananaSpacing = windowWidth * (50 / 1494); // Horizontal spacing between bananas
  for (let i = 0; i < bananaCount; i++) {
    const banana = this.add.sprite(
      branchX + i * bananaSpacing,
      branchY,
      "banana"
    );
    banana.setOrigin(0.5, 0.5);
    banana.setDisplaySize(windowHeight * (3.5 / 50), windowHeight * (3.5 / 50));
    banana.setDepth(10); // Ensure it appears in front of other objects
    this.bananas.push(banana);
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
      monkey.setDisplaySize(windowWidth*.07, windowHeight*.1);

      ground = this.add.rectangle(
        windowWidth / 2,
        windowHeight * 0.9,
        windowWidth*4,
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

      console.log("camera")
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
      monkeyDisplay.setDisplaySize(windowWidth*.07, windowHeight*.1);
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
    };

    function adjustCloudsPosition() {
      // Adjust the position of the clouds when the camera moves
      clouds.forEach(cloud => {
        cloud.x += this.cameras.main.scrollX;  // Move clouds based on camera scroll position
        cloud.y += this.cameras.main.scrollY;
      });
    }


    function update() {
      // Boundaries for the world
      monkey.x = Phaser.Math.Clamp(monkey.x, -windowWidth/2, Infinity);
      clouds.forEach((cloud) => {
        cloud.x -= cloudSpeed;  // Move cloud to the left
    
        // When a cloud moves off the left side, reposition it to the right side of the screen
        if (cloud.x + cloud.width < this.cameras.main.scrollX) {
          cloud.x = this.cameras.main.scrollX + window.innerWidth;
          cloud.y = Math.random() * window.innerHeight / 2;  // Randomize vertical position
        }
      });
    

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

        //const branches = this.children.getChildren().filter(child => child.texture && child.texture.key === "branch");
        const isOverlapping = this.physics.overlap(monkey, branch);
        console.log('branching', this.branches)
        // Check if there are any branches remaining
        if (this.branches.length === 0) {
          console.log('entered')
          setPopupVisible(false); // Hide the popup if there are no branches left
          isOverlapping = false;
          return; // Exit early since there's nothing to check for overlaps
        }

        // Check if the monkey is currently overlapping with the branch
        console.log('overlap', isOverlapping)

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
              //console.log("Monkey is in the leftmost half of the left branch!");
              setPopupVisible(true); // Show the popup

              // Find the text directly above the leftmost half of the left branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) && // that height above the branch
                  Math.abs(child.x - branchBounds.x) <= windowWidth*(50/1494)
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                //console.log('Selected task name:', taskName);
                //console.log('Selected task name:', taskName);
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
              //console.log("Monkey is in the rightmost half of the right branch!");
              setPopupVisible(true); // Show the popup

              // Find the text directly above the rightmost half of the right branch
              const textAboveBranch = this.children.getChildren().find(child => {
                return (
                  child instanceof Phaser.GameObjects.Text &&
                  child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
                  child.y >= branchBounds.y - windowHeight*(2/25) + 10 // Ensure text is within 60 pixels above the branch
                  //Math.abs(child.x - branchBounds.x) <= 100
                );
              });

              if (textAboveBranch) {
                const taskName = textAboveBranch.text; // Get the task name from the text
                setSelectedTaskName(taskName); // Update the selected task name
                //console.log('Selected task name:', taskName);
                //console.log('Selected task name:', taskName);
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
      console.log('Updated tasks:', updatedTasks);
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
    const task = tasks.find(t => t.name === selectedTaskName);
    if (task) {
      const bananasToCollect = task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;

      // update tasks and remove the selected task
      const updatedTasks = tasks.filter((t) => t.name !== selectedTaskName);
      setTasks(updatedTasks);

      // update banana counter and save task data
      setBananaCounter((prevCount) => {
        const newCounter = prevCount + bananasToCollect;

        // save updated task list and banana counter
        saveTaskData(userId, updatedTasks, newCounter, setTasks);
        return newCounter;
      });
    } else {
      console.log("No task selected.");
    }
    removeBranchFromFrontend(selectedTaskName);
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
        const textloc = textToRemove.y
        const loc = textloc + windowHeight*(50/765);
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

        const shrinkAmount = windowHeight * (150/765); // Increased height growth for a more noticeable change
        const treeObj = scene.tree;
        const newHeight = Math.max(treeObj.height - shrinkAmount, 50); // Prevent shrinking below minimum height

        scene.tweens.add({
          targets: treeObj,
          height: newHeight,
          duration: 500,
          ease: "Linear",
          onUpdate: () => {
            // Update the tree's size and physics body
            treeObj.setSize(windowHeight * (90 / 765), treeObj.height);
            treeObj.body.updateFromGameObject();
          },
          onComplete: () => {
            if (scene.branches.length === 0) {
              console.log('No branches left, resetting state...');
              setPopupVisible(false); // Ensure popup is closed
              setTreeState({ height: scene.tree.height, branches: [], bananas: [] });
            }
            // Save the updated tree state
            const updatedTreeState = {
              height: treeObj.height, // Updated height of the tree
              branches: scene.branches, // Remaining branches on the tree
              bananas: scene.bananas,
            };
            setTreeState(updatedTreeState);


            // Alternate the branch side for the next branch
            scene.branchSide = scene.branchSide === "left" ? "right" : "left";
          },
        });

        const branchesMove = scene.branches.filter(branch => branch.y < loc);

        // Create a tween for moving branches, bananas, and text
        branchesMove.forEach((branch) => {
          scene.tweens.add({
            targets: branch,
            y: branch.y + shrinkAmount,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
              // Ensure physics body is finalized at the new position
              if (branch.body) {
                branch.body.updateFromGameObject();
              }
            }
          });
        });

        const bananasMove = scene.children.list.filter(child => child.texture && child.texture.key === "banana" && child.y < bananaY);

        bananasMove.forEach((banana) => {
          scene.tweens.add({
            targets: banana,
            y: banana.y + shrinkAmount,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
              // Ensure physics body is finalized at the new position
              if (banana.body) {
                banana.body.updateFromGameObject();
              }
            }
          });
        });

        const textMove = scene.children.list.filter(
          (child) => child instanceof Phaser.GameObjects.Text && child.y < textloc
        );
        textMove.forEach((text) => {
          scene.tweens.add({
            targets: text,
            y: text.y + shrinkAmount,
            duration: 500,
            ease: "Linear",
            onComplete: () => {
              // Ensure physics body is finalized at the new position
              if (text.body) {
                text.body.updateFromGameObject();
              }
            }
          });
        });

      }
    }
  };


  const growTree = (task) => {
    if (scene && scene.tree) {
      const treeObj = scene.tree;
      const newHeight = treeObj.height + windowHeight * (150 / 765); // Increased height growth for a more noticeable change

      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          // Ensure that the rectangle's size is updated
          const treeWidth = windowHeight * (90 / 765);
          treeObj.setSize(treeWidth, treeObj.height);
          treeObj.body.updateFromGameObject();
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + windowHeight * (10 / 765);
const branchX =
  task.side === "left"
    ? treeObj.x - treeObj.displayWidth / 2 - windowWidth * (100 / 1494) // Align with left edge of the tree
    : treeObj.x + treeObj.displayWidth / 2 + windowWidth * (100 / 1494); // Align with right edge of the tree
const taskName = task.name || "Default Task";

// Create the branch
const branch = scene.add.rectangle(
  branchX,
  branchY,
  windowWidth * (200 / 1494),
  windowHeight * (20 / 765),
  0x4a3d36
);

// Add the branch to the branches array and physics world
if (scene && scene.branches) {
  scene.branches.push(branch);
}

scene.physics.add.existing(branch, true); // Enable physics for the branch
branch.body.updateFromGameObject(); // Update the body to reflect the current game object

          // Determine the starting x position for bananas based on task.side
          const bananaStartX =
            task.side === "left"
              ? branchX - windowWidth * (80 / 1494)
              : branchX + windowWidth * (80 / 1494);

          // Add task text to the branch
          scene.add.text(bananaStartX - windowWidth * (20 / 1494), branchY - windowHeight * (90 / 765), taskName, {
            font: `${windowWidth * (20 / 1494)}px Courier New`,
            fill: "#000",
            align: "center",
            fontWeight: "bold",
          });

          // Add bananas based on difficulty, spaced horizontally
          const bananaCount =
            task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
          const bananaSpacing = windowWidth * (50 / 1494); // Horizontal spacing between bananas
          if (!scene.bananas) {
            scene.bananas = [];
          }

          for (let i = 0; i < bananaCount; i++) {
            const banana = scene.add.sprite(
              bananaStartX + i * bananaSpacing,
              branchY,
              "banana"
            );
            banana.setOrigin(0.5, 0.5);
            banana.setDisplaySize(windowHeight * (3.5 / 50), windowHeight * (3.5 / 50)); // Adjust the size as needed
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
            height: treeObj.height, // The updated height of the tree
            branches: scene.branches, // All the branches currently on the tree
            bananas: scene.bananas,
          };

          setTreeState(updatedTreeState)

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


  return (
    <div>
      {/* Add Task Button */}
      <button
        onClick={() => setShowTaskManager(true)}
        style={{
          position: "relative",
          top: "1vh",
          left: "1vw",
          marginRight: "2vw",
          padding: "0.5vw",
          fontFamily: "Courier New",
          fontSize: "2vh",
          zIndex: 9999,
        }}
      >
        <strong>Add Task</strong>
      </button>

      {/* Show All Tasks Button */}
      <button
        onClick={() => setShowAllTasks(!showAllTasks)}
        style={{
          position: "relative",
          top: "1vh",
          padding: "0.5vw",
          fontFamily: "Courier New",
          fontSize: "2vh",
          zIndex: 9999,
        }}
      >
        <strong>{showAllTasks ? "Hide Tasks" : "Show All Tasks"}</strong>
      </button>

      <div
        style={{
          position: "absolute",
          top: "0vw",
          right: "0vw",
          display: "flex",
          alignItems: "center",
          gap: "2vw", // Consistent gap between elements
        }}
      >
        <p style={{ fontSize: "1vw", fontFamily: "Courier New" }}>
          <strong>Bananas: {bananaCounter}</strong>
        </p>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            position: "relative",
            top: "0vw",
            right: "0.5vw",
            padding: "0.5vw",
            fontFamily: "Courier New",
            fontSize: "2vh",
            zIndex: 9999,
          }}
        >
          <strong>Settings</strong>
        </button>
      </div>

      {/* Settings Popup */}
      {showSettings && (
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "18vw",
            height: "20vw",
            backgroundColor: "white",
            padding: "2vw",
            borderRadius: "1vw",
            zIndex: 2000,
            fontSize: "1vw",
          }}
        >
          <h1>Settings</h1>
          <button
            onClick={() => {
              setShowHelp(true); // Open Help popup
              setShowSettings(false); // Close Settings popup
            }}
            style={{
              padding: ".5vw",
              margin: ".5vw",
              fontFamily: "Courier New",
              fontSize: "1vw",
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
              padding: ".5vw",
              margin: ".5vw",
              fontFamily: "Courier New",
              fontSize: "1vw",
            }}
          >
            Logout
          </button>
          <div className="mb-4" style={{marginTop: "1vw"}}>
            <label 
              htmlFor="musicVolume" 
              className="block text-sm mb-2"
            >
              Music Volume
            </label>
            <input 
              type="range" 
              id="musicVolume"
              min="0" 
              max="1" 
              step="0.1" 
              value={musicVolume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setMusicVolume(newVolume);
              }}
              className="w-full"
            />
            <span className="text-sm">{(musicVolume * 100).toFixed(0)}%</span>
          </div>

          <div className="mb-4">
            <label 
              htmlFor="sfxVolume" 
              className="block text-sm mb-2"
            >
              Sound Effects Volume
            </label>
            <input 
              type="range" 
              id="sfxVolume"
              min="0" 
              max="1" 
              step="0.1" 
              value={soundEffectsVolume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setSoundEffectsVolume(newVolume);
              }}
              className="w-full"
            />
            <span className="text-sm">{(soundEffectsVolume * 100).toFixed(0)}%</span>
          </div>
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
              console.log('Adding task (TASKMANAGER):', task);
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
          bottom: "1vw",
          right: "1vw",
          display: "flex",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <button
          onClick={zoomInHandler}
          style={{
            fontSize: "1.5vw",
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: "0.5vw",
          }}
        >
          +
        </button>
        <button
          onClick={zoomOutHandler}
          style={{
            fontSize: "1.5vw",
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: "0.5vw",
          }}
        >
          -
        </button>
        <button
          onClick={resetZoomHandler}
          style={{
            fontSize: "1.5vw",
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: "0.5vw",
          }}
        >
          Reset Zoom
        </button>
      </div>

{popupVisible && (
              <Popup
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onSubmit={handleSave}
                handleCollect={handleCollectBananas}
                setPopupVisibility={setPopupVisible}
                style={{
                zIndex: 1000,
                }}
              />
      )}

{popupVisible && (
  <Popup
    defaultValue={task?.notes} // Use optional chaining to avoid errors if task is undefined
    name={task?.name}
    onSubmit={handleSave}
    handleCollect={handleCollectBananas}
    setPopupVisibility={setPopupVisible}
    style={{
      zIndex: 1000,
      width: "1vw",
      height: 'auto',
      padding: "1vw",
      border: "1vw",
    }}
  />
)}


    </div>
  );

}


export default Tree;
