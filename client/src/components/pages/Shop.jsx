import Phaser from 'phaser';
import monkeyImg from '../../assets/monkey.png';
import marketImg from '../../assets/market.png';


class Shop extends Phaser.Scene {
  constructor() {
    super({ key: 'Shop' }); // Ensure the scene key matches the one used in `scene.start`
  }

  preload() {
    // Load assets for the Shop scene if needed
    this.load.image('monkey', monkeyImg); // Preload the monkey image
    this.load.image('market', marketImg); // Preload the market image
  }

  create(data) {
    // Set up the Shop scene
    const welcomeText = this.add.text(window.innerWidth / 2, window.innerHeight / 4, 'Welcome to the Shop!', {
        fontSize: '32px',
        fill: '#000',
    });
    welcomeText.setOrigin(0.5, 0.5); // Center the text

    const market = this.add.image(window.innerWidth / 2, window.innerHeight - 250, 'market');
    market.setOrigin(0.5, 0.5); // Center the image

    // Create the monkey sprite with physics at the passed position
    this.monkey = this.physics.add.image(window.innerWidth*.06, data.y, 'monkey');
    this.monkey.setDisplaySize(100, 80);
    this.monkey.setCollideWorldBounds(true); // Prevent monkey from leaving the screen

    this.add.rectangle(
        window.innerWidth / 2, // Center of the screen (x-axis)
        window.innerHeight - 10, // Bottom of the screen (y-axis)
        window.innerWidth, // Full screen width
        50, // Height of the ground
        0x228b22 // Green color for the ground
      ).setOrigin(0.5, 1);

    // Add keyboard inputs
    this.cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
    this.keys = this.input.keyboard.addKeys('W,S,A,D'); // WASD keys
  }

  update() {
    const { monkey, cursors, keys } = this;

    // Handle movement with arrow keys and WASD keys
    if (cursors.left.isDown || keys.A.isDown) {
      monkey.setVelocityX(-750);
    } else if (cursors.right.isDown || keys.D.isDown) {
      monkey.setVelocityX(750);
    } else {
      monkey.setVelocityX(0);
    }

    if (cursors.up.isDown || keys.W.isDown) {
      monkey.setVelocityY(-750);
    } else if (cursors.down.isDown || keys.S.isDown) {
      monkey.setVelocityY(750);
    } else {
      monkey.setVelocityY(0);
    }

    // Check if the monkey hits the left side of the screen
    if (monkey.x <= window.innerWidth*.05) {
      console.log('Switching to Tree scene');
      this.scene.start('Tree', { x: monkey.x, y: monkey.y }); // Switch to the Tree scene
    }
  }
}

export default Shop;