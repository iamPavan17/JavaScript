const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'event'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Home Page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></head>
        <body>
            <div class='text-center container pt-5'>
                <h3>This is HomePage </h3><br><br>
                <a href='/adminlogin'>Admin Login</a><br><br>
                <a href='/artist_registration'>Click here for Registration</a><br><br>
                <a href='/artistlogin'>Click here for Login</a>
            </div>
        </body>
        </html>
    `);
});

//redirects to admin login
app.get('/adminlogin', (req, res) => {
    res.render('admin_login');
});

app.get('/artistlogin', (req, res) => {
    res.render('artist_login');
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.get('/listartist', (req, res) => {
    let sql = 'SELECT * FROM invite_artist';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('admin_home_listartist', {display: result});
    });
});

app.get('/listaccartist', (req, res) => {
    let sql = 'SELECT * FROM new_artist';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('admin_home_listaccartist', {display: result});
    });
});

app.post('/updatecredits', (req, res) => {
    let data = {
        artistId: req.body.artistid,
        credits: req. body.credits
    };
    let sql = `UPDATE new_artist SET rewards = ${data.credits} WHERE id = ${data.artistId}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('admin_home_listaccartist', {msg: 'Credits has been updated!!!. Please click on the refresh icon to see the updated list of Artist.'});
    });
});

app.post('/removeartist', (req, res) => {
    let data = {
        artistId: req.body.artistid,
        artistName: req.body.artistname
    };
    let sql = `DELETE FROM new_artist WHERE id = ${data.artistId} AND username = '${data.artistName}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        if(result['affectedRows']) {
            res.render('admin_home_listaccartist', {msg1: `Artist with the ID: ${data.artistId} has been removed, Please click on the refresh icon to see the updated list of Artist. `})
        }
        else {
            res.render('admin_home_listaccartist', {msg1: `Artist ID and Artist name, you have selected is not matching!!`});
        }
    });
});

app.get('/inviteartist', (req, res) => {
    res.render('admin_home');
});

app.post('/artistlogin', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password
    };

    let sql = `SELECT COUNT(*) FROM new_artist WHERE username = '${data.username}' AND password = '${data.password}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        if(count[0]) {
            let sql2 = `UPDATE new_artist SET last_login = NOW() WHERE username = '${data.username}' AND password = '${data.password}' `;
            let query2 = db.query(sql2, (err, result) => {
                if(err) throw err;
                res.render('artist_home');
            });
        }
        else {
            res.send('Incorrect Username an/or Password!!');
        }
    })
})

app.post('/adminlogin', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password
    };

    let sql = `SELECT COUNT(*) FROM admin WHERE name = '${data.username}' AND password = '${data.password}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        if(count[0]) {
            res.render('admin_home');
        }
        else {
            res.send('Incorrect Username an/or Password!!');
        }
    });
});

function message(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Dear ${messageBody.a_name}, Your Code is ${messageBody.a_code}, Enter this while you are logging in for the first time.`,
    "language": "english",
    "route": "p",
    "numbers": messageBody.a_phone,
    });

    req.headers({
    "cache-control": "no-cache"
    });


    req.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log(res.body);
    });
}

app.post('/inviteartist', (req, res) => {
    let data = {
        a_name: req.body.name,
        a_email: req.body.email,
        a_phone: req.body.phone,
        a_code: req.body.code,
        status: 'pending'
    };
    let sql = 'INSERT INTO invite_artist SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        // message(data);
        // console.log(data);
        res.render('admin_home', {message: 'Invitation successfully sent!!!'});
    });
});


//artist registration
app.get('/artist_registration', (req, res) => {
    res.render('artist_registration');
});

app.post('/artistreg', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code,
        email: req.body.email
    };
    let sql = `SELECT COUNT(*) FROM invite_artist WHERE a_code = '${data.code}' AND a_email = '${data.email}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        if(count[0]) {
            let query1 = db.query(`UPDATE invite_artist SET status = 'accepted' WHERE a_code = '${data.code}' AND a_email = '${data.email}'`, (err, result) => {
                if(err) throw err;
                let sql2 = `INSERT INTO new_artist (username, email, rewards, about, last_login, password) VALUES ('${data.username}', '${data.email}', 100, 'Need to update!!', NOW(), '${data.password}')`;
                let query2 = db.query(sql2, (err, result) => {
                    if(err) throw err;
                    res.redirect('/');
                });
            });
        }
        else {
            res.send('Incorrect Code an/or Email!!');
        }
    })
});

app.listen(3000, () => {
    console.log('Server running on port 3000...');
})