/** TEST FILE FOR BOOK ROUTES */
// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBookJSON;

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
		// first insert it through db.query
		const db_result = await db.query(
			`
            INSERT INTO books 
                (
                    isbn,
                    amazon_url,
                    author,
                    language,
                    pages,
                    publisher,
                    title,
                    year
                )
            VALUES 
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
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

		console.log("-----------------\ndb_result:", db_result.rows);
		// then request it through the routes
		const res = await request(app).get("/books/1");
		console.log("-----------------\nres.body:", res.body);
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
