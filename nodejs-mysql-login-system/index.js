var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'reg-login'
});


var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname + '/')));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/registration', function(request, response) {
	response.sendFile(path.join(__dirname + '/reg.html'));
});

app.post('/reg', function(request, response) {
    let data = {
        username: request.body.username,
        password: request.body.password
    };
	// var username = request.body.username;
	// var password = request.body.password;
	if (data.username && data.password) {
		connection.query('insert into users set ?', [data], function(error, results) {
            console.log(results);
			if (results) {
                response.redirect('/');
                console.log('Sucessfully registered!!!');
			}		
			response.end();
		});
	} else {
		response.send('Please enter Username and Password for registration!!!');
		response.end();
	}
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
                console.log(results)
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);
