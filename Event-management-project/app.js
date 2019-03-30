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

//used for session variables
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
        <html>
        <head> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></head>
        <body>
            <div class='text-center container pt-5'>
                <h3>This is HomePage </h3><br><br>
                <a href='/registration'>Click here for Registration</a><br><br>
                <a href='/login'>Click here for Login</a>
            </div>
        </body>
        </html>
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
            artistData = {
                code: data.code,
                name: data.username,
                password: data.password,
                list_performance: '',
                training: '',
                about:''
            }
            let artistQuery = db.query('insert into artist set ?', artistData, (err, result) => {
                if(err) throw err;
            });
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
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/login.html'));
});

app.post('/log', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
    };
    if(data.username && data.password) {
        let sql = `SELECT COUNT(*) FROM artist WHERE name = '${data.username}' AND password = '${data.password}'`;
        let sql1 = `SELECT * FROM artist WHERE name = '${data.username}' AND password = '${data.password}'`;
        let query1 = db.query(sql1, (err, result) => {
            // console.log(result[0].about);
            req.session.about = result[0].about;
            req.session.list_performance = result[0].list_performance;
            req.session.training = result[0].training;
        });
        console.log(req.session.about);
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
        <html>
            <head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
            </head>
            <body>
                <div class="container pt-4">
                Welcome back, ${req.session.username}!  <a href='/logout'><i style='font-size:13px;'>Logout</a>
                <br><br>
                <div class="accordion" id="accordionExample">
                <div class="card">
                  <div class="card-header" id="headingOne">
                    <h2 class="mb-0">
                      <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        About
                      </button>
                      <a href='/artist_about'><i style='font-size:13px;'>Update</i></a>
                    </h2>
                  </div>
              
                  <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                    <div class="card-body">
                      ${req.session.about}
                    </div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header" id="headingTwo">
                    <h2 class="mb-0">
                      <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        List Performance
                      </button>
                      <a href='/performance_update'><i style='font-size:13px;'>Update</i></a>
                    </h2>
                  </div>
                  <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                    <div class="card-body">
                        ${req.session.list_performance}
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="headingThree">
                    <h2 class="mb-0">
                      <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Training
                      </button>
                      <a href='/training_update'><i style='font-size:13px;'>Update</i></a>
                    </h2>
                  </div>
                  <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                    <div class="card-body">
                        ${req.session.training}
                    </div>
                  </div>
                </div>  
              </div>
              </div>
            </body>
        </html>        
        `);
    }
    else {
        res.send('Please login to view this Page!!');
    }
    res.end();
});

//Artist About Modify
app.get('/artist_about', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/artist_about.html'));
});

app.post('/aboutupdate', (req, res) => {
    let data = {
        about: req.body.about
    };
    if(data.about) {
        let sql = `UPDATE artist SET about = '${data.about}' WHERE name = '${req.session.username}'`;
        req.session.about = data.about;
        console.log(sql);
        let query = db.query(sql, (err, rseult) => {
            if(err) throw err;
            res.redirect('/home');
        });
    }
    else {
        res.send('Please enter the details !!!');
        res.end();
    }
});

// Artist Performance Modify
app.get('/performance_update', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/artist_performance.html'));
});

app.post('/performanceupdate', (req, res) => {
    let data = {
        performance: req.body.performance
    }
    if(data.performance) {
        let sql = `UPDATE artist SET list_performance = '${data.performance}' WHERE name = '${req.session.username}'`;
        req.session.list_performance = data.performance;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            res.redirect('/home');
        });
    }
    else {
        res.send('Please enter the details');
        res.end();
    }
});

//Artist Training Modify
app.get('/training_update', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/artist_training.html'))
});

app.post('/trainingupdate', (req, res) => {
    let data = {
        training: req.body.training
    }
    if(data.training) {
        let sql = `UPDATE artist SET training = '${data.training}' WHERE name = '${req.session.username}'`;
        req.session.training = data.training;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            res.redirect('/home');
        });
    }
    else {
        res.send('Please enter the details');
        res.end();
    }
});

//Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.listen('3000', () => {
    console.log('Server started on port 3000...');
});