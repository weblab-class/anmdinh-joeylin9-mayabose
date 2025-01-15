import React, { useEffect } from 'react';
import Phaser from 'phaser';
import monkeyImg from '../../assets/monkey.png';

const Monkey = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game',
      backgroundColor: '#d3d3d3', // Set background color to light gray
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 10000 }, // Add gravity
          debug: false, // Set to true to see physics boundaries
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);

    let monkey;
    let cursors;
    let keys;

    function preload() {
      // Load assets
      this.load.image('monkey', monkeyImg); // Use absolute path from public directory
    }

    function create() {
      // Add monkey with physics
      monkey = this.physics.add.image(400, 300, 'monkey');
      monkey.setScale(0.1);
      monkey.setCollideWorldBounds(true); // Prevent monkey from going out of bounds

      // Add keyboard inputs
      cursors = this.input.keyboard.createCursorKeys(); // Arrow keys
      keys = this.input.keyboard.addKeys('W,S,A,D'); // WASD keys
    }

    function update() {
      // Handle movement with arrow keys and WASD keys
      if (cursors.left.isDown || keys.A.isDown) {
        monkey.setVelocityX(-500);
      } else if (cursors.right.isDown || keys.D.isDown) {
        monkey.setVelocityX(500);
      } else {
        monkey.setVelocityX(0);
      }

      if (cursors.up.isDown || keys.W.isDown) {
        monkey.setVelocityY(-500);
      } else if (cursors.down.isDown || keys.S.isDown) {
        monkey.setVelocityY(500);
      } else {
        monkey.setVelocityY(0);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div id="phaser-game" />
  );
};

export default Monkey;