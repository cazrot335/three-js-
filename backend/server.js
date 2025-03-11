require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Score Schema & Model
const ScoreSchema = new mongoose.Schema({
  playerName: String,
  score: Number,
});

const Score = mongoose.model("Score", ScoreSchema);

// API Routes
app.post("/score", async (req, res) => {
  const { playerName, score } = req.body;
  const newScore = new Score({ playerName, score });
  await newScore.save();
  res.json({ message: "Score saved!" });
});

app.get("/scores", async (req, res) => {
  const scores = await Score.find().sort({ score: -1 }).limit(10);
  res.json(scores);
});

// Multiplayer: Handle real-time player positions
io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  socket.on("playerMove", (data) => {
    socket.broadcast.emit("updatePlayers", data);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
