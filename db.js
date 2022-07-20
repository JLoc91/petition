const spicedPg = require("spiced-pg");
const user = "jloco";
const password = "postgres";
const database = "petition";
const tableSignature = "signatures";
const tableUser = "users";
const bcrypt = require("bcryptjs");
// const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

module.exports.getSigners = () => {
    return db.query(
        `select first, last from ${tableUser}
        join ${tableSignature}
        on ${tableUser}.id = ${tableSignature}.user_id;
        `
    );
    //--join on profiles
    //--join on signatures
};

module.exports.getSignature = (user_id) => {
    // console.log("id.rows[0].id: ", id.rows[0].id);
    return db.query(`select signature from ${tableSignature}
                    where user_id = ${user_id}`);
};

module.exports.checkSignatureCookie = (user_id) => {
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
            // console.log("hash in function: ", hash);
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
            const passwordCheck = bcrypt.compare(
                password,
                result.rows[0].password
            );
            console.log("passwordCheck: ", passwordCheck);
            return passwordCheck, userid;
        })
        .catch((err) => console.log("error in findUser: ", err));
};

function findUser(email) {
    console.log("email in findUser: ", email);
    return db.query(`select * from ${tableUser}
    where "email" = '${email}'`);
}
