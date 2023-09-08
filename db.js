/** Database config for database. */

const { Client } = require("pg");
const { db_name, DB_URI } = require("./config");

const username = process.env.PG_USERNAME;
const password = process.env.PG_PASSWORD;
const port = process.env.PGPORT;

const db = new Client({
	host: "localhost",
	port: port,
	user: username,
	password: password,
	database: db_name,
});

// let db = new Client({
// 	connectionString: DB_URI,
// });

db.connect();

module.exports = db;
