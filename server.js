const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

// Use middleware to help us read req.body, for submitted forms!
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8080;
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
    if (req.session.userid) {
        console.log("already registered");
        res.redirect("/petition");
    } else {
        console.log("get req to '/register' route just happened!");
        res.render("register", {
            layouts: "main",
        });
    }
});

app.post("/register", (req, res) => {
    if (req.session.userid) {
        res.redirect("/petition");
    } else {
        if (req.body.password === "") {
            console.log("!!!Password can't be empty!!!");
            return res.redirect("/register");
        }
        db.insertUser(
            req.body.first,
            req.body.last,
            req.body.email,
            req.body.password
        )
            .then((result) => {
                req.session.userid = result.rows[0].id;
                // console.log("req.session.userid: ", req.session.userid);
                console.log("yay it worked");
                res.redirect("/profile");
            })
            .catch((err) => console.log("err in insertUser: ", err));
    }
});

app.get("/login", (req, res) => {
    if (req.session.userid) {
        res.redirect("/petition");
    }
    console.log("get req to '/login' route just happened!");
    res.render("login", {
        layouts: "main",
    });
});

app.post("/login", (req, res) => {
    if (req.session.userid) {
        res.redirect("/petition");
    } else {
        db.authenticate(req.body.email, req.body.password)
            .then((resultObj) => {
                // if (authentication) {
                console.log("resultObj: ", resultObj);
                if (resultObj.passwordCheck) {
                    req.session.userid = resultObj.userid;
                    req.session.profile = true;
                    console.log("yay it worked");
                    res.redirect("/petition");
                    // } else {
                } else {
                    console.log("not authenticated correctly");
                    res.redirect("/login");
                }
                // return passwordCheck;
                // console.log("resultArr[0]: ", resultArr[0]);
                // console.log("resultArr[1]: ", resultArr[1]);
                // const passwordCheck = resultArr[0];
                // const id = resultArr[1];

                // console.log("result: ", result);
                // req.session.Id = result.rows[0].id;

                // }
                // req.session.Id = id;
                // console.log("req.session.signatureId: ", req.session.Id.rows);
            })
            .catch((err) => {
                console.log("err in authenticate: ", err);
                res.redirect("/login");
            });
    }
});

