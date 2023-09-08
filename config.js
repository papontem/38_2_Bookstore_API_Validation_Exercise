/** Common config for bookstore. */

// let DB_URI = `postgresql://`;

// if (process.env.NODE_ENV === "test") {
//   DB_URI = `${DB_URI}/books-test`;
// } else {
//   DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
// }

let db_name = process.env.NODE_ENV === "test" ? "books_test" : "books";
const DB_URI = `postgresql:///${db_name}`;

module.exports = { db_name, DB_URI };
