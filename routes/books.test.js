/** TEST FILE FOR BOOK ROUTES */
// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBookJSON;
async function insertTestBookIntoDB() {
	const db_result = await db.query(
		`
        INSERT INTO books 
            (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES 
            ( $1, $2, $3, $4, $5, $6, $7, $8 )
        RETURNING * `,
		[
			testBookJSON.isbn,
			testBookJSON.amazon_url,
			testBookJSON.author,
			testBookJSON.language,
			testBookJSON.pages,
			testBookJSON.publisher,
			testBookJSON.title,
			testBookJSON.year,
		]
	);

	return db_result;
}

beforeEach(async () => {
	console.log("---------\nBefore Each Test!");
	testBookJSON = {
		isbn: "1",
		amazon_url: "http://amazon.com/",
		author: "Author Test",
		language: "English",
		pages: 10,
		publisher: "Jest Test Press",
		title: "THE JSON BOOK TEST",
		year: 2023,
	};
});

afterEach(async () => {
	await db.query(`DELETE FROM books`);
});

// Close the connection to the test database after all tests
afterAll(async () => {
	await db.query(`DELETE FROM books`);
	await db.end();
});

describe("GET /books/", () => {
	test("If we get json with a books array (should be empty at this point)", async () => {
		// console.log("testBookJSON:",testBookJSON);
		const res = await request(app).get("/books");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			books: [],
		});
	});
});

// TEST GET BY ISBN
describe("GET /books/:ISBN", () => {
	test("If we get back our test book when we try to get it.", async () => {
		// first insert it through db.query function
		const db_result = await insertTestBookIntoDB();

		// console.log("-----------------\ndb_result:", db_result.rows);
		// then request it through the routes
		const res = await request(app).get("/books/1");
		// console.log("-----------------\nres.body:", res.body);

		// expectations
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			book: {
				isbn: "1",
				amazon_url: "http://amazon.com/",
				author: "Author Test",
				language: "English",
				pages: 10,
				publisher: "Jest Test Press",
				title: "THE JSON BOOK TEST",
				year: 2023,
			},
		});
	});
});

describe("POST /books/", () => {
	test("Post a book with valid json to the route /books/ and in effect insert a book into the db", async () => {
		// console.log("testBookJSON:",testBookJSON);
		const res = await request(app).post("/books/").send(testBookJSON);
		// console.log("-----------------\nres.body:", res.body);
		const db_result = await db.query(` SELECT * FROM books`);
		// console.log("-----------------\ndb_result:", db_result.rows);
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			book: {
				isbn: "1",
				amazon_url: "http://amazon.com/",
				author: "Author Test",
				language: "English",
				pages: 10,
				publisher: "Jest Test Press",
				title: "THE JSON BOOK TEST",
				year: 2023,
			},
		});
		expect(db_result.rows.length).toBe(1);
		expect(db_result.rows[0]).toEqual({
			isbn: "1",
			amazon_url: "http://amazon.com/",
			author: "Author Test",
			language: "English",
			pages: 10,
			publisher: "Jest Test Press",
			title: "THE JSON BOOK TEST",
			year: 2023,
		});
	});
});

describe("PUT /books/:ISBN", () => {
	test("Update by PUT that a books db entry is correctly set with a requests new data", async () => {
		// first insert it through db.query function
		const db_result = await insertTestBookIntoDB();

		// then update it through the route
		const res = await request(app).put("/books/1").send({
			isbn: "1",
			amazon_url: "http://amazon.com/new_link",
			author: "Author Test2",
			language: "English 101",
			pages: 101,
			publisher: "Jest Test Press Yes",
			title: "THE JSON BOOK TEST WITH JEST",
			year: 2023,
		});
		// console.log("-----------------\nres.body:", res.body);

		// expectations
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			book: {
				isbn: "1",
				amazon_url: "http://amazon.com/new_link",
				author: "Author Test2",
				language: "English 101",
				pages: 101,
				publisher: "Jest Test Press Yes",
				title: "THE JSON BOOK TEST WITH JEST",
				year: 2023,
			},
		});
	});
});

describe("DELETE /books/:ISBN", () => {
	test("Delete of a book of isbn = 1", async () => {
		// first insert it through db.query function
		const db_result = await insertTestBookIntoDB();

		// then delete it through the route
		const res = await request(app).delete("/books/1");

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ message: "Book deleted" });
	});

	test("Throws error when trying to Delete a book with invalid isbn of 0", async () => {
		// first insert it through db.query function
		const db_result = await insertTestBookIntoDB();

		// then delete it through the route
		const res = await request(app).delete("/books/0");

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			error: {
				message: "There is no book with an isbn 0",
				status: 404,
			},
			message: "There is no book with an isbn 0",
		});
	});
});
