const process = require("process");
const db = require("./db");

const userEmail = `sally-smith+${new Date()}`;
const password = "12345";

function testCreateUser() {
    return db
        .insertUser("sally", "smith", userEmail, password)
        .then((result) => {
            if (result && result.rowCount === 1) {
                console.log("User created successfully!");
            }
        });
}

function testAuthenticateFailWrongPassword() {
    return db
        .authenticate(userEmail, "wrong-password")
        .then((result) => {
            console.log("❌ Somehow, wrong password authenticated!");
            console.log("result:", result);
        })
        .catch((result) => {
            console.log("✅ Wrong password failed as expected");
            // console.log('Error:', result);
        });
}

function testAuthenticateFailEmailNotFound() {
    return db
        .authenticate("wrong-email", password)
        .then((result) => {
            console.log("❌ Somehow, wrong password authenticated!");
            console.log("result:", result);
        })
        .catch((result) => {
            console.log("✅ Email not found - failed as expected");
            // console.log('Error:', result);
        });
}

function testAuthenticatePass() {
    return db
        .authenticate(userEmail, password)
        .then((result) => {
            console.log("✅ Authenticated with correct password!");
            // console.log('result:', result);
        })
        .catch((result) => {
            console.log("❌ Somehow, correct password failed");
            console.log("Error:", result);
        });
}

testCreateUser()
    .then(() => {
        return testAuthenticateFailWrongPassword();
    })
    .then(() => {
        return testAuthenticateFailEmailNotFound();
    })
    .then(() => {
        return testAuthenticatePass();
    })
    .then(() => process.exit(0));
