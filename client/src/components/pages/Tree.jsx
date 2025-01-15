import React, { useEffect, useState } from "react";
import Phaser from "phaser";

const Tree = () => {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-game",
      backgroundColor: "#ADD8E6",
      scene: {
        preload: function () {},
        create: function () {
          this.tree = this.add.rectangle(
            window.innerWidth / 2,
            window.innerHeight - 60,
            10,
            10,
            0x4a3d36
          );
          this.tree.setOrigin(0.5, 1);

          this.floor = this.add.rectangle(
            window.innerWidth / 2,
            window.innerHeight - 10,
            window.innerWidth,
            50,
            0x228B22
          );
          this.floor.setOrigin(0.5, 1);

          this.branches = [];
          this.branchSide = "left";
        },
        update: function () {
          this.game.config.width = window.innerWidth;
          this.game.config.height = window.innerHeight;
          this.game.scale.resize(window.innerWidth, window.innerHeight);
          this.tree.setPosition(window.innerWidth / 2, window.innerHeight - 60);
          this.floor.setPosition(window.innerWidth / 2, window.innerHeight - 10);
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const growTree = () => {
    if (game && game.scene) {
      const scene = game.scene.scenes[0];
      const tree = scene.tree;

      const newHeight = tree.height + 50;

      scene.tweens.add({
        targets: tree,
        height: newHeight,
        duration: 500,
        ease: "Linear",
        onUpdate: function () {
          tree.setSize(10, tree.height);
        },
        onComplete: function () {
          const branchY = tree.y - tree.height + 10;

          const branchX = scene.branchSide === "left"
            ? tree.x - 20
            : tree.x + 20;

          scene.branchSide = scene.branchSide === "left" ? "right" : "left";

          const branch = scene.add.rectangle(
            branchX,
            branchY,
            30,
            5,
            0x8B4513
          );

          scene.branches.push(branch);
        }
      });
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default Tree;
