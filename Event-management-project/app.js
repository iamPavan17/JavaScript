const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

//for alert
const flash = require('express-flash-notification');

const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'event'
});

db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('MySql Connected....');
})

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname + 'views')));

//Home Page
app.get('/', function(req, res) {
    res.send(`
        <h3> This is HomePage </h3>
        <a href='/registration'>Click here for Registration</a><br><br>
        <a href='/login'>Click here for Login</a>
    `);
});

//Registration Page
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/registration.html'));
});

app.post('/reg', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code
    };
    if(data.username && data.password && data.code) {
        let sql = 'INSERT INTO registration SET ?';
        let query = db.query(sql, data, (err, result) => {
            if(err) throw err;
            if(result){
                console.log(result);
                res.redirect('/');
            } 
            res.end();
        });
    }
    else {
        res.send('Please enter username, password and code to register!!!');
        res.end();
    }
});

//Login Page
//Registration Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/login.html'));
});

app.post('/log', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
    };
    if(data.username && data.password) {
        let sql = `SELECT COUNT(*) FROM registration WHERE username = '${data.username}' AND password = '${data.password}'`;
        console.log(sql)
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            var countResult = result[0];
            var count = [];
            for(var i in countResult) {
                count.push(countResult[i]);
            }
            // console.log(count)
            if(count[0]){
                req.session.loggedin = true;
                req.session.username = data.username;
                res.redirect('/home');
            } 
            else {
                res.send('Incorrect Username an/or Password!!');
            }
            res.end();
        });
    }
    else {
        res.send('Please enter username, password and code to register!!!');
        res.end();
    }
});

//Users Home
app.get('/home', (req, res) => {
    if(req.session.loggedin) {
        res.send(`
            Welcome back, ${req.session.username}!
        `)
    }
    else {
        res.send('Please login to view this Page!!');
    }
    res.end();
})

app.listen('3000', () => {
    console.log('Server started on port 3000...');
});