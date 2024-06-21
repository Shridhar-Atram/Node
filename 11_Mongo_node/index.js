const express = require('express');
const users = require('./MOCK_DATA.json');
const fs = require("node:fs");
const mongo = require("mongoose");
const { type } = require('node:os');

const app = express();
const PORT = 8000;


mongo.connect("mongodb://127.0.0.1:27017/mydatabase").then(()=>{console.log("Mongo connected")}).catch((err)=>console.log(err))
const userSchema = new mongo.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: false
    },
    emailId: {
        type: String,
        required: true,
        unique : true
    },
    JobTitle:{
        type: String,
        // required: true
    },
    gender:{
        type: String
    }
},{timestamps: true})
const user = mongo.model("user",userSchema)
// Middleware
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    req.username = req.params.username || "friend";
    next();
});

app.use((req, res, next) => {
    console.log(`Hello ${req.username} from Middleware`);
    next();
});

app.use((req, res, next) => {
    fs.appendFile('./log.txt', `\n id=> ${Date.now()} :: method=> ${req.method} :: path=> ${req.path}`, (err) => {
        if (err) {
            throw err;
        }
        next();
    })
});

// Routes =>
app.get('/users', async(req, res) => {
    // res.setHeader('X-MyName', "Ranit Manik");
    const alldbuser = await user.find({})
    console.log(`${req.myUsername} in GET route`);
    const html = `<ul>${alldbuser.map((user) => `<li>${user.firstName}  ${user.emailId}</li>`).join("")}</ul>`
    // res.send(html);
    return res.json(alldbuser)
});

app.get('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    return res.json(user);
});


app.post('/api/users/', async(req, res) => {
    const body = req.body;
    if(!body || !body.first_name || !body.last_name || !body.email|| !body.gender || !body.job_title){return res.status(400).json({msg:"all fields are required"})}
   const result = await user.create({
    firstName: body.first_name,
    lastName : body.last_name,
    emailId: body.email,
    JobTitle: body.job_title,
    gender: body.gender
 
   });
   return res.status(201).json({msg:"success"})
});

app.patch('/api/users/patch', (req, res) => {
    const queryParams = req.query;
    const userId = parseInt(queryParams.id);
    if (!userId) {
        return res.status(400).json({error: 'User ID is required in the query parameters'});
    }
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({error: 'User not found'});
    }
    users[userIndex] = {...users[userIndex], ...queryParams};
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        return res.json({status: 'success', id: userId});
    });
});


app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id); // Parse ID from request params
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({error: 'User not found'});
    }
    users.splice(userIndex, 1);
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        return res.json({status: 'success', id: userId});
    });
});


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
