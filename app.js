const express = require("express");
const app = express();
const port = 8080;

// Import necessary packages
const methodOverride = require("method-override");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { storage, cloudinary } = require("./cloudConfig");
const multer = require("multer");
const upload = multer({ storage });

// Importing the mongoose model containing data:
const MusicPlayer = require("./models/SongCard");
const toUpperCase = require("./utilities/toUpperCase");
const findIndexOfObject = require("./utilities/findIndex");

// Basic Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate"); // Specify the default layout file
app.use(methodOverride("_method")); // Method override

// Connect to MongoDB
main()
  .then((res) => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/MusicPlayer");
}

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", async (req, res) => {
  const songs = await MusicPlayer.find({});
  res.render("home", { songs });
});

// Add Music Route
app.get("/add", (req, res) => {
  res.render("addSong");
});

// Adding music to the db

app.post(
  "/add",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
  ]),
  async (req, res) => {
    let { title, artist, year } = req.body;
    title = toUpperCase(title);
    const id = uuidv4();
    let urlSong = "";
    let urlCoverPic = "";

    if (req.files["audio"]) {
      urlSong = req.files["audio"][0].path;
    } else {
      return res.status(400).send("No audio file uploaded.");
    }

    if (req.files["coverPic"]) {
      urlCoverPic = req.files["coverPic"][0].path;
    } else {
      return res.status(400).send("No cover picture uploaded.");
    }

    let newMusic = new MusicPlayer({
      id: id,
      title: title,
      artist: artist,
      year: year,
      urlSong: urlSong,
      urlCoverPic: urlCoverPic,
    });

    await newMusic.save();
    res.redirect("/");
  }
);

// playing page route
app.get("/play/:id", async (req, res) => {
  const { id } = req.params;
  const song = await MusicPlayer.find({ id: id });
  const allSongs = await MusicPlayer.find({});
  const index = findIndexOfObject(allSongs, id);
  const nextSong = allSongs[index + 1];
  res.render("play", {song, nextSong});
});


// Search Music using Navbar Route:
app.get("/search", async (req, res) => {
  let { music } = req.query;
  music = toUpperCase(music);
  music = music.trim();
  // console.log(music);
  let song = await MusicPlayer.find({ title: music });
  // console.log(song);
  res.render("search", { song });
});

// login route
app.get("/login", (req, res) => {
  res.render("login");
});

// register route
app.get("/register", (req, res) => {
  res.render("register");
});

// Song delete route
app.delete("/play/:id", async (req, res) => {
  let { id } = req.params;
  await MusicPlayer.findOneAndDelete({ id: id });
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
