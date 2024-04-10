const mongoose = require("mongoose");

const username = "nitya";
const password = encodeURIComponent("123nitya"); // URL encode the password if it contains special characters
const cluster = "cluster0";
const database = "login";

const DB = `mongodb+srv://${username}:${password}@${cluster}.pzfg03x.mongodb.net/${database}?retryWrites=true&w=majority`;

mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => console.log("Database Connected")).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
