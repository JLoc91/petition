const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const PORT = 8080;
const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};

//Handlebars config
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");
//END Handlebars config

console.log("db in server.js: ", db);

app.use(express.static("./public"));
app.use(express.static("./images"));

app.get("/", (req, res) => {
    console.log("get req to / route just happened!");
    res.render("home", {
        layouts: "main",
    });
});

app.post("/", (req, res) => {
    db.addSigner(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            console.log("yay it worked");
        })
        .catch((err) => console.log("err in addSigner: ", err));
});

// app.get("/", (req, res) => {});

app.get("/actors", (req, res) => {
    db.getActors()
        .then((results) => console.log("results from getActors", results.rows))
        .catch((err) => console.log("err in getActors: ", err));
});

app.post("/add-actor", (req, res) => {
    db.addActor("Name", "Age", "Number of Oscars")
        .then(() => {
            console.log("yay it worked");
        })
        .catch((err) => console.log("err in addActor: ", err));
});

app.listen(PORT, () => console.log("petition server is listening..."));
