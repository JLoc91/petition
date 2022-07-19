const express = require("express");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
app.use(
    cookieSession({
        secret: `Dumm ist der, der dummes tut.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

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
    res.redirect("/petition");
});

app.get("/register", (req, res) => {
    // if (req.cookies.session) {
    //     console.log("already signed petition");
    //     res.redirect("/thanks");
    // } else {
    //     console.log("get req to / route just happened!");
    //     res.render("home", {
    //         layouts: "main",
    //     });
    // }
    console.log("get req to '/register' route just happened!");
    res.render("register", {
        layouts: "main",
    });
});

app.post("/register", (req, res) => {
    db.insertUser(
        req.body.first,
        req.body.last,
        req.body.email,
        req.body.password
    )
        .then((id) => {
            req.session.signatureId = id;
            console.log(
                "req.session.signatureId: ",
                req.session.signatureId.rows
            );
            console.log("yay it worked");
            res.redirect("/petition");
        })
        .catch((err) => console.log("err in insertUser: ", err));
});

app.get("/login", (req, res) => {
    console.log("get req to '/login' route just happened!");
    res.render("login", {
        layouts: "main",
    });
});

app.post("/login", (req, res) => {
    db.authenticate(req.body.email, req.body.password)
        .then((result) => {
            // if (authentication) {
            req.session.id = result.rows[0].id;
            console.log("result: ", result);
            // req.session.Id = result.rows[0].id;
            console.log("yay it worked");
            res.redirect("/petition");
            // } else {
            console.log("not authenticated correctly");
            res.redirect("/login");
            // }
            // req.session.Id = id;
            // console.log("req.session.signatureId: ", req.session.Id.rows);
        })
        .catch((err) => console.log("err in authenticate: ", err));
});

app.get("/petition", (req, res) => {
    if (req.cookies.session) {
        console.log("already signed petition");
        res.redirect("/thanks");
    } else {
        console.log("get req to / route just happened!");
        res.render("home", {
            layouts: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log("req.body: ", req.body);
    db.addSigner(req.session.id, req.body.signature)
        .then(() => {
            // req.session.signatureId = id;
            // console.log(
            //     "req.session.signatureId: ",
            //     req.session.signatureId.rows
            // );
            console.log(
                "yay the signature was inserted into the signatures database"
            );
            // res.cookie("signed", true);
            res.redirect("/thanks");
        })
        .catch((err) => console.log("err in addSigner: ", err));
});

// request to render the "thanks" page to thank the signers after signing
// and show them how many people have already signed and a link to those people
app.get("/thanks", (req, res) => {
    console.log("get req to '/thanks' route just happened!");
    if (req.cookies.session) {
        console.log("Succesfully signed!");
        db.getSignature(req.session.signatureId)
            .then((result) => {
                const signature = result.rows[0].signature;
                db.getNumSigners()
                    .then((result) => {
                        // console.log("result.rows[0].count: ", result.rows[0].count);
                        const numSigners = result.rows[0].count;
                        res.render("thanks", {
                            signature,
                            numSigner: result.rows[0].count,
                        });
                    })
                    .catch((err) => console.log("err in getNumSigners: ", err));
            })
            .catch((err) => console.log("err in getSignature: ", err));
    } else {
        console.log("tried to enter '/thanks' route without signing petition");
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    db.getSigners().then((result) => {
        if (req.cookies.session) {
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
            res.redirect("/petition");
        }
    });
});

app.listen(PORT, () => console.log("petition server is listening..."));
