require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/trex-game", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Score Schema & Model
const ScoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Score = mongoose.model("Score", ScoreSchema);

// API Routes
app.post("/score", async (req, res) => {
  try {
    const { playerName, score } = req.body;
    
    if (!playerName || !score) {
      return res.status(400).json({ message: "Player name and score are required" });
    }
    
    const newScore = new Score({ 
      playerName, 
      score: Math.floor(score) 
    });
    
    await newScore.save();
    res.status(201).json({ 
      message: "Score saved successfully!",
      score: newScore
    });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ message: "Server error while saving score" });
  }
});

app.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(10);
    
    res.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ message: "Server error while fetching scores" });
  }
});

app.get("/scores/player/:name", async (req, res) => {
  try {
    const playerName = req.params.name;
    const playerScores = await Score.find({ playerName })
      .sort({ score: -1 })
      .limit(5);
    
    res.json(playerScores);
  } catch (error) {
    console.error("Error fetching player scores:", error);
    res.status(500).json({ message: "Server error while fetching player scores" });
  }
});

// Catch-all route for production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));