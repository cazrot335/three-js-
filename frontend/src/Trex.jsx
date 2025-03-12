import React, { useEffect, useState, useRef } from 'react';

const TRexGame = () => {
  // Game container ref
  const gameContainerRef = useRef(null);
  const dinoRef = useRef(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Game variables using refs to persist between renders
  const gameStateRef = useRef({
    isJumping: false,
    isDucking: false,
    animationSpeed: 6,
    obstacleInterval: 1500,
    lastObstacleTime: 0,
    cloudInterval: 4000,
    lastCloudTime: 0,
    obstacles: [],
    clouds: [],
    animationFrame: 0,
    frameCounter: 0,
    dinoY: 0,
    dinoVelocity: 0,
    gameStartTime: 0,
    lastTime: 0,
    animationId: null
  });
  
  // Dino states
  const dinoStates = {
    running: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 43"><path d="M11 17v-5h9v5h6v-8h7v8h1v9h-3v-6h-5v6h-6v9h-9v-4h-7v5h-3v-9h8v-5z" fill="#535353"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 43"><path d="M11 17v-5h9v5h6v-8h7v8h1v9h-3v-6h-5v6h-6v9h-9v-4h-3v5h-7v-9h8v-5z" fill="#535353"/></svg>'
    ],
    jumping: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 43"><path d="M11 17v-5h9v5h6v-8h7v8h1v9h-3v-6h-5v6h-6v9h-9v-4h-7v5h-3v-9h8v-5z" fill="#535353"/></svg>',
    ducking: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 25"><path d="M17 12v-3h6v3h5v-6h7v6h1v8h-3v-5h-5v5h-6v5h-9v-2h-7v3h-6v-9h5v5h4v-7z" fill="#535353"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 25"><path d="M17 12v-3h6v3h5v-6h7v6h1v8h-3v-5h-5v5h-6v5h-9v-2h-3v3h-10v-9h5v5h4v-7z" fill="#535353"/></svg>'
    ],
    dead: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 43"><path d="M11 17v-5h9v5h6v-8h7v8h1v9h-3v-6h-5v6h-6v9h-9v-4h-7v5h-3v-9h8v-5z" fill="#535353"/><path d="M16 8h4v4h-4z M29 8h4v4h-4z" fill="white"/></svg>'
  };
  
  // Obstacle types
  const obstacleTypes = {
    smallCactus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 40"><path d="M5 30v-13h2v-9h2v9h4v-9h2v9h2v13z" fill="#535353"/></svg>',
    largeCactus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 50"><path d="M8 35v-23h2v-12h3v12h4v-12h3v12h2v23z" fill="#535353"/></svg>',
    multipleCacti: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 40"><path d="M5 30v-13h2v-9h2v9h4v-9h2v9h2v13z M23 30v-13h2v-9h2v9h4v-9h2v9h2v13z M41 30v-13h2v-9h2v9h4v-9h2v9h2v13z" fill="#535353"/></svg>',
    bird: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40"><path d="M11 15h25v6h-10v2h5v6h-5v2h-5v-2h-10z M44 18h-6v-3h-4v3h-2v3h2v3h4v-3h6z" fill="#535353"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40"><path d="M11 15h25v6h-10v2h5v6h-5v2h-5v-2h-10z M44 11h-6v-3h-4v3h-2v3h2v3h4v-3h6z" fill="#535353"/></svg>'
    ]
  };
  
  // Cloud SVG
  const cloudSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 20"><path d="M5 14h50c-1-4-5-12-10-12-3 0-5 2-5 2s-7-6-15-2c-8 4-20 12-20 12z" fill="#535353"/></svg>';
  
  // Initialize game
  const initGame = () => {
    const gameState = gameStateRef.current;
    
    setScore(0);
    setIsGameOver(false);
    
    gameState.animationSpeed = 6;
    gameState.obstacleInterval = 1500;
    gameState.isJumping = false;
    gameState.isDucking = false;
    gameState.obstacles = [];
    gameState.clouds = [];
    gameState.dinoY = 0;
    gameState.dinoVelocity = 0;
    gameState.lastObstacleTime = 0;
    gameState.lastCloudTime = 0;
    gameState.gameStartTime = Date.now();
    gameState.lastTime = 0;
    
    // Clear existing obstacles and clouds
    if (gameContainerRef.current) {
      const obstacles = gameContainerRef.current.querySelectorAll('.cactus, .bird, .clouds');
      obstacles.forEach(el => el.remove());
    }
    
    // Set initial dino state
    if (dinoRef.current) {
      dinoRef.current.style.width = '40px';
      dinoRef.current.style.height = '43px';
      dinoRef.current.innerHTML = dinoStates.running[0];
    }
    
    // Start the game loop
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
    }
    gameState.animationId = requestAnimationFrame(gameLoop);
  };
  
  // Game loop
  const gameLoop = (timestamp) => {
    const gameState = gameStateRef.current;
    
    if (isGameOver) return;
    
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    
    // Update score
    const currentTime = Date.now();
    const newScore = Math.floor((currentTime - gameState.gameStartTime) / 100);
    setScore(newScore);
    
    // Increase difficulty
    if (newScore > 0 && newScore % 100 === 0) {
      gameState.animationSpeed += 0.05;
      if (gameState.obstacleInterval > 500) {
        gameState.obstacleInterval -= 50;
      }
    }
    
    // Update dino animation
    gameState.frameCounter += deltaTime;
    if (gameState.frameCounter > 100) {
      gameState.animationFrame = 1 - gameState.animationFrame; // Toggle between 0 and 1
      gameState.frameCounter = 0;
      
      if (!gameState.isJumping && dinoRef.current) {
        if (gameState.isDucking) {
          dinoRef.current.innerHTML = dinoStates.ducking[gameState.animationFrame];
        } else {
          dinoRef.current.innerHTML = dinoStates.running[gameState.animationFrame];
        }
      }
    }
    
    // Handle dino jumping
    if (gameState.isJumping && dinoRef.current) {
      // Improved jump physics for better obstacle clearing
      gameState.dinoVelocity += 0.6; // Gravity - lower value makes jump higher
      gameState.dinoY += gameState.dinoVelocity;
      
      if (gameState.dinoY >= 0) {
        gameState.dinoY = 0;
        gameState.isJumping = false;
        gameState.isDucking = false;
        dinoRef.current.style.width = '40px';
        dinoRef.current.style.height = '43px';
      }
      
      dinoRef.current.style.transform = `translateY(${-gameState.dinoY}px)`;
    }
    
    // Generate obstacles
    if (currentTime - gameState.lastObstacleTime > gameState.obstacleInterval) {
      generateObstacle();
      gameState.lastObstacleTime = currentTime;
    }
    
    // Generate clouds
    if (currentTime - gameState.lastCloudTime > gameState.cloudInterval) {
      generateCloud();
      gameState.lastCloudTime = currentTime;
    }
    
    // Move obstacles
    moveObstacles(deltaTime);
    
    // Move clouds
    moveClouds(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Continue the game loop
    gameState.animationId = requestAnimationFrame(gameLoop);
  };
  
  // Jump function with improved physics
  const jump = () => {
    const gameState = gameStateRef.current;
    
    if (!gameState.isJumping && !isGameOver && dinoRef.current) {
      gameState.isJumping = true;
      gameState.dinoVelocity = -12; // Increased initial upward velocity
      dinoRef.current.innerHTML = dinoStates.jumping;
    }
  };
  
  // Duck function
  const duck = () => {
    const gameState = gameStateRef.current;
    
    if (!isGameOver && dinoRef.current) {
      if (gameState.isJumping) {
        gameState.dinoVelocity += 3; // Fall faster
      } else {
        gameState.isDucking = true;
        dinoRef.current.style.width = '55px';
        dinoRef.current.style.height = '25px';
        dinoRef.current.innerHTML = dinoStates.ducking[gameState.animationFrame];
      }
    }
  };
  
  // Stop ducking
  const stopDucking = () => {
    const gameState = gameStateRef.current;
    
    if (!isGameOver && !gameState.isJumping && dinoRef.current) {
      gameState.isDucking = false;
      dinoRef.current.style.width = '40px';
      dinoRef.current.style.height = '43px';
      dinoRef.current.innerHTML = dinoStates.running[gameState.animationFrame];
    }
  };
  
  // Generate obstacle
  const generateObstacle = () => {
    if (!gameContainerRef.current) return;
    
    const gameState = gameStateRef.current;
    const obstacle = document.createElement('div');
    
    // Randomly choose obstacle type
    const random = Math.random();
    if (score > 500 && random < 0.3) {
      // Bird
      obstacle.className = 'bird';
      obstacle.innerHTML = obstacleTypes.bird[0];
      obstacle.type = 'bird';
      
      // Random height for birds
      const heights = [20, 50, 80];
      obstacle.style.bottom = heights[Math.floor(Math.random() * heights.length)] + 'px';
    } else {
      // Cactus
      obstacle.className = 'cactus';
      
      if (random < 0.5) {
        obstacle.innerHTML = obstacleTypes.smallCactus;
        obstacle.style.width = '20px';
        obstacle.style.height = '40px';
      } else if (random < 0.8) {
        obstacle.innerHTML = obstacleTypes.largeCactus;
        obstacle.style.width = '25px';
        obstacle.style.height = '50px';
      } else {
        obstacle.innerHTML = obstacleTypes.multipleCacti;
        obstacle.style.width = '50px';
        obstacle.style.height = '40px';
      }
      
      obstacle.type = 'cactus';
    }
    
    gameContainerRef.current.appendChild(obstacle);
    gameState.obstacles.push({
      element: obstacle,
      animationFrame: 0,
      frameCounter: 0
    });
  };
  
  // Generate cloud
  const generateCloud = () => {
    if (!gameContainerRef.current) return;
    
    const gameState = gameStateRef.current;
    const cloud = document.createElement('div');
    cloud.className = 'clouds';
    cloud.innerHTML = cloudSvg;
    cloud.style.width = '60px';
    
    // Random height for clouds
    const heights = [60, 80, 100, 120];
    cloud.style.bottom = heights[Math.floor(Math.random() * heights.length)] + 'px';
    
    gameContainerRef.current.appendChild(cloud);
    gameState.clouds.push({
      element: cloud
    });
  };
  
  // Move obstacles
  const moveObstacles = (deltaTime) => {
    const gameState = gameStateRef.current;
    
    gameState.obstacles.forEach((obstacle, index) => {
      const obstacleElement = obstacle.element;
      const currentPosition = parseInt(obstacleElement.style.right || -obstacleElement.offsetWidth);
      const newPosition = currentPosition + gameState.animationSpeed;
      
      obstacleElement.style.right = newPosition + 'px';
      
      // Remove obstacles that are off screen
      if (newPosition > (gameContainerRef.current?.offsetWidth || 0) + obstacleElement.offsetWidth) {
        obstacleElement.remove();
        gameState.obstacles.splice(index, 1);
      }
      
      // Animate birds
      if (obstacle.element.type === 'bird') {
        obstacle.frameCounter += deltaTime;
        if (obstacle.frameCounter > 200) {
          obstacle.animationFrame = 1 - obstacle.animationFrame; // Toggle between 0 and 1
          obstacle.element.innerHTML = obstacleTypes.bird[obstacle.animationFrame];
          obstacle.frameCounter = 0;
        }
      }
    });
  };
  
  // Move clouds
  const moveClouds = (deltaTime) => {
    const gameState = gameStateRef.current;
    
    gameState.clouds.forEach((cloud, index) => {
      const cloudElement = cloud.element;
      const currentPosition = parseInt(cloudElement.style.right || -cloudElement.offsetWidth);
      const newPosition = currentPosition + (gameState.animationSpeed / 2); // Clouds move slower
      
      cloudElement.style.right = newPosition + 'px';
      
      // Remove clouds that are off screen
      if (newPosition > (gameContainerRef.current?.offsetWidth || 0) + cloudElement.offsetWidth) {
        cloudElement.remove();
        gameState.clouds.splice(index, 1);
      }
    });
  };
  
  // Check collisions
  const checkCollisions = () => {
    if (!dinoRef.current || !gameContainerRef.current) return;
    
    const gameState = gameStateRef.current;
    
    const dinoRect = {
      x: dinoRef.current.offsetLeft,
      y: dinoRef.current.offsetTop + gameContainerRef.current.offsetHeight - dinoRef.current.offsetHeight,
      width: dinoRef.current.offsetWidth,
      height: dinoRef.current.offsetHeight
    };
    
    gameState.obstacles.forEach(obstacle => {
      const obstacleRect = {
        x: gameContainerRef.current.offsetWidth - parseInt(obstacle.element.style.right || 0) - obstacle.element.offsetWidth,
        y: obstacle.element.offsetTop + gameContainerRef.current.offsetHeight - obstacle.element.offsetHeight,
        width: obstacle.element.offsetWidth,
        height: obstacle.element.offsetHeight
      };
      
      // Adjust hitbox based on dino state
      let adjustedDinoRect = { ...dinoRect };
      if (gameState.isDucking) {
        adjustedDinoRect.width *= 0.8; // Smaller hitbox when ducking
      }
      
      // Adjust hitbox for obstacle type
      let adjustedObstacleRect = { ...obstacleRect };
      if (obstacle.element.type === 'bird') {
        adjustedObstacleRect.width *= 0.7;
        adjustedObstacleRect.height *= 0.7;
      }
      
      // Check for collision
      if (
        adjustedDinoRect.x < adjustedObstacleRect.x + adjustedObstacleRect.width &&
        adjustedDinoRect.x + adjustedDinoRect.width > adjustedObstacleRect.x &&
        adjustedDinoRect.y < adjustedObstacleRect.y + adjustedObstacleRect.height &&
        adjustedDinoRect.y + adjustedDinoRect.height > adjustedObstacleRect.y
      ) {
        gameOver();
      }
    });
  };
  
  // Game over
  const gameOver = () => {
    const gameState = gameStateRef.current;
    
    setIsGameOver(true);
    
    if (dinoRef.current) {
      dinoRef.current.innerHTML = dinoStates.dead;
    }
    
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
      gameState.animationId = null;
    }
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('trexHighScore', score);
    }
  };
  
  // Effect for initializing the game
  useEffect(() => {
    // Get high score from local storage
    const savedHighScore = localStorage.getItem('trexHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Initialize the game
    initGame();
    
    // Event listeners for keyboard
    const handleKeyDown = (event) => {
      if ((event.code === 'Space' || event.code === 'ArrowUp') && !gameStateRef.current.isJumping) {
        jump();
      } else if (event.code === 'ArrowDown') {
        duck();
      }
    };
    
    const handleKeyUp = (event) => {
      if (event.code === 'ArrowDown') {
        stopDucking();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      const gameState = gameStateRef.current;
      if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">T-Rex Runner</h1>
      
      <div 
        ref={gameContainerRef}
        className="relative w-full max-w-2xl h-72 border border-gray-300 bg-white overflow-hidden"
        onClick={() => {
          if (!gameStateRef.current.isJumping) {
            jump();
          }
        }}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="absolute top-2 right-2 text-xl font-bold">{score}</div>
        <div className="absolute top-2 left-2 text-sm">HI: {highScore}</div>
        <div 
          ref={dinoRef} 
          className="absolute bottom-0 left-12 w-10 h-10 bg-transparent transition-transform"
        ></div>
        <div className="absolute w-full h-px bottom-0 bg-black"></div>
        {isGameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
            GAME OVER
          </div>
        )}
      </div>
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        onClick={initGame}
      >
        Restart
      </button>
      
      <p className="mt-4 text-center">
        Press Space, Up Arrow or tap to jump. Press Down Arrow to duck (when in air).
      </p>
    </div>
  );
};

export default TRexGame;