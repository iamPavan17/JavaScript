const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'calender'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('HOME');
});

app.get('/create_event', (req, res) => {
    res.render('create_event');
});

app.post('/createEvent', (req, res) => {
    let data = {
        title: req.body.title,
        date: req.body.date,
        link: req.body.link
    };
    let sql = 'INSERT INTO event SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let sql2 = 'select title, link, day(date) day, month(date) month, year(date) year from event';
        let query2 = db.query(sql2, (err, result) => {
            if(err) throw err;
            // console.log(result);
            res.render('home', {eventData: encodeURIComponent(JSON.stringify(result))});
        });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000...');
});
