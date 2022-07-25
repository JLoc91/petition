const spicedPg = require("spiced-pg");
const tableSignature = "signatures";
const tableUser = "users";
const tableProfiles = "profiles";
const bcrypt = require("bcryptjs");
const { profile } = require("console");
// const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);
let dbURL;

if (process.env.NODE_ENV === "production") {
    dbURL = process.env.DATABASE_URL;
} else {
    const { user, password, database } = require("./secrets.json");
    dbURL = `postgres:${user}:${password}@localhost:5432/${database}`;
}

const db = spicedPg(dbURL);

module.exports.getSigners = (city) => {
    console.log("city: ", city);
    if (city != undefined) {
        return db.query(
            `select first, last, age, city, url from ${tableUser}
            join ${tableSignature}
            on ${tableUser}.id = ${tableSignature}.user_id
            left outer join ${tableProfiles}
            on ${tableUser}.id = ${tableProfiles}.user_id
            where ${tableProfiles}.city = '${city}'`
        );
    } else {
        return db.query(
            `select first, last, age, city, url from ${tableUser}
            join ${tableSignature}
            on ${tableUser}.id = ${tableSignature}.user_id
            left outer join ${tableProfiles}
            on ${tableUser}.id = ${tableProfiles}.user_id;`
        );
    }
};

module.exports.getSignature = (user_id) => {
    // console.log("id.rows[0].id: ", id.rows[0].id);
    return db.query(`select signature from ${tableSignature}
                    where user_id = ${user_id}`);
};

module.exports.checkSignatureCookie = (user_id) => {
    console.log("user_id in checkSignatureCookie: ", user_id);
    return db.query(`select id from ${tableSignature}
                    where user_id = ${user_id}`);
};

module.exports.getNumSigners = () => {
    return db.query(`select count(signature) from ${tableSignature}`);
};

module.exports.addSigner = (userid, signature) => {
    // console.log("signature in addSigner: ", signature);
    // console.log("userid in addSigner: ", userid);
    return db.query(
        `INSERT INTO ${tableSignature}(user_id, signature)
        VALUES ($1, $2) returning id`,
        [userid, signature]
    );
};

function hashPassword(password) {
    //1. Generate a salt
    //2. Hash the password with the salt
    //3. Return the hash [PROMISE]
    return bcrypt
        .genSalt()
        .then((salt) => {
            const hash = bcrypt.hash(password, salt);
            console.log("hash in function: ", hash);
            return hash;
        })
        .catch((err) => console.log("error in hashPassword function: ", err));
}

module.exports.insertUser = (first, last, email, password) => {
    //1. Hash the user's password [PROMISE]
    //2. Insert into the database with a query
    //3. Return the entire row --> not necessary???
    // so that we can store the user's id in the session!

    return hashPassword(password)
        .then((hash) => {
            // console.log("hash: ", hash);
            first = capitalizeParameter(first);
            last = capitalizeParameter(last);
            return db.query(
                `INSERT INTO ${tableUser}(first, last, email, password)
        VALUES ($1, $2, $3, $4) returning id`,
                [first, last, email, hash]
            );
        })
        .catch((err) => console.log("err in hashPassword: ", err));
};

// Used for Login
// returns a promise. resolves:
// -the found users row if found
// -an error if anything goes wrong
// (no email found OR wrong password)
// module.exports.authenticate = (email, password) => {
module.exports.authenticate = (email, password) => {
    //1. Look for a user with the given email
    //2. If not found, throw an error!
    //3. Compare the given password with the hased password of the found user.
    // (use bcrypt!)
    //4. resolve
    //- return the found user (need it for adding to the session!)
    //-throw an error if password does not match!

    return findUser(email)
        .then((result) => {
            console.log("result.rows in findUser: ", result.rows[0].password);
            console.log("password in findUser: ", password);
            console.log("result.rows[0].id in findUser: ", result.rows[0].id);
            let userid = result.rows[0].id;
            const resultObj = {
                enteredPassword: password,
                dbPassword: result.rows[0].password,
                userid: result.rows[0].id,
            };

            return comparePassword(password, result.rows[0].password)
                .then((passwordCheck) => {
                    console.log("passwordCheck: ", passwordCheck);
                    resultObj.passwordCheck = passwordCheck;
                    console.log("resultObj in comparePassword: ", resultObj);
                    return resultObj;
                })
                .catch((err) => console.log("err in comparePassword: ", err));
        })
        .catch((err) => console.log("error in findUser: ", err));
};

function findUser(email) {
    console.log("email in findUser: ", email);
    return db.query(`select * from ${tableUser}
    where "email" = '${email}'`);
}

function comparePassword(password, dbPassword) {
    return bcrypt.compare(password, dbPassword);
}

module.exports.insertProfile = (input, cookie) => {
    const cleanInput = cleanProfileData(input);

    return db.query(
        `INSERT INTO ${tableProfiles}(city, age, url, user_id)
        VALUES ($1, $2, $3, $4) returning id`,
        [cleanInput.city, cleanInput.age, cleanInput.url, cookie.userid]
    );
};

