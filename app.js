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


// Connect to MongoDB
const dbUrl = process.env.ATLASDB_URL;
main()
  .then((res) => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
  }





// Starting a session using express-session:
const session = require("express-session");
const sessionOptions = {
  secret: process.env.EXPRESS_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days tkk login rahega mera user.
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true, // This means that the cookie is only accessible by the server.
  },
};
app.use(session(sessionOptions));
// now we can see that we have started an express session, and we have provided a secret key to it.
// in the cookies tab under application section. we can see that a cookie is created with the name connect.sid
// and the value is a long string. This is the session id.
// Note: In the same browser, if we open a new tab and go to the same website, we can see that the session id is same.

// for login/signup and authentication:
const passport = require("passport"); // used for authentication
const LocalStrategy = require("passport-local");
const User = require("./models/user");

app.use(passport.initialize()); // we have to do it after app.use(sessionOptions).
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // User.authenticate() is a method provided by passport-local-mongoose.

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to make user object available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Adds req.user to the local variables
  next();
});

//now moving to login/signup Page.

// for alerts that operation has succeeded or failed:
// const flash = require("connect-flash");
// app.use(flash()); // remember, it has to be used after app.use(sessionOptions) and before app.use(passport.session());
// anything written inside the app.use() is a middleware. It will be called after every request on the webpage.

// app.use((req,res,next) => {
//   res.locals.success = (req.flash('success'));
//   next();
// });

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
// main()
//   .then((res) => {
//     console.log("connected to db");
//   })
//   .catch((err) => console.log(err));

// async function main() {
  //   await mongoose.connect("mongodb://127.0.0.1:27017/MusicPlayer");
  // }

// 

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15; // Number of songs per page
  const skip = (page - 1) * limit;

  try {
    // Fetch songs from the database with pagination
    const songs = await MusicPlayer.find().skip(skip).limit(limit);
    const totalSongs = await MusicPlayer.countDocuments();

    res.render("home", {
      songs,
      currentPage: page,
      totalPages: Math.ceil(totalSongs / limit),
      limit: limit
    });
  } catch (error) {
    res.status(500).send(error);
  }
});



// playing page route
app.get("/play/:id", async (req, res) => {
  const { id } = req.params;
  // res.locals.currentUser = req.user;
  const song = await MusicPlayer.find({ id: id });
  res.render("play", { song });
});

// Search Music using Navbar Route:
// Search Music using Navbar Route:
app.get("/search", async (req, res) => {
  // console.log(req.query);
  let { music, song } = req.query;
  music = toUpperCase(music);

  let results;
  if (song == "song") {
    results = await MusicPlayer.find({ title: { $regex: music} });
  } else if (song == "artist") {
    results = await MusicPlayer.find({ artist: { $regex: music } });
  }
  if (results.length == 0) {
    return res.render("notFound");
  }

  res.render("search", { music: results });
});


// register route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  let { username, password, email } = req.body;
  try {
    const newUser = new User({ email, username });
    await User.register(newUser, password);
    req.login(newUser, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (e) {
    res.render("authErr", {e});
  }
});


// Add Music Route
app.get("/add", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("addSong");
  } else {
    res.redirect("/login");
  }
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
    const author = req.user.username;
    title = toUpperCase(title);
    const id = uuidv4();
    let urlSong = "";
    let urlCoverPic = "";
    let songPublicId = "";
    let coverPicPublicId = "";

    if (req.files["coverPic"]) {
      const result = await cloudinary.uploader.upload(req.files["coverPic"][0].path, {
        resource_type: "image"
      });
      urlCoverPic = result.secure_url;
      coverPicPublicId = result.public_id;
    } else {
      return res.status(400).send("No cover picture uploaded.");
    }

    if (req.files["audio"]) {
      const result = await cloudinary.uploader.upload(req.files["audio"][0].path, {
        resource_type: "video"
      });
      urlSong = result.secure_url;
      songPublicId = result.public_id;
    } else {
      return res.status(400).send("No audio file uploaded.");
    }

    let newMusic = new MusicPlayer({
      id: id,
      title: title,
      artist: artist,
      year: year,
      urlSong: urlSong,
      urlCoverPic: urlCoverPic,
      songPublicId: songPublicId,
      coverPicPublicId: coverPicPublicId,
      author: author,
    });

    await newMusic.save();
    res.redirect("/");
  }
);


// login route
app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    console.log(err);
  });
  res.redirect("/");
});

// Song delete route
app.delete("/play/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    let { id } = req.params;
    try {
      const music = await MusicPlayer.findOneAndDelete({ id: id });

      if (music) {
        // Delete files from Cloudinary
        if (music.songPublicId) {
          const resultVideo = await cloudinary.uploader.destroy(music.songPublicId, { resource_type: "video" });
          // console.log("Video delete result:", resultVideo);
        }
        if (music.coverPicPublicId) {
          const resultImage = await cloudinary.uploader.destroy(music.coverPicPublicId, { resource_type: "image" });
          // console.log("Image delete result:", resultImage);
        }
        res.redirect("/");
      } else {
        res.status(404).send("Music not found.");
      }
    } catch (error) {
      console.error("Error deleting music:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
  // Alternative to use passport as middleware to check whether user has logged in or not.
  // let { id } = req.params;
  // await MusicPlayer.findOneAndDelete({ id: id });
  // res.redirect("/");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
