const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Zachetka");
const bodyParser = require('body-parser');
const express = require("express");
const path = require("path");
const collection = require("./config");
const app = express();

let studId

app.use(bodyParser.json());

const { Schema } = mongoose;
const textSchema = new Schema({
  text: String,
  students: []
});
const TextModel = mongoose.model('courses', textSchema);
 
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
//use EJS as the view engine
app.set("view engine", "ejs");


// Маршрут для получения данных
app.get('/home', async (req, res) => {
    try {
        let data = await TextModel.find().lean();
        let htmlOutput = '';
        data.forEach(item => {
            htmlOutput += 
            `<form action="/enroll/${item._id}" method="post">
                <input type="hidden" name="courseId" value="${item._id}">
                <h1>Название курса: ${item.text}</h1>
                <h2>ФИО преподавателя: Беднякова Татьяна Михайловна</h2> 
                <button type="submit">Записаться на курс</button>
            </form>`
            ;
        });
        res.send(htmlOutput);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/enroll/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const studentId = studId;
        const result = await TextModel.updateOne(
            { _id: courseId },
            { $push: { students: studentId } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Ошибка на сервере' });
    }
});

app.get('/teacher', async (req, res) => {
    try {
        let data = await TextModel.find().lean();
        let htmlOutput = '';
        data.forEach(item => {
            htmlOutput += 
                `<form action="/bigmak/${item._id}" method="post">
                    <h1>Название курса: ${item.text}</h1>
                    <h2>ФИО преподавателя: Беднякова</h2>
                    <button id="${item._id}">Список студентов</button>
                </form>
                `;
        });
        htmlOutput += `<form action="/addText" method="POST">
        <input type="text" name="text" placeholder="Введите текст">
        <button type="submit">Добавить текст</button>
        </form>`

        res.send(htmlOutput);
    } catch (err) {
        res.status(500).send(err.message);
    }
    
});

app.post('/bigmak/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const result = await TextModel.findOne({courseId})

        console.log(result.students)

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Ошибка на сервере' });
    }
});


app.get("/", (req, res) => {
    res.render("login");
});

app.get("/teacher", (req, res) => {
    res.render("teacher");
});

app.get("/create-course", (req, res) => {
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
                studId = check._id
                res.redirect('home')
             }
             else{
                res.redirect('teacher');
             }
        }
    }
    catch {
        res.send("wrong Details");
    }
});
  
app.post('/addText', async (req, res) => {
        const data = {
            text: req.body.text
        }
        const userdata = await TextModel.insertMany(data);
        res.redirect('teacher')
});

// Define Port for Application
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

