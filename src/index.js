const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/teacher", (req, res) => {
    res.render("teacher");
});


app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password,
        role: 1
    }

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {

        const userdata = await collection.insertMany(data);
        res.render('login')
        // console.log(userdata);
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
        }
        const isPasswordMatch = await (req.body.password == check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else { 
             if (check.role == '1'){
                res.render('home')
             }
             else{
                res.render('teacher');
             }
        }
    }
    catch {
        res.send("wrong Details");
    }
});


app.post("/teacher", async (req, res) => {

    const data = {
        TeacherName: req.body.username,
        Title: req.body.password,
        students: 1
    }

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {

        const userdata = await collection.insertMany(data);
        res.render('login')
        // console.log(userdata);
    }

});

// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