// module.exports.insertProfile = (city, age, url) => {
//     //1. Hash the user's password [PROMISE]
//     //2. Insert into the database with a query
//     //3. Return the entire row --> not necessary???
//     // so that we can store the user's id in the session!
//     return hashPassword(password)
//         .then((hash) => {
//             // console.log("hash: ", hash);
//             return db.query(
//                 `INSERT INTO ${tableUser}(first, last, email, password)
//         VALUES ($1, $2, $3, $4) returning id`,
//                 [first, last, email, hash]
//             );
//         })
//         .catch((err) => console.log("err in hashPassword: ", err));
// };

function capitalizeParameter(par) {
    let eachWord = par.toLowerCase().split(" ");
    for (let i = 0; i < eachWord.length; i++) {
        eachWord[i] =
            eachWord[i].charAt(0).toUpperCase() + eachWord[i].substring(1);
    }
    let fullPar = eachWord.join(" ");
    console.log("fullPar: ", fullPar);
    return fullPar;
}

function cleanProfileData(input) {
    if (input.url === "") {
        input.url = null;
    } else if (
        !input.url.includes("http://", 0) &&
        !input.url.includes("https://", 0)
    ) {
        input.url = "http://" + input.url;
    }

    console.log("input.age: ", input.age);
    if (input.age === "") {
        console.log("input.age drinnen: ", input.age);
        input.age = null;
    }
    // if (typeof input.age != "number") {
    //     console.log("typeof input.age: ", typeof input.age);
    //     console.log("input.age before: ", input.age);
    //     input.age = null;
    //     console.log("input.age after: ", input.age);
    // }
    input.city = capitalizeParameter(input.city);
    console.log("input after: ", input);
    return input;
}

module.exports.getProfileData = (userid, signatureid) => {
    if (!signatureid) {
        return db.query(
            `select first, last, email, age, city, url from ${tableUser}
            left outer join ${tableProfiles}
            on ${tableUser}.id = ${tableProfiles}.user_id
            where ${tableUser}.id = '${userid}';`
        );
    } else {
        return db.query(
            `select first, last, email, age, city, url from ${tableUser}
            join ${tableSignature}
            on ${tableUser}.id = ${tableSignature}.user_id
            left outer join ${tableProfiles}
            on ${tableUser}.id = ${tableProfiles}.user_id
            where ${tableUser}.id = '${userid}';`
        );
    }
};

module.exports.updateUserWithoutPassword = (profileData) => {
    console.log("profileData: ", profileData);
    profileData.first = capitalizeParameter(profileData.first);
    profileData.last = capitalizeParameter(profileData.last);
    return db.query(
        `update users set first=$2, last=$3, email=$4
        WHERE id=$1`,
        [profileData.id, profileData.first, profileData.last, profileData.email]
    );
};

module.exports.updateUserWithPassword = (profileData) => {
    console.log("profileData: ", profileData);
    profileData.first = capitalizeParameter(profileData.first);
    profileData.last = capitalizeParameter(profileData.last);
    return hashPassword(profileData.password)
        .then((hash) => {
            profileData.password = hash;
            return db.query(
                `update users set first=$2, last=$3, email=$4, password=$5
                WHERE id=$1`,
                [
                    profileData.id,
                    profileData.first,
                    profileData.last,
                    profileData.email,
                    profileData.password,
                ]
            );
        })
        .catch((err) => console.log("err in hashPassword: ", err));
};

module.exports.upsertProfile = (profileData) => {
    cleanProfileData(profileData);
    console.log("profileData: ", profileData);
    return db.query(
        `INSERT INTO profiles (user_id, city, age, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET city=$2, age=$3, url=$4
    WHERE profiles.user_id=$1`,
        [profileData.id, profileData.city, profileData.age, profileData.url]
    );
};

module.exports.deleteSignature = (userid) => {
    console.log("userid: ", userid);
    return db.query(`DELETE FROM signatures WHERE user_id= $1`, [userid]);
};

module.exports.deleteProfile = (userid) => {
    console.log("userid: ", userid);
    return db.query(`DELETE FROM profiles WHERE user_id= $1`, [userid]);
};

module.exports.deleteUser = (userid) => {
    console.log("userid: ", userid);
    return db.query(`DELETE FROM users WHERE id= $1`, [userid]);
};

module.exports.deleteAccount = (userid) => {
    console.log("userid: ", userid);

    return this.deleteSignature(userid)
        .then(() => {
            return this.deleteProfile(userid)
                .then(() => {
                    return this.deleteUser(userid)
                        .then(() => {})
                        .catch((err) =>
                            console.log("err in deleteUser: ", err)
                        );
                })
                .catch((err) => console.log("err in deleteProfile: ", err));
        })
        .catch((err) => console.log("err in deleteSignature: ", err));

    // return db.query(
    //     `
    // DELETE FROM signatures WHERE user_id= $1;
    // DELETE FROM profiles WHERE user_id= $1;
    // DELETE FROM users WHERE id= $1
    // `,
    //     `,
    //     [userid]
    // );
};

// `INSERT INTO ${tableUser}(first, last, email, password)
//         VALUES ($1, $2, $3, $4) returning id`,
//     [first, last, email, hash];

// für andere funktion nützlich:
// return db.query(
//     `INSERT INTO users (first, last, email)
//     VALUES ($2, $3, $4)
//     ON CONFLICT (email)
//     DO UPDATE SET first=$2, last=$3
//     WHERE users.id=$1`,
//     [profileData.id, profileData.first, profileData.last, profileData.email]
// );
