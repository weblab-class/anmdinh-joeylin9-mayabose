import React, { useEffect, useState, useContext } from "react";
import Phaser from "phaser";
import Alert from '../Alert';
import { UserContext } from "../App";
import monkeyImg from "../../assets/monkey.png";
import monkeyImg2 from "../../assets/monkeybow-forward.png";
import monkeyImg3 from "../../assets/monkeyhat-forward.png";
import monkeyImg4 from '../../assets/monkeyheadphones-forward.png';
import marketImg from '../../assets/market.png';
import bananaImg from "../../assets/banana3.png";
import cloudImg from "../../assets/cloud2-removebg-preview.png";
import groundImg from "../../assets/ground.png";
import default_monkey from "../../assets/default-monkey-spritesheet.png"
import TaskManager from "../AddTask"; // Import TaskManager component
import Popup from "../Popup";
import { useNavigate } from "react-router-dom";
import { fetchGameInfo, saveTaskData } from '../gameDataHandler';
import "../../public/styles/custom-font.css";
import add_icon from "../../assets/add-icon.png";
import settings_icon from "../../assets/settings-icon.png";
import showalltasks_icon from "../../assets/showalltasks-icon.png";
import bananacount_icon from "../../assets/bananacount-icon.png";
import background from "../../assets/background.png";
import treetrunk from "../../assets/treetrunk.png";
import "./Tree.css";

//sounds
import track18 from "../../assets/music/track18.mp3";
import step from "../../assets/music/step.mp3";
import land from "../../assets/music/land.mp3"
import climb from "../../assets/music/climb.mp3"

