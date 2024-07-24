// What is Session: When our client interacts with the server, that single interaction is called a session.
// What is protocol : It is the rule using which the client and server communicate.

// Stateful Protocols: This requires the server to save the status and session information.
// ftp is the best example for stateful protocol.

// Stateless Protocols: This does not require the server to save the status and session information.
// http is the best example for stateless protocol.

// now as we know that https are stateless, doesn't stores or carries information after refreshing webpages.
// We will now learn then, how can we store the information of the user in the server using express sessions.

// Express Sessions: It is an attempt to make our http session stateful.
// npm i express-session

// Starting a session using express-session:
const session = require("express-session");
app.use(
  session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// now we can see that we have started an express session, and we have provided a secret key to it.
// in the cookies tab under application section. we can see that a cookie is created with the name connect.sid
// and the value is a long string. This is the session id.
// Note: In the same browser, if we open a new tab and go to the same website, we can see that the session id is same.

app.get("/reqCheck", (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send(req.session.count.toString());
});

// Now we can see that the count is increasing everytime we refresh the page. This is how we can track the
// user actitivity on the website.

// but we should not store user information like this in the production environement as it will cause memory
// leakage. We should use express-stores for that.

// now we will see, how can we store the user info in a session and use it in the webpage.

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  console.log(req.session);
  req.session.name = name; // This will store the variable name in the session.
  res.send(name);
});
// Here we can see that req.session contains the session id and the cookie information.
// It includes, path , httpOnly, secure, maxAge of cookie, expiry time of cookie , sameSite, etc.

app.get("/hello", (req, res) => {
  res.send(`Hello ${req.session.name}`); // This is how we can access the session stored information.
});

// now we will see how can we add a cookie in a session:
// If we don't have expiry date for the cookie, it gets deleted on the exit of the browser.
// add cookie object to the sessionOptions.
let sessionOptions = { 
    cookie: {
        expires: Date.now() + 1000*60*60*24*3, // 3 days
        maxAge: 1000*60*60*24*3, // 3 days
        httpOnly: true, // This means that the cookie is only accessible by the server.
    } 
};
