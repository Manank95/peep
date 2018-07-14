//reference lecture code base https://github.com/Stevens-CS546/CS-546/tree/master/Lecture%20Code/lecture_10
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const configRoutes = require("./routes");

const static = express.static(__dirname + "/public");
const exphbs = require("express-handlebars");

const seed = require('./tasks/seed');
seed();

app.use("/public", static);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
    console.log("We 've got a server.");
    console.log("Your routes will be running on http://localhost:3000");
    //if (process && process.send) process.send({done: true});
});
 