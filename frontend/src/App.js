import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const App = () => {
  const mountRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create ground
    const groundGeometry = new THREE.BoxGeometry(20, 1, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -2;
    scene.add(ground);

    // Create T-Rex
    const trexGeometry = new THREE.BoxGeometry(1, 2, 1);
    const trexMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const trex = new THREE.Mesh(trexGeometry, trexMaterial);
    trex.position.y = 0;
    trex.position.z = 5;
    scene.add(trex);

    // Create obstacles (cacti)
    const obstacleGeometry = new THREE.BoxGeometry(1, 2, 1);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let obstacles = [];

    function spawnObstacle() {
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(5, 0, 5);
      scene.add(obstacle);
      obstacles.push(obstacle);
    }

    // Jump logic
    let jump = false;
    let velocity = 0;

    function handleJump() {
      if (!jump) {
        jump = true;
        velocity = 0.1;
      }
    }

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        handleJump();
      }
    });

    // Game loop
    let speed = 0.05;
    let lastObstacleSpawn = 0;

    function animate(time) {
      if (gameOver) return;

      requestAnimationFrame(animate);

      // Simulate running by moving ground backward
      ground.position.x -= speed;

      // Move obstacles toward the T-Rex
      obstacles.forEach((obstacle) => {
        obstacle.position.x -= speed;
      });

      // Remove obstacles that are out of view
      obstacles = obstacles.filter((obstacle) => obstacle.position.x > -10);

      // Spawn obstacles at intervals
      if (time - lastObstacleSpawn > 2000) {
        spawnObstacle();
        lastObstacleSpawn = time;
      }

      // Handle jump
      if (jump) {
        trex.position.y += velocity;
        velocity -= 0.005;
        if (trex.position.y <= 0) {
          trex.position.y = 0;
          jump = false;
        }
      }

      // Collision detection
      obstacles.forEach((obstacle) => {
        if (
          trex.position.x < obstacle.position.x + 1 &&
          trex.position.x + 1 > obstacle.position.x &&
          trex.position.y < obstacle.position.y + 2 &&
          trex.position.y + 2 > obstacle.position.y
        ) {
          console.log("Game Over!");
          setGameOver(true);
        }
      });

      renderer.render(scene, camera);
    }

    animate(0);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [gameOver]);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div>
      <h1>3D T-Rex Game</h1>
      {gameOver && <h2 style={{ color: "red" }}>Game Over! Press Restart</h2>}
      <div ref={mountRef} style={{ width: "100vw", height: "80vh" }} />
      <button onClick={restartGame}>Restart</button>
    </div>
  );
};

export default App;