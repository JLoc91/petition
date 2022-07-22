const supertest = require("supertest");
const { app } = require("./server.js");
const cookieSession = require("cookie-session");

test("Users who are logged out are redirected to the registration page when they attempt to go to the petition page", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/register");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to the registration page", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
    });
    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/petition");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to the login page", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
    });
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/petition");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
        signatureid: 1,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/thanks");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to submit a signature", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
        signatureid: 1,
    });
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/thanks");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the thank you page ", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
    });
    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/petition");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
    cookieSession.mockSessionOnce({
        userid: 1,
    });
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain("/petition");
        });
});
