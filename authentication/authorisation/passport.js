// This library helps us to authenticate users using passport.js
// passportjs.org  is the official documentation. We can use google, twitter, facebook signup using passport.

// There we have a lot of strategies : google, discord, linkedin, spotify, facebook, apple id login and more.
// we will do basic login/signup using email and password.

// npm i passport
// npm i passport-local
// npm i passport-local-mongoose => Specially for websites using mongodb as db.

const passport = require("passport"); // used for authentication
const localStrategy = require("passport-local");
const User = require("./models/User");

app.use(passport.initialize()); // we have to do it after app.use(sessionOptions).
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // User.authenticate() is a method provided by passport-local-mongoose.

// This is how , we authenticate using passport. We pass passport.authenticate() as middleware
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

// This is how, we register a new user using Passport
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  let { username, password, email } = req.body;
  const newUser = new User({ email, username });
  await User.register(newUser, password);
  res.redirect("/");
});

// req.isAuthenticate(), it tells us whether the user has logged in or not.
// when the user gets logged in, req.user() will be available. Containing the user details.
// either we can implement this logic everywhere to check whether the user has logged in or not
// or we can just use passport.authenticate() as middleware to check whether the user has logged in or not.

app.post("/register", async (req, res) => {
  let { username, password, email } = req.body;
  const newUser = new User({ email, username });
  await User.register(newUser, password);
  req.login(newUser, (err) => {
    res.send(err);
  });
  // This code will automatically log in the user after registration.
  res.redirect("/");
});

