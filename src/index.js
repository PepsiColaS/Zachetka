const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Zachetka");
const bodyParser = require('body-parser');
const express = require("express");
const path = require("path");
const collection = require("./config");
const { constrainedMemory } = require('process');
const app = express();

let studId

app.use(bodyParser.json());

const { Schema } = mongoose;
const textSchema = new Schema({
    text: String,
    students: [],
    teacherName: String
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
        let htmlOutput = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .course {
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin-bottom: 10px;
                    background-color: #f9f9f9;
                }
                h1 {
                    color: #333;
                    font-size: 20px;
                    margin-bottom: 5px;
                }
                h2 {
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                button {
                    background-color: #4caf50;
                    color: #fff;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
                input[type="hidden"] {
                    display: none;
                }
            </style>
        </head>
        <body>
        `;
        data.forEach(item => {
            let isSub = false;
            item.students.forEach(item2 => {
                if (item2.toString() === studId.toString()) {
                    htmlOutput += `
                    <div class="course">
                        <form action="/unSub/${item._id}" method="post">
                            <input type="hidden" name="courseId" value="${item._id}">
                            <h1>Название курса: ${item.text}</h1>
                            <h2>Имя преподавателя:  ${item.teacherName}</h2> 
                            <button>Отписаться</button>
                        </form>
                    </div>`;
                    isSub = true;
                }
            });
            if (!isSub) {
                htmlOutput += `
                <div class="course">
                    <form action="/enroll/${item._id}" method="post">
                        <input type="hidden" name="courseId" value="${item._id}">
                        <h1>Название курса: ${item.text}</h1>
                        <h2>Имя преподавателя:  ${item.teacherName}</h2> 
                        <button type="submit">Записаться на курс</button>
                    </form>
                </div>
                `;
            }
        });
        htmlOutput += `</body></html>`;
        res.send(htmlOutput);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Запись на кус
app.post('/enroll/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const studentId = studId;

        const result = await TextModel.updateOne(
            { _id: courseId },
            { $push: { students: studentId } }
        );

        // res.json({ success: true });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Ошибка на сервере' });
    }
});

// Отписка от курса
app.post('/unSub/:id', async (req, res) => {
    const courseId = req.params.id;
    const studentId = studId;

    try {
        const user = await TextModel.updateOne(
          { _id: courseId },
          { $pull: { students: studentId } }
        );
        // res.json({ success: true });
        res.redirect('/home');
      } catch (error) {
        console.error(error);
      }
});

// Отрисовка формы учителя 
app.get('/teacher', async (req, res) => {
    try {
        let htmlOutput = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .course {
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin-bottom: 10px;
                    background-color: #f9f9f9;
                }
                h1 {
                    color: #333;
                    font-size: 20px;
                    margin-bottom: 5px;
                }
                h2 {
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                button {
                    background-color: #00bfff;
                    color: #fff;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
                input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    border-radius: 3px;
                    border: 1px solid #ccc;
                    box-sizing: border-box;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
        `;
        let courses = await TextModel.find().lean();

        // Шаг 2: Для каждого курса получаем имена студентов
        for (const course of courses) {
            const studentNames = await collection.find({ _id: { $in: course.students } }).lean();
    // Добавляем информацию о курсе и студентах в htmlOutput
    htmlOutput += `
        <div class="course">
            <form action="/bigmak/${course._id}" method="post">
                <h1>Курс: ${course.text}</h1>
                <h2>Преподаватель: ${course.teacherName}</h2>
                <p>Студенты:</p>
                <ul>
                    ${studentNames.map(userr => `<li>${userr.name}</li>`).join('')}
                </ul>
            </form>
        </div>
    `;
}
        htmlOutput += `
            <form action="/addText" method="POST">
                <input type="text" name="text" placeholder="Введите название курса">
                <button type="submit">Добавить курс</button>
            </form>
            </div>
            </body>
            </html>
        `;

        res.send(htmlOutput);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Добавление курса
app.post('/addText', async (req, res) => {
    const teacher = await collection.findOne({ _id: studId });
    console.log(teacher)

    const data = {
        text: req.body.text,
        teacherName: teacher.name
    }
    try {
        const result = await TextModel.create(data); // Используйте create для добавления нового документа
        res.redirect('teacher'); // Перенаправление после успешного сохранения
    } catch (error) {
        console.error(error); // Логируйте ошибки для диагностики
        res.status(500).send('Ошибка при добавлении текста');
    }
});


//Список студентов записанных на курс 
app.post('/bigmak/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const result = await TextModel.findOne({ _id: courseId });
        let liststudents = [];

        for (let item of result.students) {
            const student = await collection.findOne({ _id: item });
            liststudents.push(student.name);
        };

        // console.log(liststudents);
       
        res.json({ success: true, students: liststudents });
        // res.redirect('teacher');
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
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
            return
        }
        else{
            const isPasswordMatch = await (req.body.password == check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            studId = check._id
            if (check.role == '1') {
                studId = check._id
                res.redirect('home')
            }
            else {
                res.redirect('teacher');
            }
        }
        }
    }
    catch {
        res.send("wrong Details");
    }
});


// Define Port for Application
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

