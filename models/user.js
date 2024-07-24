// We will create schema for login/signup of users.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
});

// note: We don't need to declare username and password fields in the schema. passport-local-mongoose
//  will add them for us. We just need to add the email field.

UserSchema.plugin(passportLocalMongoose); // passed as a plugin.
// This plugin will automatically implement hashing, username, password, salting itself.

// passport has a lot of methods, including changePassword, authenticate 

module.exports = mongoose.model("User", UserSchema);
