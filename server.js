const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");

// Use middleware to help us read req.body, for submitted forms!
app.use(express.urlencoded({ extended: false }));

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
app.use(cookieParser());

app.use(express.static("./public"));
app.use(express.static("./images"));

app.get("/", (req, res) => {
    console.log("get req to / route just happened!");
    res.render("home", {
        layouts: "main",
    });
});

app.post("/", (req, res) => {
    // console.log("req.body: ", req.body);
    db.addSigner(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            console.log("yay it worked");
            res.cookie("signed", true);
            res.redirect("/thanks");
        })
        .catch((err) => console.log("err in addSigner: ", err));
});

app.get("/thanks", (req, res) => {
    console.log("get req to '/thanks' route just happened!");
    if (req.cookies.signed) {
        console.log("Succesfully signed!");
        res.send(`<h1>Thank you for signing our Petition!</h1>`);
    } else {
        console.log("tried to enter '/thanks' route without signing petition");
        res.redirect("/");
    }

    // res.render("home", {
    //     layouts: "main",
    // });
    // res.send(
    //     `<h1>You cannot access any page without accepting the cookies.</h1>`
    // );
});

app.get("/signers", (req, res) => {
    db.getSigners().then((result) => {
        if (req.cookies.signed) {
            console.log("Succesfully signed!");
            // console.log("result.rows.length: ", result.rows.length);
            // console.log("result.rows: ", result.rows);
            res.render("signers", {
                layouts: "main",
                signers: result.rows,
            });
        } else {
            console.log(
                "tried to enter '/signers' route without signing petition"
            );
            res.redirect("/");
        }
    });
    console.log("get req to / route just happened!");
    // res.render("home", {
    //     layouts: "main",
    // });
});

// app.get("/", (req, res) => {});

// app.get("/actors", (req, res) => {
//     db.getActors()
//         .then((results) => console.log("results from getActors", results.rows))
//         .catch((err) => console.log("err in getActors: ", err));
// });

// app.post("/add-actor", (req, res) => {
//     db.addActor("Name", "Age", "Number of Oscars")
//         .then(() => {
//             console.log("yay it worked");
//         })
//         .catch((err) => console.log("err in addActor: ", err));
// });

app.listen(PORT, () => console.log("petition server is listening..."));