const Tree = () => {
  const closeAlert = () => {
    setAlertMessage(""); // Close the alert when the button is clicked
  };
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);  // Access context values
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  // const [showAllTasks, setShowAllTasks] = useState(false); // Control visibility of task list
  const [treeState, setTreeState] = useState({
    height: 150, // Initialize height
    branches: [], // Initialize branches
    bananas: [],
  });
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [bananaCounter, setBananaCounter] = useState(0);
  const [purchasedMonkeys, setPurchasedMonkeys] = useState([true, false, false, false]); // Purchase state for monkeys
  const [selectedMonkey, setSelectedMonkey] = useState(0);
  const monkeyPrices = [0, 30, 50, 80]; // Prices for each monkey
  // Add state to manage popup visibility and input
  const [popupVisible, setPopupVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state for tasks
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // State for settings popup
  // const [showShop, setShowShop] = setState(false);
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
      //console.log("Missing userId, redirecting to homepage...");
      navigate("/"); // Redirect to homepage if userId is not available
      return;
    }

    const getGameInfo = async () => {
      try {
        const data = await fetchGameInfo(userId);
        setTasks(data.tasks || []);
        setBananaCounter(data.numBananas || 0);
        setPurchasedMonkeys(data.purchasedMonkeys || [true, false, false, false]);
        setSelectedMonkey(data.selectedMonkey || 0);
        monkeyNumber = data.selectedMonkey || 0;  // Add this line
        oldMonkeyNumber = data.selectedMonkey || 0;  // Add this line
        setLoading(false);
      } catch (error) {
        console.error("Error fetching game info (Tree.jsx):", error);
        setErrorMessage(error.message);
        setLoading(false);
      }
    };

    getGameInfo();
  }, [userId, navigate, scene]);

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
    if (scene && !loading) {
      const monkey = scene.children?.list?.find(child => child.type === 'Sprite' && child.texture.key.startsWith('monkey'));
      if (monkey) {
        monkey.setTexture(monkeysAvailable[selectedMonkey]);
        monkeyNumber = selectedMonkey;
        oldMonkeyNumber = selectedMonkey;
      }
    }
  }, [loading, selectedMonkey, scene]);

  useEffect(() => {
    if (loading) return;
    if (game) return;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game',
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: windowHeight*3 },
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
        mode: Phaser.Scale.RESIZE,
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
    let windowHeight = window.innerHeight; // Variable for the monkey sprite
    let monkey;
    let ground; // Variable for the ground
    let camera; // Camera reference
    let market; // Variable for the market image
    let shopContainer; // Container for the shop UI
    let monkeyMovementEnabled = true;
    let monkeyDisplay; // Reference to the monkey display in the shop
    let monkeysAvailable = ['monkey1', 'monkey2', 'monkey3', 'monkey4']; // Reference to the monkey number in the shop
    let monkeyNumber = selectedMonkey; // Reference to the monkey number in the shop
    let oldMonkeyNumber = selectedMonkey;
    let costText; // Reference to the cost text in the shop
    let purchaseButton; // Reference to the purchase button in the shop
    let shopOpen = false; // Track if the shop is open
    let lastChangeTime = 0;
    let clouds = [];

    //sounds
    let climbSound;
    let landSound;
    let stepSound;
    let lastSoundTime = 0;
    let backgroundMusic;


    const [monkeyPosition, setMonkeyPosition] = useState({x:-windowWidth*.33 , y:-windowHeight*.25});
    const treeTrunkHeight = windowHeight * (150 / 765);
    // PRELOAD
    function preload() {
      //console.log('Preloading assets...');
      // this.load.image('monkey1', monkeyImg); // Preload the monkey image
      this.load.image('monkey2', monkeyImg2); // Preload the monkey image
      this.load.image('monkey3', monkeyImg3); // Preload the monkey image
      this.load.image('monkey4', monkeyImg4);
      this.load.image('market', marketImg); // Preload the market image
      this.load.image("banana", bananaImg); // Load banana image here
      this.load.audio("backgroundMusic", track18);
      this.load.audio("stepSound", step);
      this.load.audio("landSound", land);
      this.load.audio("climbSound", climb);
      this.load.image('cloud', cloudImg);
      this.load.image("ground", groundImg);
      this.load.image("add_icon", add_icon);
      this.load.image("settings_icon", settings_icon);
      this.load.image("showalltasks_icon", showalltasks_icon);
      this.load.image("bananacount_icon", bananacount_icon);
      this.load.image("background", background);
      this.load.image("treetrunk", treetrunk);
      this.load.spritesheet('monkey1', default_monkey, {
        frameWidth: 224,  // width of each frame in the spritesheet
        frameHeight: 228 // height of each frame in the spritesheet
      });
    }

    // CREATE
    function create() {
      const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
      // Add the background image at y = 0
      const bg = this.add.image(gameWidth / 2, 0, 'background');

      // Ensure the background image scales properly and maintains the aspect ratio
      const bgAspectRatio = bg.width / bg.height;
      const screenAspectRatio = gameWidth / gameHeight;

      if (bgAspectRatio > screenAspectRatio) {
          // Image is wider than the screen, scale by width
          bg.setScale(3*gameWidth / bg.width);
      } else {
          // Image is taller than the screen, scale by height
          bg.setScale(4*gameHeight / bg.height);
      }

      // Adjust position to make sure it aligns at the top of the screen
      bg.setOrigin(0.5, 1);  // Set origin to top-center
      bg.y = 0;  // Set image starting at y = 0 (top of the screen)
      bg.x = 0;
      bg.setDepth(-100);

      // Optional: Adjust the bottom part of the background (if needed)
      // if (bg.height < gameHeight) {
      //     bg.y = gameHeight - bg.height; // Ensure the image fits the screen
      // }

      // // Optional: Debug graphics to see the boundaries
      // this.add.graphics()
      //     .lineStyle(2, 0xff0000) // Red color for debug lines
      //     .strokeRect(0, 0, gameWidth, gameHeight); // Outline the game area
      for (let i = 0; i < 30; i++) {
        const randomX = Math.random() * (windowHeight*3 + windowHeight*3) - windowHeight*3;
        const randomY = Math.random() * (-windowHeight*3 - windowHeight) - windowHeight; // Constrain to upper half of the screen

        const cloud = this.add.image(randomX, randomY, 'cloud');
        cloud.setScale(0.67); // Adjust scale as needed
        cloud.setDepth(-1); // Ensure visibility in the scene
        clouds.push(cloud)
      }

    // Music volume control
    backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: musicVolume
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

      //console.log('Creating shop and game elements');

// Tree setup based on tasks length
const treeBaseHeight = windowHeight * (150 / 765); // Height of each tree trunk segment
const treeWidth = windowHeight * (90 / 765);      // Width of the tree trunk
const treeHeight = treeBaseHeight + (tasks.length) * windowHeight * (150 / 765);
// Initialize tree (this will hold all tree parts)
this.tree = this.add.group(); // Create a group for the tree


// Initialize trunk array and other arrays
// Define the tree trunk height in a variable
this.treeTrunks = [];
this.branches = [];
this.bananas = [];
this.branchSide = "left"; // Start with left side
// Add the base trunk at the bottom of the screen
const baseTrunk = this.add.image(
  0,  // Center horizontally
  0,     // Start at the bottom of the screen
  "treetrunk"       // Texture key for the tree trunk image
);
baseTrunk.setOrigin(0.5, 1); // Align the bottom of the image to its y-coordinate
baseTrunk.setDisplaySize(treeWidth, treeBaseHeight);
this.physics.add.existing(baseTrunk, true);
this.tree.add(baseTrunk); // Add base trunk to the tree group
this.treeTrunks.push(baseTrunk); // Add base trunk to the trunk array
// Iterate over tasks and add trunk segments
tasks.reverse().forEach((task, index) => {
  const treeObj = this.tree;
  const previousTrunk = this.treeTrunks[this.treeTrunks.length - 1]; // Get the last added trunk

  // Calculate the new trunk's position
  const newTrunkY = previousTrunk.y - treeBaseHeight;
  // Create the new trunk segment
  const newTrunk = this.add.image(
    0,
    newTrunkY,
    "treetrunk"
  );
  newTrunk.setOrigin(0.5, 1); // Align the bottom of the image to its y-coordinate
  newTrunk.setDisplaySize(treeWidth, treeBaseHeight);
  this.physics.add.existing(newTrunk, true);
  this.tree.add(newTrunk); // Add new trunk to the tree group
  this.treeTrunks.push(newTrunk); // Add the new trunk to the trunk array

  // Calculate branch position
const branchY = -treeTrunkHeight - (index * treeTrunkHeight);
const branchX =
  task.side === "left"
? newTrunk.x - newTrunk.displayWidth / 2 - windowWidth * (100 / 1494)
: newTrunk.x + newTrunk.displayWidth / 2 + windowWidth * (100 / 1494);

// Create the branch
const branch = this.add.rectangle(
branchX,
branchY,
windowWidth * (200 / 1494),
windowHeight * (20 / 765),
0x4a3d36
);

this.physics.add.existing(branch, true);
branch.body.updateFromGameObject();
this.branches.push(branch); // Add the branch to the branches array
this.tree.add(branch); // Add branch to the tree group

// Add task text to the branch
const taskName = task.name || "Default Task";
this.add.text(
  branchX,
  branchY - windowHeight * (50 / 765),
  taskName,
  {
    font: `${windowWidth * (20 / 1494)}px Courier New`,
    fill: "#000",
    align: "center",
}
);


// Add bananas based on difficulty
const bananaCount = task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
const bananaSpacing = windowWidth * (50 / 1494);
for (let i = 0; i < bananaCount; i++) {
  const banana = this.add.sprite(
    branchX + i * bananaSpacing,
    branchY,
    "banana"
  );
  banana.setOrigin(0.5, 0.5);
  banana.setDisplaySize(windowHeight * (3.5 / 50), windowHeight * (3.5 / 50));
  banana.setDepth(10);
  this.physics.add.existing(banana, true);
  this.bananas.push(banana);
  banana.body.updateFromGameObject();
  this.tree.add(banana); // Add banana to the tree group
}

// Alternate branch side for the next branch
this.branchSide = this.branchSide === "left" ? "right" : "left";
});
// Debugging: Log tree trunks and branches
console.log("Tree trunks:", this.treeTrunks);
console.log("Branches:", this.branches);

      const welcomeText = this.add.text(windowWidth * 1.5 , windowHeight / 2, 'The Shop', {
        fontSize: windowWidth*(32/1494),
        fill: '#000',
      });
      welcomeText.setOrigin(0.5, 0.5); // Center the text

      market = this.add.image(windowWidth, 0, 'market');
      market.setDisplaySize(windowWidth/3, windowHeight/2);
      market.setOrigin(0.5, 1); // Center the image
      this.physics.add.existing(market, true);

      // Create the monkey sprite with physics
      this.load.spritesheet('default_monkey', 'path/to/sprite_sheet.png', {
        frameWidth: 64, // width of each frame (based on your sprite sheet design)
        frameHeight: 64 // height of each frame
      });
      // Preload the default monkey spritesheet
      console.log('selected monkey: ', selectedMonkey)
      console.log('monkeysAvailable[selectedMonkey]: ', monkeysAvailable[selectedMonkey])
      monkey = this.physics.add.sprite(
        -windowWidth * 0.33,
        -windowHeight * 0.25,
        monkeysAvailable[selectedMonkey] || monkeysAvailable[0]
      );
      monkey.setDisplaySize(windowWidth*.075, windowHeight*.15);

      ground = this.add.image(0, 0, 'ground');
      ground.setScale(0.5); // Scale the image to 50% of its original size
      ground.setOrigin(0.5, 0);
      ground.setPosition(0, 0)
      this.physics.add.existing(ground, true); // Add static physics to the rectangle
      this.physics.add.collider(monkey, ground);
      ground.setDepth(0)

      // Set up custom keys for monkey movement
      this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

      //console.log("camera")
      camera = this.cameras.main;
      camera.startFollow(monkey, true, 0.1, 0.1); // Smooth follow
      camera.setFollowOffset(0, windowHeight * (200/765)); // Offset the camera to be 200 pixels higher
      camera.setBounds(-4*windowWidth/3, -5000, Infinity, Infinity);
      camera.setZoom(1); // Set initial zoom level (normal zoom)
      //console.log("Camera bounds:", camera.getBounds());

      //SHOP//
      shopContainer = this.add.container(windowWidth, -windowHeight / 4); // Initially position it above the ground
      shopContainer.setVisible(false); // Initially hidden

      // Background for the shop
      const shopBackground = this.add.rectangle(0, 0, windowWidth / 2.5, windowHeight / 2, 0xffffff, 1);
      shopBackground.setOrigin(0.5, 0.5); // Centered on the container
      shopContainer.add(shopBackground);

      // Close button (top-right corner)
      // const closeButton = this.add.text(shopBackground.width / 2, -shopBackground.height / 2, 'x', { fontSize: windowWidth * (24 / 1494), fill: '#000' });
      // closeButton.setOrigin(2, -0.5);
      // closeButton.setInteractive();
      // closeButton.on('pointerdown', () => {
      //   closeShop();
      // });
      // shopContainer.add(closeButton);

      // Purchase button
      const buttonBackground = this.add.rectangle(0, shopBackground.height * 0.45, shopBackground.width * 0.2, shopBackground.height * 0.1, 0x4caf50);
      buttonBackground.setOrigin(0.5, 0.5); // Center the rectangle
      shopContainer.add(buttonBackground);
      purchaseButton = this.add.text(0, shopBackground.height * 0.45, "Select", { fontSize: windowWidth * (16 / 1494), fill: "#000", font: "1.171vw Courier New" });
      purchaseButton.setOrigin(0.5, 0.5);
      purchaseButton.setInteractive();
      purchaseButton.on("pointerdown", () => purchaseMonkey());
      shopContainer.add(purchaseButton);

      buttonBackground.setInteractive();



      // Left arrow (change to previous monkey)
      const leftArrow = this.add.text(-shopBackground.width * 0.15, shopBackground.height * -0.1, '<', { fontSize: windowWidth * (32 / 1494), fill: '#000', font: "1.171vwpx Courier New" });
      leftArrow.setOrigin(1, 0.5);
      leftArrow.setInteractive();
      leftArrow.on('pointerdown', () => changeMonkey(-1));
      shopContainer.add(leftArrow);

      // Right arrow (change to next monkey)
      const rightArrow = this.add.text(shopBackground.width * 0.15, shopBackground.height * -0.1, '>', { fontSize: windowWidth * (32 / 1494), fill: '#000', font: "1.171vwpx Courier New"});
      rightArrow.setOrigin(0, 0.5);
      rightArrow.setInteractive();
      rightArrow.on('pointerdown', () => changeMonkey(1));
      shopContainer.add(rightArrow);

      // Monkey display sprite
      monkeyDisplay = this.add.sprite(0, shopBackground.height * -0.1, monkeysAvailable[selectedMonkey]);
      monkeyDisplay.setDisplaySize(windowWidth * 0.1, windowHeight * 0.13);
      shopContainer.add(monkeyDisplay);

      // Cost text
      costText = this.add.text(
        0,
        windowHeight * (80 / 765),
        `Cost: ${monkeyPrices[monkeyNumber]} Bananas`,
        { fontSize: windowWidth * (16 / 1494), fill: "#000", font: "1.171vwpx Courier New" }
      );
      costText.setOrigin(0.5, 0.5); // Centered text
      shopContainer.add(costText);

      // Overlap check for opening shop when the monkey reaches the market
      this.physics.add.overlap(monkey, market, () => {
        openShop();
      });

      setScene(this);
    };

    let isCrouching = false;  // Flag to track if the monkey is crouching
    let isJumping = false;
    let isClimbing = false;


// UPDATE
function update() {
  monkey.x = Phaser.Math.Clamp(monkey.x, -4 * windowWidth / 3, 8 * windowWidth / 3);

  clouds.forEach((cloud) => {
    cloud.x -= windowWidth*(1/1464);
    if (cloud.x < -windowWidth*1.5) {
      cloud.x = windowWidth*2
      cloud.y =  Math.random() * -1 * windowHeight/2 - windowHeight/4;
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

  const moveSpeed = windowWidth / 2;
  const climbSpeed = windowHeight * (1 / 60);
  // Monkey movement
  if (monkeyMovementEnabled) {
    const soundTime = Date.now();

    // Horizontal movement
    if (this.leftKey.isDown) {
      monkey.setVelocityX(-moveSpeed);
      if (monkey.body.touching.down && soundTime - lastSoundTime > 750) {
        stepSound.play();
        lastSoundTime = soundTime;
      }
      monkey.setFrame(2); // Set frame to face left
    } else if (this.rightKey.isDown) {
      monkey.setVelocityX(moveSpeed);
      if (monkey.body.touching.down && soundTime - lastSoundTime > 750) {
        stepSound.play();
        lastSoundTime = soundTime;
      }
      monkey.setFrame(3); // Set frame to face right
    } else {
      monkey.setVelocityX(0);



      // When standing still on the ground, set frame to "facing forward"
      if (monkey.body.touching.down) {
        monkey.setFrame(1); // Set frame to face forward (idle frame)
      }
    }
  } else {
    monkey.setVelocityX(0);
    monkey.setVelocityY(0);
    monkey.setFrame(1); // Set frame to idle when no movement
  }

  // Prevent monkey from moving below the ground
  if (this.physics.overlap(monkey, ground)) {
    monkey.y -= climbSpeed;
    monkey.setVelocityY(0); // Prevent falling through the floor
  }


  // Landing sound
  if (monkey.body.touching.down && !monkey.body.wasTouching.down) {
    if (Phaser.Math.Distance.Between(monkey.x, monkey.y, this.tree.x, this.tree.y) > windowWidth * (1 / 15)) {
      landSound.play();
    }
  }

  // Tree/branch interaction
  const onTree = this.physics.overlap(monkey, this.tree);
  const onBranch = this.branches.some(branch => this.physics.overlap(monkey, branch));

  if (onTree) {
    isClimbing = true;
    monkey.body.allowGravity = false;
    monkey.setVelocityY(0);

    // Horizontal movement while climbing
    if (this.leftKey.isDown) {
      monkey.setVelocityX(-moveSpeed);
    } else if (this.rightKey.isDown) {
      monkey.setVelocityX(moveSpeed);
    } else {
      monkey.setVelocityX(0);
    }

    // Climbing logic
    if (this.physics.overlap(monkey, this.tree) && this.upKey.isDown) {
      monkey.y -= climbSpeed; // Climb up
      monkey.setFrame(0); // Set climbing frame
      climbSound.play();
    } else if (this.downKey.isDown && !this.physics.overlap(monkey, ground)) {
        monkey.y += climbSpeed; // Climb down
        monkey.setFrame(0); // Set climbing frame
        climbSound.play();
      }
  } else {
    isClimbing = false; // Disable climbing
    monkey.body.allowGravity = true;
    // Jumping logic when not climbing
    if (this.upKey.isDown && monkey.body.touching.down) {
      monkey.setVelocityY(-1.5 * windowHeight);
      monkey.body.setGravityY(windowHeight * 3);
  }
  }

  if (onBranch) {
    isClimbing = true;
    monkey.body.allowGravity = false;
    monkey.setVelocityY(0);
    //console.log('here')

    // Horizontal movement while climbing
    if (this.leftKey.isDown) {
      monkey.setVelocityX(-moveSpeed);
    } else if (this.rightKey.isDown) {
      monkey.setVelocityX(moveSpeed);
    } else {
      monkey.setVelocityX(0);
    }
  }


  // Flag to track if the popup should be show
  for (const branch of this.branches) {
    // console.log("branch.x: ", branch.x)
    // console.log("tree.x: ", this.tree.x)
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
              child.y >= branchBounds.y - windowHeight*0.2
            );
          });

          if (textAboveBranch) {
            const taskName = textAboveBranch.text; // Get the task name from the text
            setSelectedTaskName(taskName); // Update the selected task name
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
          setPopupVisible(true); // Show the popup

          // Find the text directly above the rightmost half of the right branch
          const textAboveBranch = this.children.getChildren().find(child => {
            return (
              child instanceof Phaser.GameObjects.Text &&
              child.y <= branchBounds.y && // The text is above the branch (y-coordinate should be smaller than branch's y)
              child.y >= branchBounds.y - windowHeight*0.2
            );
          });

          if (textAboveBranch) {
            const taskName = textAboveBranch.text; // Get the task name from the text
            setSelectedTaskName(taskName); // Update the selected task name
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
    purchaseButton.setText(currentPurchasedMonkeys[newIndex] ? "Select" : "Purchase");

    monkeyNumber = newIndex;
    costText.setText(`Cost: ${monkeyPrices[newIndex]} Bananas`);
    monkeyDisplay.setTexture(monkeysAvailable[newIndex]);

    return currentPurchasedMonkeys;
  });
}

function purchaseMonkey() {
  setBananaCounter((prevCounter) => {
    const price = monkeyPrices[monkeyNumber];
    if (purchaseButton._text === "Select") {
      closeShop();
      return prevCounter }
    else if (prevCounter < price) {
      setAlertMessage('Not enough bananas!')
      return prevCounter
    } else {
      //console.log('Purchased!');
      purchaseButton._text = "Select";

      setPurchasedMonkeys((prevPurchasedMonkeys) => {
        const updatedMonkeys = [...prevPurchasedMonkeys];
        updatedMonkeys[monkeyNumber] = true;
        purchaseButton.setText("Select");

        // Save the updated state to the backend
        saveTaskData(userId, tasks, prevCounter - price, updatedMonkeys, monkeyNumber, setTasks);

        return updatedMonkeys;
      });

      return prevCounter - price;
    }
  });
}

function openShop() {
  // Update monkeyNumber to match the currently selected monkey
  monkeyNumber = oldMonkeyNumber;

  // Update display with current monkey's information
  monkeyDisplay.setTexture(monkeysAvailable[monkeyNumber]);
  purchaseButton.setText(purchasedMonkeys[monkeyNumber] ? "Select" : "Purchase");
  costText.setText(`Cost: ${monkeyPrices[monkeyNumber]} Bananas`);

  //console.log('Opening shop...');
  shopOpen = true;
  monkeyMovementEnabled = false; // Disable monkey movement
  monkey.body.setGravityY(-windowHeight*3)
  monkey.x = windowWidth*10
  monkey.y = -windowHeight*.25
  shopContainer.setVisible(true);
  camera.stopFollow(); // Stop following the monkey
  camera.pan(windowWidth, shopContainer.y, 500, 'Linear', true); // Pan to shop container
  lastChangeTime = Date.now() + 500;
}

function closeShop() {
  setPurchasedMonkeys((prevPurchasedMonkeys) => {
    if (prevPurchasedMonkeys[monkeyNumber]) {
      // If the current monkey is purchased
      oldMonkeyNumber = monkeyNumber;
      saveTaskData(userId, tasks, bananaCounter, prevPurchasedMonkeys, monkeyNumber, setTasks);
    } else {
      monkeyNumber = oldMonkeyNumber;
      saveTaskData(userId, tasks, bananaCounter, purchasedMonkeys, monkeyNumber, setTasks);
    }

    // Always update the monkey texture when closing the shop
    monkey.setTexture(monkeysAvailable[monkeyNumber]);
    //console.log("Setting monkey texture to:", monkeysAvailable[monkeyNumber]);

    //console.log("Closing shop...");
    shopOpen = false;
    lastChangeTime = 0;
    monkeyMovementEnabled = true; // Re-enable monkey movement

    monkey.body.setGravityY(windowHeight*3)
    monkey.x = windowWidth * 0.5
    monkey.y = -windowHeight*.2

    shopContainer.setVisible(false);
    camera.pan(monkey.x, monkey.y, 500, "Linear", true); // Pan back to the monkey

    camera.once("camerapancomplete", () => {
      camera.startFollow(monkey, true, 0.1, 0.1); // Resume following the monkey
      camera.setFollowOffset(0, windowHeight * (200/765)); // Offset the camera to be 200 pixels higher

      // Double-check texture after camera pan is complete
      monkey.setTexture(monkeysAvailable[monkeyNumber]);
    });

    return prevPurchasedMonkeys;
  });
}

const handleAddTask = (task) => {
  if (task) {
    const updatedTasks = [task, ...tasks]; // Add the task to the tasks list
    setTasks(updatedTasks); // Update the tasks state
    setShowTaskManager(false);
    saveTaskData(userId, updatedTasks, bananaCounter, purchasedMonkeys, selectedMonkey, setTasks); // Pass the updated tasks list to saveTaskData
    //console.log('Updated tasks:', updatedTasks);
  }
};

const handleCancel = () => {
  setShowTaskManager(false); // Close the TaskManager without adding a task
};

const handleSave = (input) => {
  //console.log("got through!")
  //console.log('taskname', selectedTaskName);
  //console.log('Updated input:', input);

  // Find the task with the selected name
  const task = tasks.find(t => t.name === selectedTaskName);

  if (task) {
    //console.log('Found task:', task);

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
      saveTaskData(userId, updatedTasks, bananaCounter, purchasedMonkeys, selectedMonkey, setTasks);

      return updatedTasks; // Return the updated tasks to be set
    });
  } else {
    //console.log('Task not found!');
  }
};

