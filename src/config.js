const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Zachetka");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});



// const Courseschema = new mongoose.Schema({
//     TeacherName: {
//         type: String,
//         required: true
//     },
//     Title: {
//         type: String,
//         required: true
//     },
//     students: {
//         type: String,
//         required: true
//     }
// });

// collection part
const collection = new mongoose.model("users", Loginschema);
// const collectionCourse = new mongoose.model("course", Courseschema);
module.exports = collection;
// module.exports = collectionCourse;
