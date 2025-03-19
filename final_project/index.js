const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

let users = []
//Check if user with the given username already exists
const doesExist = (username) => {
    //Filter the users array for any user with the same name
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    //Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

//Check if user with the given username and password exists
const authenticatedUser = (username, password) => {
    //Filter the users array 4 any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    //Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    //Check if user is logged in and has a valid access token
    if (req.session.autharization) {
        let token = req.session.autharization['accessToken'];

        //Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); //Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated"});
            }
        });
    } else {
        return res.status(403).json({ message: "User is a bitch!"});
    }
});

//Login endpoint
app.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    //Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in"});
    }
    //Authenticate user
    if (authenticatedUser(username, password)) {
        //Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        //Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid login. Make sure you aint an Assanal Fan!"});
    }
});

//Register new user
app.post("/register", (req,res) => {
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


const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