app.get("/petition", (req, res) => {
    console.log("req.session.userid in /petition: ", req.session.userid);
    // console.log(
    //     "db.checkSignatureCookie(req.session.userid): ",
    //     db.checkSignatureCookie(req.session.userid)
    // );
    if (req.session.userid) {
        console.log("logged in");
        if (req.session.signatureid) {
            res.redirect("/thanks");
        } else {
            db.checkSignatureCookie(req.session.userid)
                .then((result) => {
                    console.log("result.rows: ", result.rows);
                    console.log("result.rows[0]: ", result.rows[0]);
                    if (result.rows[0] != undefined) {
                        console.log("result.rows ist nicht leer!!!!!");
                        console.log("Already signed");
                        req.session.signatureid = result.rows[0].id;
                        res.redirect("/thanks");
                    } else {
                        console.log("Not signed yet");
                        res.render("home", {
                            layouts: "main",
                        });
                    }
                })
                .catch((err) =>
                    console.log("err in checkSignatureCookie: ", err)
                );
        }
    } else {
        console.log("user not logged in");
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    // console.log("req.body: ", req.body);
    // console.log("req.session.userid: ", req.session.userid);
    // console.log("req.body.signature: ", req.body.signature);
    if (req.session.signatureid) {
        res.redirect("/thanks");
    } else {
        db.addSigner(req.session.userid, req.body.signature)
            .then((result) => {
                req.session.signatureid = result.rows[0].id;
                // req.session.signatureid = id;
                // console.log("req.session.signatureid: ", req.session.signatureid);
                console.log(
                    "yay the signature was inserted into the signatures database and the signatureid cookie was set"
                );
                res.redirect("/thanks");
            })
            .catch((err) => console.log("err in addSigner: ", err));
    }
});

// request to render the "thanks" page to thank the signers after signing
// and show them how many people have already signed and a link to those people
app.get("/thanks", (req, res) => {
    console.log("get req to '/thanks' route just happened!");
    console.log("req.session.userid in /thanks: ", req.session.userid);

    if (req.session.signatureid && req.session.userid) {
        console.log("Succesfully signed!");
        console.log("req.session.userid: ", req.session.userid);
        console.log("req.session.signatureid: ", req.session.signatureid);
        db.getSignature(req.session.userid)
            .then((result) => {
                console.log("getSignature result: ", result);
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
    db.getSigners()
        .then((result) => {
            if (req.session.userid && req.session.signatureid) {
                console.log("Succesfully signed!");
                // console.log("result.rows.length: ", result.rows.length);
                console.log("result.rows: ", result.rows);
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
        })
        .catch((err) => console.log("err in getSigners: ", err));
});

app.get("/profile", (req, res) => {
    if (req.session.profile) {
        console.log("already set or skipped profile");
        res.redirect("/profile-edit");
    } else {
        res.render("profiles");
    }
});

app.post("/profile", (req, res) => {
    if (!req.session.userid) {
        res.redirect("/petition");
    } else {
        console.log("req.body: ", req.body);
        db.insertProfile(req.body, req.session)
            .then(() => {
                req.session.profile = true;
                res.redirect("/petition");
            })
            .catch((err) => console.log("err in insertProfile:", err));
    }
    //1. retrieve the information (req.body)
    //2. sanitize your data
    //      - only allow https urls (check the url starts with http)
    //          - If not: send back an error or add it yourself
    //      - check the age is a number
    //      - check that the city is capitalized nicely
    //3. Store the information in your profile
    //4. Redirect to "/signature"
});

app.get("/profile-edit", (req, res) => {
    db.getProfileData(req.session.userid)
        .then((result) => {
            console.log("result.rows: ", result.rows);
            res.render("profiles-edit", {
                profileData: result.rows,
            });
        })
        .catch((err) => console.log("err in getProfileDate: ", err));
});

app.post("/profile-edit", (req, res) => {
    if (!req.session.userid) {
        res.redirect("/petition");
    } else {
        // 1. Update the users table
        // a. with password
        // db.updateUserWithPassword
        // Make sure you hash the password first.
        // b. without password
        // db.updateUserWithoutPassword
        // 2. Update the profiles table
        // a. we already have profile info
        // b. no profile info yet
        // ➡️ Use an UPSERT query

        let userUpdatePromise;

        // If you feel adventorous, try to do this with Promise.all()
        // })
        console.log("req.body: ", req.body);
        req.body.id = req.session.userid;
        const password = req.body.password;
        if (password === "") {
            userUpdatePromise = db.updateUserWithoutPassword(req.body);
        } else {
            userUpdatePromise = db.updateUserWithPassword(req.body);
        }

        userUpdatePromise
            .then(() => {
                return db.upsertProfile(req.body);
            })
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log(err);
            });
    }
    // db.insertProfile(req.body, req.session)
    //     .then(() => {
    //         req.session.profile = true;
    //         res.redirect("/petition");
    //     })
    //     .catch((err) => console.log("err in insertProfile:", err));
    //1. retrieve the information (req.body)
    //2. sanitize your data
    //      - only allow https urls (check the url starts with http)
    //          - If not: send back an error or add it yourself
    //      - check the age is a number
    //      - check that the city is capitalized nicely
    //3. Store the information in your profile
    //4. Redirect to "/signature"
});

app.get("/signers/:city", (req, res) => {
    console.log("req.params.city: ", req.params.city);
    const city = req.params.city;
    console.log("req.body: ", req.body);

    db.getSigners(city)
        .then((result) => {
            if (req.session.userid && req.session.signatureid) {
                console.log("Succesfully signed!");
                // console.log("result.rows.length: ", result.rows.length);
                console.log("result.rows: ", result.rows);
                res.render("signers_city", {
                    signers: result.rows,
                });
            } else {
                console.log(
                    "tried to enter '/signers' route without signing petition"
                );
                res.redirect("/petition");
            }
        })
        .catch((err) => console.log("err in getSigners: ", err));
});

app.get("/logout", (req, res) => {
    console.log("user logged out");
    req.session = undefined;
    res.redirect("/register");
});

app.get("/petition/delete", (req, res) => {
    if (!req.session.signatureid) {
        res.redirect("/petition");
    } else {
        res.render("delete-signature");
    }
});

app.get("/petition/delete-account", (req, res) => {
    if (!req.session.signatureid) {
        res.redirect("/petition");
    } else {
        res.render("delete-account");
    }
});
app.post("/petition/delete", (req, res) => {
    // const permission = prompt(
    //     "Do you really want to delete your signature and withdraw from the petition?"
    // );
    // if (permission) {
    if (!req.session.signatureid) {
        res.redirect("/petition");
    } else {
        console.log("req.session.userid: ", req.session.userid);
        db.deleteSignature(req.session.userid)
            .then(() => {
                console.log("Signature deleted");
                req.session.signatureid = undefined;
                console.log(
                    "req.session.signatureid after deleting signature: ",
                    req.session.signatureid
                );
                // }
                res.redirect("/petition");
            })
            .catch((err) => console.log("err in deleteSignature: ", err));
    }
});

app.post("/petition/delete-account", (req, res) => {
    if (!req.session.userid) {
        res.redirect("/petition");
    } else {
        // if (
        //     confirm(
        //         "Do you really want to delete your signature and withdraw from the petition?"
        //     )
        // ) {
        console.log("req.session.userid: ", req.session.userid);
        db.deleteAccount(req.session.userid)
            .then(() => {
                console.log(`Account of user ${req.session.userid} deleted`);
                req.session = undefined;
                // }
                res.redirect("/register");
            })
            .catch((err) => console.log("err in deleteAccount: ", err));
    }
});

if (require.main == module) {
    app.listen(PORT, () => console.log("petition server is listening..."));
}

exports.app = app;
