const spicedPg = require("spiced-pg");
const user = "jloco";
const password = "postgres";
const database = "petition";
const table = "signatures";
// const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

module.exports.getSigners = () => {
    return db.query(`select * from ${table}`);
};

module.exports.getNumSigners = () => {
    return db.query(`select count(signature) from ${table}`);
};

module.exports.addSigner = (first, last, signature) => {
    return db.query(
        `INSERT INTO ${table}(first, last, signature)
        VALUES ($1, $2, $3)`,
        [first, last, signature]
    );
};
