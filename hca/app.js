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
    database: 'hca'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//home
app.get('/', (req, res) => {
    res.render('patient-app-home');
});

//Patient request
app.post('/patient', (req, res) => {
    var hca = [
        {
            doctor: 'Rama',
            expertise : 'heart failure heart attack high blood pressure irregular heartbeat',
            specialty: 'Cardiologists',
            count: 0
        },
        {
            doctor: 'Sita',
            expertise : 'hormones and metabolism diabetes thyroid problems infertility calcium bone disorders',
            specialty: 'Endocrinologists',
            count: 0
        }
    ];

    let data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        problem: req.body.problem
    };

    if(data.name && data.email && data.phone && data.problem) {
        var prb = data.problem.split(' ');
        var count = 0;
        hca.forEach((a) => {
            let exp = a.expertise.split(' ');
            exp.forEach((e) => {
                prb.forEach((e2) => {
                    if(e == e2) {
                        count++;
                        a.count = count;
                    }
                });
            });
        });

        var max = hca.reduce( (prev, curr) => {
            return (prev.count > curr.count) ? prev : curr
        });

        console.log(max.doctor);

        let sql = `SELECT * FROM doctor WHERE d_name = '${max.doctor}'`;
        let query = db.query(sql, (err, result) => {
            res.render('display_doctor', {display: result});
            console.log(result);
        });
    }
    else {
        res.render('display_doctor', {display: 'Please enter all the details!!'});
    }
});

app.listen(3000, ()=> {
    console.log('Server running on port 3000...');
});