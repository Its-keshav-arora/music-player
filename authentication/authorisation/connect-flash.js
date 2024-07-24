// Let say, we performed something in our music app assume. We added or deleted a music or 
// we logged in or signed up in our website, so I need to show some alert that the operation was successful.
// So, we can use connect-flash for that.
// It's feature is: It appears for the once.
// The flash is a special area of the session used for storing messages, Messages are written to the flash
// and cleared after being displayed to the user.

// npm i connect-flash

const flash = require("connect-flash");
app.use(flash());
// anything written inside the app.use() is a middleware. It will be called after every request on the webpage.
// In flash, we have to pass 2 arguments, key & value, one is the name of the flash indicated let say success/fail
// and the other is the message displaying.

// Now, we will see how to use flash in our app.
app.get("/hello", (req,res) => {
    req.flash("success", "This is a success message");
    res.redirect("/home");
});

app.get("/home", (req,res) =>{
    const msg = (req.flash('success'));
    res.render("home", {msg}) // This is how we can access the flashes. Check on refreshing the page, it will disappear.
});

// we can also use res.locals instead.
/// replace the above code with this:
app.get("/hello", (req,res) => {
    req.flash("success", "This is a success message");
    res.redirect("/home");
});

app.get("/home", (req,res) =>{
    res.locals.messages = (req.flash('success')); // This is how , we can store the value
    res.render("home"); // This is how we can access the flashes. Check on refreshing the page, it will disappear.
});
// now to access above flash message in home.ejs, we will <%= messages %> in the ejs file.
// The benefit of doing this is, now we don't need to pass the variables during rendering.

// The more better way for this, to be used in a middleware, where we will store our flash messages in res.locals.
// So, we will create a middleware for that.

// Remember, the middleware should be used after the app.use(sessionOptions) middleware and before the passport middleware.

// Always flash messages in the boilerplate code just before the body for the messages to be displayed.