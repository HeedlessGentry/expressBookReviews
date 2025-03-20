const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
    return users.some(user => user.username === username && user.password === password);
};

//Task 7. only registered users can login
regd_users.post("/login", (req,res) => {
    //Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in"});
    }
    //Authenticate user
    if (authenticatedUser(username, password)) {
        //Generate JWT access token
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });

        //Store access token and username in session
        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).json({message: "User successfully logged in", token: accessToken});
    } else {
        return res.status(401).json({ message: "Invalid login. Make sure you aint an Assanal Fan!"});
    }
});

//Task 8. Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username; //Get username from session

  //Check if the user is logged in
  if (!username) {
    return res.status(401).json({message: "User not authenticated. Please log in."});
  }

  //Check if the review is provided
  if (!review) {
    return res.status(400).json({ message:"Review test is required."});
  }

  //Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found."});
  }

  //Initialise reviews object if it doesnt exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  //Add or update review
  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
    const isbn = req.params/isbn;
    const username = req.session.authorization?.username; //Get username from session

    //Check if the user is logged in
    if (!username) {
        return res.status(401).json({ message: "User not authenticated. Please log in."});
    }
    //Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found."});
    }
    //Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(400).json({ message: "No review found for this book by user."});
    }

    //Delete the user's review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
