/** Server for bookstore. */
const app = require("./app");
const port = 3000;
app.listen(port, function () {
	console.log(`Server starting on port ${port}`);
});
