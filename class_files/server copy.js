const express = require("express");
const app = express();
const db = require("./db");
const PORT = 8080;

console.log("db in server.js: ", db);

app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("get req to / route just happened!");
});

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
