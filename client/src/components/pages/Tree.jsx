import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import monkeyImg from "../../assets/monkey.png";
import TaskManager from "../AddTask"; // Import TaskManager component

const Tree = () => {
  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState(""); // Store task name


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

  const handleAddTask = (task) => {
    if (task) {
        setTaskName(task);
        setTasks([...tasks, task]); // Add the task
        growTree(); // Grow the tree
    }
    setShowTaskManager(false); // Close TaskManager
  };

  const handleCancel = () => {
    setShowTaskManager(false); // Close the TaskManager without adding a task
  };


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
            scene.branchSide === "left" ? treeObj.x - 20 : treeObj.x + 20;
          scene.branchSide =
            scene.branchSide === "left" ? "right" : "left";
  
          // Create the branch
          const branch = scene.add.rectangle(branchX, branchY, 30, 5, 0x8b4513);
          scene.branches.push(branch);
  
          // Safely use taskName
          const taskLabel = taskName;
          console.log("Adding branch with task:", taskLabel);
  
          // Add text above the branch
          scene.add.text(branchX, branchY - 20, String(taskLabel), {
            font: "16px Arial",
            fill: "#000",
            align: "center",
          });
        //   if (taskName) {
        //     scene.add.text(
        //       branchX,
        //       branchY - 20, // Place the text above the branch
        //       taskName,
        //       {
        //         font: "16px Arial",
        //         fill: "#000",
        //         align: "center",
        //       }
        //     );
        //   }
        },
      });
    }
  };

  return (
    <div>
      <button onClick={() => setShowTaskManager(true)}>Add Task</button>
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
            onClick={handleCancel} // Close the popup when clicking outside
          />
          <TaskManager onAddTask={handleAddTask} onCancel={handleCancel} />
        </>
      )}
    </div>
  );
};

export default Tree;
