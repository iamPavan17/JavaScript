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

    let deleteQuery1 = db.query('DELETE FROM first_day WHERE date < CURDATE()', (err, result) => {
        console.log('First_day Refreshed!!!');
    });
    let deleteQuery2 = db.query('DELETE FROM second_day WHERE date < CURDATE()', (err, result) => {
        console.log('Second_day Refreshed!!!');
    });
    let deleteQuery3 = db.query('DELETE FROM third_day WHERE date < CURDATE()', (err, result) => {
        console.log('Third_day Refreshed!!!');
    });

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
            var ab = result;
            ab[0]['s1'] = result[0].d_specialist.split(' ')[0];
            ab[0]['s2'] = result[0].d_specialist.split(' ')[1];
            ab[0]['s3'] = result[0].d_specialist.split(' ')[2];
            // console.log(ab);
            res.render('display_doctor', {display: ab});
            console.log(result);

            var appData = {
                d_id: result[0].d_id,
                p_name: data.name,
                p_email: data.email,
                p_phone: data.phone
            };

            console.log(appData);
                let query1 = db.query('SELECT HOUR(CURTIME())', (err, result) => {
                    var time1 = '11';
                    var time2 = '13';
                    var time3 = '15';
                    var idResult = result[0];
                    var idCount = [];
                    for(var i in idResult) {
                        idCount.push(idResult[i]);
                    }
                    var time = [];
                    // console.log(idCount); //returns the current time
                    if(idCount < Number(time1)) {
                        time.push({count: 1,t: 11});
                    } else if(idCount < Number(time2)) {
                        time.push({count: 2, t: 13});
                    } else if(idCount < Number(time3)) {
                        time.push({count: 3, t: 15});
                    } else {
                        time.push({count: 4, t: 17});
                    }

                    var db_name = [];
                    db_name[0] = 'first_day';

                    // console.log(time[0]);
                    if(db_name[0] == 'first_day'){
                        if(time[0].count <= 3) {
                            let query2 = db.query(`INSERT INTO ${db_name[0]} (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${time[0].t}, CURDATE())`, (err, result) => {
                                if(err) throw err;
                                console.log('INSERTED TO first_day');
                            });
                        }
                        else {
                            db_name[0] = 'second_day';
                        }
                    }
                    // console.log(db_name[0]);
                    if(db_name[0] == 'second_day') {
                        if(time[0].count <= 3) {
                            let query3 = db.query(`INSERT INTO ${db_name[0]} (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${time[0].t}, CURDATE() + INTERVAL 1 day)`, (err, result) => {
                                if(err) throw err;
                                console.log('INSERTED TO second_day');
                            });
                        }
                        else {
                            db_name[0] = 'third_day';
                        }                        
                    }

                    if(db_name[0] == 'third_day') {
                        if(time[0].count <= 3) {
                            let query3 = db.query(`INSERT INTO ${db_name[0]} (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${time[0].t}, CURDATE() + INTERVAL 2 day)`, (err, result) => {
                                if(err) throw err;
                                console.log('INSERTED TO third_day');
                            });
                        } 
                        else {
                            db_name[0] = 'Appointment Full!!!';
                        }                        
                    }
                    console.log(db_name);
                });
        });

        
    }
    else {
        res.render('display_error', {display: 'Please enter all the details!!'});
    }
});

app.listen(3000, ()=> {
    console.log('Server running on port 3000...');
});