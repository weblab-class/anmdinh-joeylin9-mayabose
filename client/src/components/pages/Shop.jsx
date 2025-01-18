import Phaser from 'phaser';
import monkeyImg from '../../assets/monkey.png';
import marketImg from '../../assets/market.png';
import groundImg from '../../assets/ground.png';

class Shop extends Phaser.Scene {
  constructor() {
    super({ key: 'Shop' }); // Ensure the scene key matches the one used in `scene.start`
  }

  preload() {
    // Load assets for the Shop scene if needed
    this.load.image('monkey', monkeyImg); // Preload the monkey image
    this.load.image('market', marketImg); // Preload the market image
    this.load.image('ground', groundImg); // Preload the ground image
  }

  create(data) {
    // Set up the Shop scene
    const welcomeText = this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Welcome to the Shop!', {
      fontSize: '32px',
      fill: '#000',
    });
    welcomeText.setOrigin(0.5, 0.5); // Center the text

    const market = this.add.image(window.innerWidth / 2, window.innerHeight *.62, 'market');
    market.setDisplaySize(400, 450);
    market.setOrigin(0.5, 0.5); // Center the image

    // Create the monkey sprite with physics at the passed position
    const startY = data && data.y ? data.y : window.innerHeight - 100; // Use passed y position or default
    this.monkey = this.physics.add.sprite(window.innerWidth * 0.06, startY, 'monkey');
    this.monkey.setDisplaySize(100, 80); // Set consistent display size
    this.monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

    // Create the ground as a static physics body
    const ground = this.physics.add.staticGroup();
    ground.create(window.innerWidth / 2, window.innerHeight * 0.98, 'ground').setScale(4).refreshBody();

    this.physics.add.collider(this.monkey, ground);
    this.cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
  }

  update() {
    const { monkey, cursors } = this;

      // Move the monkey left or right
      if (cursors.left.isDown) {
        monkey.setVelocityX(-750);
      } else if (cursors.right.isDown) {
        monkey.setVelocityX(750);
      } else {
        monkey.setVelocityX(0); // Stop horizontal movement
      }

      // Make the monkey jump if it is on the ground
      if (cursors.up.isDown && monkey.body.touching.down) {
        monkey.setVelocityY(-600); // Jump up
      }

    // Check if the monkey hits the left side of the screen
    if (monkey.x <= window.innerWidth*.05) {
      this.scene.start('Tree', { x: monkey.x, y: monkey.y}); // Switch to the Tree scene
    }
  }
}

export default Shop;