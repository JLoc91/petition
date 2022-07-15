const spicedPg = require("spiced-pg");
const user = "jloco";
const password = "postgres";
const database = "julien";
const table = "actors";
// const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

module.exports.getActors = () => {
    return db.query(`select * from ${table}`);
};

module.exports.addActor = (Name, Age, number_of_actors) => {
    return db.query(
        `INSERT INTO ${table}(Name, Age, number_of_actors)
        VALUES ($1, $2, $3)`,
        [Name, Age, number_of_actors]
    );
};
