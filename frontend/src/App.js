import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create ground
    const groundGeometry = new THREE.BoxGeometry(10, 1, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -2;
    scene.add(ground);

    // Create T-Rex
    const trexGeometry = new THREE.BoxGeometry(1, 2, 1);
    const trexMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const trex = new THREE.Mesh(trexGeometry, trexMaterial);
    trex.position.y = 0;
    scene.add(trex);

    camera.position.z = 5;

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

    // Game Loop
    function animate() {
      requestAnimationFrame(animate);
      
      if (jump) {
        trex.position.y += velocity;
        velocity -= 0.005;
        if (trex.position.y <= 0) {
          trex.position.y = 0;
          jump = false;
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const submitScore = async () => {
    await axios.post("http://localhost:5000/score", { playerName: "Player", score });
    alert("Score submitted!");
  };

  return (
    <div>
      <h1>T-Rex 3D Game</h1>
      <div ref={mountRef} style={{ width: "100vw", height: "80vh" }} />
      <button onClick={() => setScore(score + 1)}>Increase Score</button>
      <button onClick={submitScore}>Submit Score</button>
    </div>
  );
};

export default App;