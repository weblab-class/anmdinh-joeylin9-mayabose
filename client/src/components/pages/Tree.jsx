import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import TaskManager from "../AddTask"; // Import TaskManager component

const Tree = () => {
  const [game, setGame] = useState(null); // State to hold the Phaser game instance
  const [scene, setScene] = useState(null); // State to hold the active Phaser scene
  const [showTaskManager, setShowTaskManager] = useState(false); // State to toggle TaskManager visibility
  const [tasks, setTasks] = useState([]); // State to hold tasks

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-game",
      backgroundColor: "#ADD8E6",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    let tree;
    let branches = [];
    let branchSide = "left";
    let monkey;
    let cursors;
    let keys;

    function preload() {
      this.load.image("monkey", monkeyImg);
    }

    function create() {
      tree = this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 60,
        50,
        50,
        0x4a3d36
      );
      tree.setOrigin(0.5, 1);

      this.add.rectangle(
        window.innerWidth / 2,
        window.innerHeight - 10,
        window.innerWidth,
        50,
        0x228b22
      ).setOrigin(0.5, 1);

      monkey = this.physics.add.image(400, 300, "monkey");
      monkey.setScale(0.1);
      monkey.setCollideWorldBounds(true);

      cursors = this.input.keyboard.createCursorKeys();
      keys = this.input.keyboard.addKeys("W,S,A,D");

      this.tree = tree;
      this.branches = branches;
      this.branchSide = branchSide;

      setScene(this);
    }

    function update() {
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
      newGame.destroy(true);
    };
  }, []);

  const growTree = () => {
    if (scene && scene.tree) {
      const treeObj = scene.tree;
      const newHeight = treeObj.height + 50;

      scene.tweens.add({
        targets: treeObj,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: () => {
          treeObj.setSize(50, treeObj.height);
        },
        onComplete: () => {
          const branchY = treeObj.y - treeObj.height + 10;
          const branchX =
            scene.branchSide === "left"
              ? treeObj.x - 20
              : treeObj.x + 20;
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left";

          const branch = scene.add.rectangle(
            branchX,
            branchY,
            30,
            5,
            0x8b4513
          );
          scene.branches.push(branch);
        },
      });
    }
  };

  const handleAddTask = (task) => {
    setTasks([...tasks, task]); // Add the task to the list
    setShowTaskManager(false); // Close the TaskManager window
  };

  return (
    <div>
      <button onClick={() => setShowTaskManager(true)}>Add Task</button>
      <button onClick={growTree}>Grow Tree</button>
      <div
        id="phaser-game"
        style={{
          width: "100%",
          height: "100vh",
          border: "1px solid black",
          position: "relative",
        }}
      />
      {/* Conditionally render TaskManager */}
      {showTaskManager && (
        <TaskManager onAddTask={handleAddTask} />
      )}
    </div>
  );
};

export default Tree;