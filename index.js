const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

const bcrypt = require("bcrypt");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

// create user API post

app.post("/users/", async (request, response) => {
  const { name, username, password, gender, location } = request.body;
  const dbObject = `SELECT * FROM user WHERE username = '${username}'`;
  const dbuser = await db.get(dbObject);
  const hashedPassword = await bcrypt.hash(password, 10);
  if (dbuser === undefined) {
    const dbfinal = `INSERT INTO user(name,username,password,gender,location) VALUES ('${name}','${username}','${hashedPassword}','${gender}','${location}');`;
    await db.run(dbfinal);
    response.send("user successfully registered");
  } else {
    response.status(400);
    response.send("username already exists");
  }
});

// login API post

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const isuserdb = `SELECT * FROM user WHERE username = '${username}';`;
  const findUser = await db.get(isuserdb);
  if (findUser === undefined) {
    response.status(400);
    response.send("user not found");
  } else {
    const ispassword = await bcrypt.compare(password, findUser.password);
    if (ispassword === true) {
      response.send("login successfully");
    } else {
      response.status(400);
      response.send("password wrong");
    }
  }
});

// get
app.get("/users/", async (request, response) => {
  const dbObject = `SELECT * FROM user;`;
  const final = await db.all(dbObject);
  response.send(final);
});