let task = tasks.find(t => t.name === selectedTaskName);

const switchTaskSidesBefore = (tasks, taskName) => {
  let foundTask = false;

  tasks.forEach((task) => {
    if (task.name === taskName) {
      foundTask = true; // Stop toggling sides once the task is found
    }

    if (!foundTask) {
      // Switch side: If "left", make it "right", and vice versa
      task.side = task.side === "left" ? "right" : "left";
    }
  });
};

const handleCollectBananas = (taskName) => {
  const task = tasks.find(t => t.name === selectedTaskName);
  if (task) {
    const bananasToCollect = task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
    switchTaskSidesBefore(tasks, taskName);

    // update tasks and remove the selected task
    const updatedTasks = tasks.filter((t) => t.name !== selectedTaskName);
    setTasks(updatedTasks);

    // update banana counter and save task data
    setBananaCounter((prevCount) => {
      const newCounter = prevCount + bananasToCollect;

      // save updated task list and banana counter
      saveTaskData(userId, updatedTasks, newCounter, purchasedMonkeys, selectedMonkey, setTasks);
      return newCounter;
    });
  } 
  moveBranchesDown(selectedTaskName)
};

const moveBranchesDown = (taskName) => {
  // Improved text search logic
  //console.log('taskname', taskName)
  const textToRemove = scene.children.list.find(child => {
    return child instanceof Phaser.GameObjects.Text && child.text === String(taskName);
  });

  //console.log('text', textToRemove);
  if (textToRemove) {
    const textloc = textToRemove.y
    const loc = textloc + windowHeight*(50/765);
    const bananaY = loc;
    textToRemove.destroy();
    //console.log('destoryed text')
    // Iterate through all children in the scene to find and remove the corresponding items

      // Remove bananas corresponding to the task
      const bananasToRemove = scene.children.list.filter(child => child.texture && child.texture.key === "banana" && Math.abs(child.y - bananaY) < 50);
      //console.log('bananas', bananasToRemove)
      bananasToRemove.forEach(banana => {
        scene.bananas = scene.bananas.filter(b => b !== banana);  // Remove from bananas array
        banana.destroy();  // Destroy the banana
      });

      let highestBranchIndex = 0;
          let highestBranchY = Infinity; // Start with the maximum possible value

          scene.branches.forEach((branch, index) => {
            if (branch.y < highestBranchY) {
              highestBranchY = branch.y;
              highestBranchIndex = index;
            }
          });

          // Remove the branch from the branches array
          const branchToRemove = scene.branches.splice(highestBranchIndex, 1)[0];

          if (branchToRemove) {
            branchToRemove.destroy(); // Destroy the branch in the game
            //console.log('Removed branch:', branchToRemove);
          }

      const shrinkAmount = windowHeight * (150 / 765); // Increased height growth for a more noticeable change
      const treeObj = scene.tree;
      const newHeight = Math.max(treeObj.height - shrinkAmount, 50); // Prevent shrinking below minimum height

      const bananasMove = scene.children.list.filter(child => child.texture && child.texture.key === "banana" && child.y < bananaY);
      console.log('bananamove', bananasMove)
      bananasMove.forEach((banana) => {
        scene.tweens.add({
          targets: banana,
          x: banana.x * -1,
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
          x: text.x * -1,
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

      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          // Update the tree's size and physics body
          console.log(treeObj);  // Check what treeObj is
if (treeObj && treeObj.setSize) {
  treeObj.setSize(treeWidth, newHeight);
}
          treeObj.body.updateFromGameObject();
        },
        onComplete: () => {

          if (scene.branches.length === 0) {
            //console.log('No branches left, resetting state...');
            setPopupVisible(false); // Ensure popup is closed
            setTreeState({ height: scene.tree.height, branches: [], bananas: [] });
          }
          // Save the updated tree state
          const updatedTreeState = {
            height: treeObj.height, // Updated height of the tree
            branches: scene.branches, // Remaining branches on the tree
            bananas: scene.bananas,
          };
          scene.branchSide = scene.branchSide === "left" ? "right" : "left";
          setTreeState(updatedTreeState);


          // Alternate the branch side for the next branch

        },
      });


    }
}


const growTree = (task) => {
  console.log("scene at growTree call: ",scene);
  console.log("scene.treeTrunks at growTree call: ", scene.treeTrunks);

  if (scene && scene.tree) {
     if (!scene || !scene.treeTrunks || scene.treeTrunks.length === 0) {
    console.error("Error: scene or scene.treeTrunks is undefined or empty.");
     }
     const treeObj = scene.treeTrunks[scene.treeTrunks.length - 1];
     console.log("treeObj: ", treeObj)
    // Determine the height increase based on the current task count
    const treeBaseHeight = windowHeight * (150 / 765); // Height of each tree trunk segment
    const treeWidth = windowHeight * (90 / 765);      // Width of the tree trunk
    const newHeight = treeObj.height + treeBaseHeight; // New height after growing the tree

    scene.tweens.add({
      targets: treeObj,
      height: newHeight,
      duration: 500,
      ease: "Linear",
      onUpdate: () => {
        // Update the tree's width and height to fit the new size
        const treeWidth = windowHeight * (90 / 765);
        console.log(treeObj);  // Check what treeObj is
// i
// Check if treeObj exists and has a body
if (treeObj && treeObj.body) {
  treeObj.body.updateFromGameObject();
}

// treeObj.body.updateFromGameObject();
      },
      onComplete: () => {
        // Calculate the Y-position of the new branch based on tree growth
        const previousTrunk = scene.treeTrunks[scene.treeTrunks.length - 1]; // Get the last added trunk
        const newTrunkY = previousTrunk.y - treeBaseHeight; // Y-position for the new trunk
        const newTrunk = scene.add.image(0, newTrunkY, "treetrunk");
        newTrunk.setOrigin(0.5, 1);
        newTrunk.setDisplaySize(treeWidth, treeBaseHeight);
        scene.physics.add.existing(newTrunk, true);
        scene.tree.add(newTrunk); // Add new trunk to the tree group
        scene.treeTrunks.push(newTrunk); // Add the new trunk to the trunk array

        // Calculate the position of the branch
        const branchY = newTrunk.y - newTrunk.displayHeight;
        const branchX =
          task.side === "left"
            ? newTrunk.x - newTrunk.displayWidth / 2 - windowWidth * (100 / 1494)
            : newTrunk.x + newTrunk.displayWidth / 2 + windowWidth * (100 / 1494);

        // Create the branch
        const branch = scene.add.rectangle(
          branchX,
          branchY,
          windowWidth * (200 / 1494),
          windowHeight * (20 / 765),
          0x4a3d36
        );

        // Add the branch to the branches array and enable physics
        scene.physics.add.existing(branch, true);
        branch.body.updateFromGameObject();
        scene.branches.push(branch); // Add the branch to the branches array
        scene.tree.add(branch); // Add branch to the tree group

        // Add task text to the branch
        const taskName = task.name || "Default Task";
        scene.add.text(
          branchX,
          branchY - windowHeight * (50 / 765),
          taskName,
          {
            font: `${windowWidth * (20 / 1494)}px Courier New`,
            fill: "#000",
            align: "center",
          }
        );

        // Add bananas based on difficulty, spaced horizontally
        const bananaCount =
          task.difficulty === "Easy" ? 1 : task.difficulty === "Medium" ? 2 : 3;
        const bananaSpacing = windowWidth * (50 / 1494); // Horizontal spacing between bananas
        if (!scene.bananas) {
          scene.bananas = [];
        }

        // Create bananas on the branch
        for (let i = 0; i < bananaCount; i++) {
          const banana = scene.add.sprite(
            branchX + i * bananaSpacing,
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
          scene.tree.add(banana); // Add banana to the tree group
        }

        // Create the updated tree state to pass to saveTreeData
        const updatedTreeState = {
          height: treeObj.height, // The updated height of the tree
          branches: scene.branches, // All the branches currently on the tree
          bananas: scene.bananas,
        };

        // Save the updated tree state
        setTreeState(updatedTreeState);

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
      //console.log('Zoom level:', camera.zoom);
    } else {
      //console.log('Camera: ', camera);
      //console.log('Game: ', game);
      console.error('Camera or Game is not defined');
    }
  };

  const zoomOutHandler = () => {
    const camera = game.scene.getScene('Tree')?.cameras?.main;
    if (camera) {
      // Ensure zoom level doesn't go below 0.5, even with floating-point precision issues
      if (camera.zoom > 0.5) {
        camera.zoom = Math.max(camera.zoom - 0.1, 0.5);
        //console.log('Zoom level:', camera.zoom);
      } else {
        //console.log('Zoom level cannot go below 0.5');
      }
    } else {
      //console.log('Camera: ', camera);
      //console.log('Game: ', game);
      console.error('Camera or Game is not defined');
    }
  };

  const [errorMessage, setErrorMessage] = useState(null);

  const ErrorModal = ({ message, onClose }) => {
    if (!message) return null;
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close-btn" onClick={onClose}>&times;</span>
          <p>{message}</p>
        </div>
      </div>
    );
  };


  return (
    <>

<div
  style={{
    display: "flex", // Arrange buttons horizontally
    alignItems: "center", // Ensure buttons align vertically
    gap: "0.2vw", // Consistent gap between elements (same gap as Add Task and Show All Tasks)
    position: "absolute",
    top: "0", // Adjust this to control the vertical positioning
    left: "0.5vw", // Adjust the left margin for the left container
    zIndex: 9999, // Keep this on top
  }}
>
  {/* Add Task Button */}
  <button
    onClick={() => setShowTaskManager(prevState => !prevState)} // Toggle the state
    style={{
      position: "relative",
      padding: "0.5vw",
      fontFamily: "Courier New",
      fontSize: "2vh",
      zIndex: 9999,
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex", // Align both horizontally and vertically
      alignItems: "center", // Center vertically
      marginRight: "0.2vw", // Reduced spacing between buttons
    }}
  >
    <img
      src={add_icon}
      alt="Add Task"
      style={{
        width: "2.5vw",
        height: "2.5vw",
      }}
    />
  </button>

  {/* Show All Tasks Button */}
  <button
    onClick={() => setShowAllTasks(!showAllTasks)}
    style={{
      position: "relative",
      width: "calc(4 * 2.5vw)", // Maintain 1:4 ratio
      height: "2.5vw", // Match height with other icons
      padding: "0",
      margin: "0",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex", // Same as Add Task button
      alignItems: "center",    // Center vertically
      justifyContent: "center", // Center text horizontally
    }}
  >
    <img
      src={showalltasks_icon}
      alt="Show All Tasks"
      style={{
        width: "100%", // Icon fills the button
        height: "100%", // Icon fills the button
        objectFit: "contain", // Maintain aspect ratio
        position: "absolute", // Keep the icon as background
      }}
    />
    <span
      style={{
        fontFamily: "joystix monospace",
        fontSize: "0.75vw", // Same font size as Show All Tasks
        fontWeight: "bold",
        color: "black",
        zIndex: 1,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {showAllTasks ? "Hide Tasks" : "Show All Tasks"}
    </span>
  </button>
</div>

{/* Settings and Banana Counter (aligned to the right) */}
<div
  style={{
    position: "absolute",
    top: "0", // Align it with the other buttons
    right: "0.5vw", // Adjust the right margin for the right container
    display: "flex",
    alignItems: "center", // Ensure buttons align vertically
    gap: "0.2vw", // Ensure consistent gap between elements (same as left container)
    zIndex: 9999, // Keep this on top
  }}
>
  {/* Banana Counter (Not a button, just a span) */}
  <span
    style={{
      position: "relative",
      width: "calc(2.08 * 2.5vw)", // Same width as other button icons
      height: "2.5vw", // Match height with other icons
      padding: "0",
      margin: "0",
      background: "none",
      display: "inline-flex", // Align both horizontally and vertically
      alignItems: "center",    // Center vertically
      justifyContent: "center", // Center text horizontally
    }}
  >
    <img
      src={bananacount_icon}
      alt="Banana Counter"
      style={{
        width: "100%", // Icon fills the container
        height: "100%", // Icon fills the container
        objectFit: "contain", // Maintain aspect ratio
        position: "absolute", // Keep the icon as background
      }}
    />
    <span
      style={{
        fontFamily: "joystix monospace", // Apply the custom font
        fontSize: "0.75vw", // Adjust font size to match the Show All Tasks button
        fontWeight: "bold",
        color: "black",
        zIndex: 1,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {bananaCounter}
    </span>
  </span>

  {/* Settings Button */}
  <button
    onClick={() => setShowSettings(!showSettings)}
    style={{
      position: "relative",
      padding: "0.5vw",
      fontFamily: "Courier New",
      fontSize: "2vh",
      zIndex: 9999,
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
    }}
  >
    <img
      src={settings_icon}
      alt="Settings"
      style={{
        width: "2.5vw",
        height: "2.5vw",
      }}
    />
  </button>
</div>


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

  <div>
      {/* Render the custom alert when there's a message */}
      <Alert message={alertMessage} onClose={closeAlert}/>
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
          <div className="mb-4" style={{ marginTop: "1vw" }}>
            <label htmlFor="musicVolume" className="block text-sm mb-2">
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
            <label htmlFor="sfxVolume" className="block text-sm mb-2">
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
                top: windowHeight * (10 / 765),
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

      {showAllTasks && (
        <div style={{ 
          position: "absolute",
          width: "30vw", // Adjust width as needed
          height: "30vw",
          padding: windowWidth * (10 / 1494), 
          backgroundColor: "yellowgreen",
          overflowY: "auto", // Ensures scrolling for large content
          top: "5vw",
          right: "3vw",
          backgroundColor: "rgb(220, 206, 206)",
          padding: "0.878vw",
          border: "0.11vw solid black",
          borderRadius: "0.293vw",
          boxShadow: "inset 0px 0px 0.586vw rgba(0, 0, 0, 0.4)",
          zIndex: 1000,
          width: "20%",
          fontFamily: "joystix monospace",
        }}>
          <h4 style = {{fontSize: "1.318vw"}}>All Tasks</h4>
          <ul style={{ listStyleType: 'none', paddingLeft: '2vw' }}>
            {tasks.map((task, index) => {
              // Set the color based on the task's difficulty
              const difficultyColor = task.difficulty === 'Easy' ? 'rgb(1,75,36)' :
                                      task.difficulty === 'Medium' ? 'rgb(214,89,0)' :
                                      task.difficulty === 'Hard' ? 'rgb(161,3,0)' : 'gray';

              return (
                <li key={index} style={{ marginBottom: '0.732vw', color: 'black', position: 'relative', fontSize: '1.171vw' }}>
                  <span style={{ color: difficultyColor, position: 'relative' }}>
                    <strong>{task.name}</strong> <span style={{ position: 'absolute', fontSize: '1.171vw', color: "#343434", left: '-1.464vw', top: '50%', transform: 'translateY(-50%)' }}>→</span>
                  </span>
                  <br />
                  {task.notes && (
                    <span style={{ color: 'gray', fontSize: '1.171vw' }}>
                      <em>Notes:</em> {task.notes}
                    </span>
                  )}
                </li>
              );
            })}
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
              //console.log('Adding task (TASKMANAGER):', task);
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
          gap: "0.5vw", // Consistent spacing between zoom buttons
          zIndex: 9999,
        }}
      >
        {/* Reset Zoom Button */}
        <button
          onClick={resetZoomHandler}
          style={{
            fontFamily: "joystix monospace", // Use the custom font
            fontSize: "0.8vw", // Adjust font size for zoom controls
            fontWeight: "bold",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "black", // Ensure text is visible
            textAlign: "center",
            outline: "none", // Remove outline completely
          }}
        >
          Reset
        </button>

        {/* Zoom In Button */}
        <button
          onClick={zoomInHandler}
          style={{
            fontFamily: "joystix monospace", // Use the custom font
            fontSize: "0.9vw", // Adjust font size for zoom controls
            fontWeight: "bold",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "black", // Ensure text is visible
            textAlign: "center",
            outline: "none", // Remove outline completely
          }}
        >
          +
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={zoomOutHandler}
          style={{
            fontFamily: "joystix monospace", // Use the custom font
            fontSize: "0.9vw", // Adjust font size for zoom controls
            fontWeight: "bold",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "black", // Ensure text is visible
            textAlign: "center",
            outline: "none", // Remove outline completely
          }}
        >
          -
        </button>
      </div>

      {/* Monkey See Monkey Do Link */}
      <div
        onClick={() => navigate('/')}
        style={{
          position: "absolute",
          bottom: "1vw",
          left: "1vw",
          fontFamily: "joystix monospace", // Use the custom font
          fontSize: "0.9vw",
          fontWeight: "bold",
          color: "black", // Ensure text is visible
          cursor: "pointer", // Indicate it's clickable
          outline: "none",
          // textDecoration: "underline", // Optional: Underline for links
          zIndex: 9999,
        }}
      >
        Monkey See Monkey Do
      </div>
    </>
  );
}


export default Tree;
