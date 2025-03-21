const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Task 6. Registering new users
//Function to check if a user already exists
const doesExist = (username) => {
    return users.some((user) => user.username === username);
};

//Register new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    //Check if both username and password are provided
    if (username && password) {
        //Check if the user doesnt already exist
        if (!doesExist(username)) {
            //Add the new user 2 the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({ message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({ message: "User already exists!"});
        }
    }
    //Return error if username or password is missing
    return res.status(404).json({message:"Unable to register user."});
});

//Task 1.  Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

//Task 2. Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  //books is an object not array so filter method wont work. Access books directly using isbn as a key
  if (books[isbn]) {
    res.json(books[isbn]); //Return book details if found 
  } else {
    res.status(404).json({ message: "Book not found"});
  }
 });
  
//Task 3. Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
//Iterate thru the books object
  for (let key in books) {
    if(books[key].author === author) {
        booksByAuthor.push(books[key]); //Add matching books to the array
    }
  }

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor); //Return matching books
  } else {
    res.status(404).json({message: "No books found by this author"});
  }
});

// Task 4. Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksTitle = [];

  for (let key in books) {
    if(books[key].title === title) {
        booksTitle.push(books[key]);
    }
  }

  if (booksTitle.length > 0) {
    res.json(booksTitle);
  } else {
    res.status(404).json({message: "No books found with this title. Go touch grass!"});
  }
});

//Task 5.  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Get ISBN from request params

  if (books[isbn]) {
    res.json(books[isbn].reviews); //Return book reviews if ISBN exists
  } else {
    res.status(404).json({message: "Book not found!"});
  }
});

//Task 10. Get all books using Async/Await & Axios
//Async function to fetch all books
public_users.get( '/', async function (req,res) {
    try {
        const response = await new Promise((resolve) => resolve(books));
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books."});
    }
});

//Task 11. Get book by ISBN using Async/Await & Axios
//Async function to fetch book by ISBN
public_users.get('/isbn/:isbn', async function (req,res) {
    try {
        const isbn = req.params.isbn;
        const response = await new Promise((resolve) => resolve(books[isbn]));
        if (response) {
            res.status(200).json(response);
        } else {
            res.status(404).json({message: "Book not found."});
        } 
    } catch (err) {
        res.status(500).json({ message: "Error fetching book"});
    }
});

//Task 12. Get book by author using Async/Await & Axios
//Async function to fetch books by author
public_users.get('/author/:author', async function (req,res) {
    try {
        const author = req.params.author.toLowerCase();
        const response = await new Promise((resolve) => {
            const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);
            resolve(filteredBooks);
        });

        if (response.length > 0) {
            res.status(200).json(response);
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching books by author" });
    }
});

//Task 13: Get book by Title
//Async function to fetch books by title
public_users.get('/title/:title', async function (req,res) {
    try {
        const title = req.params.title.toLowerCase();
        const response = await new Promise((resolve) => {
            const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() ===  title);
            resolve(filteredBooks);
        });

        if (response.length > 0) {
            res.status(200).json(response);
        } else {
            res.status(404).json({ message: "No books with this title." });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching books with this title"});
    }
});

module.exports.general = public_users;
