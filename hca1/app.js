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

    let deleteQuery1 = db.query('DELETE FROM first_day WHERE date < CURDATE()', (err, result) => {
        console.log('First_day Refreshed!!!');
    });
    let deleteQuery2 = db.query('DELETE FROM second_day WHERE date < CURDATE()', (err, result) => {
        console.log('Second_day Refreshed!!!');
    });
    let deleteQuery3 = db.query('DELETE FROM third_day WHERE date < CURDATE()', (err, result) => {
        console.log('Third_day Refreshed!!!');
    });

    res.render('patient-home');
});

//Patient request
app.post('/patient', (req, res) => {
    var db_name = ['first_day'];
    //doctor details
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

    //data coming from html
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

        let sql = `SELECT * FROM doctor WHERE d_name = '${max.doctor}'`;
        let query = db.query(sql, (err, result) => {
            var ab = result;
            ab[0]['s1'] = result[0].d_specialist.split(' ')[0];
            ab[0]['s2'] = result[0].d_specialist.split(' ')[1];
            ab[0]['s3'] = result[0].d_specialist.split(' ')[2];
            // console.log(ab);
            res.render('display_doctor', {display: ab});
            // console.log(result);
            var appData = {
                d_id: result[0].d_id,
                p_name: data.name,
                p_email: data.email,
                p_phone: data.phone
            };

            let gettingTimeQuery = db.query('SELECT HOUR(CURTIME())', (err, result) => {
                var timeResult = result[0];
                var hours = [];
                for(var i in timeResult) {
                    hours.push(timeResult[i]);  
                }
                // console.log(hours[0]); //returns current time in 24 hrs
                var time = [];
                if(hours[0] < 11) {
                    time.push(11);
                } else if(hours[0] < 13) {
                    time.push(13);
                } else if(hours[0] < 15) {
                    time.push(15);
                } 

                let gettingCountFirstTable = db.query('SELECT COUNT(*) FROM first_day', (err, result) => {
                    var cnt1 = [];
                    var cnt1rs = result[0];
                    for(var i in cnt1rs) {
                        cnt1.push(cnt1rs[i]);
                    }
                    
                    if(cnt1[0] == 0 && hours[0] < 11) {
                        let firstInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 11, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }

                   else if(hours[0] < 11 && cnt1[0] == 1) {
                        let secondInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }

                   else if(hours[0] < 11 && cnt1[0] == 2) {
                        let thirdInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }

                   else if(hours[0] < 13 && cnt1[0] == 0) {
                        let fourthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }

                   else if(hours[0] < 13 && cnt1[0] == 1) {
                        let fifthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }

                   else if(hours[0] < 15 && cnt1[0] == 0) {
                        let sixthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                    }
                });

                let dbChangeQuery = db.query('SELECT time FROM first_day ORDER BY id DESC LIMIT 1', (err, result) => {
                    var lastTime = [];
                    var lastTimeResult = result[0];
                    for(var i in lastTimeResult) {
                        lastTime.push(lastTimeResult[i]);
                    }
                    if(lastTime[0] == 15) {
                        db_name[0] = 'second_day';
                    }

                    let gettingCountSecondTable = db.query('SELECT COUNT(*) FROM second_day', (err, result) => {
                        var cnt2 = [];
                        var cnt2rs = result[0];
                        for(var i in cnt2rs) {
                            cnt2.push(cnt2rs[i]);
                        }

                        if(lastTime[0] == 15) {
                            if(hours[0] < 11 && cnt2[0] == 0) {
                                let firstInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 11, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 11 && cnt2[0] == 1) {
                                let secondInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                            else if(hours[0] < 11 && cnt2[0] == 2) {
                                let thirdInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 13 && cnt2[0] == 0) {
                                let fouthInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 13 && cnt2[0] == 1) {
                                let fiftInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
                            
                           else if(hours[0] < 15 && cnt2[0] == 0) {
                                let sixthInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
                        }
                    });
                });

                let dbChangeQuery2 = db.query('SELECT time FROM second_day ORDER BY id DESC LIMIT 1', (err, result) => {
                    var lastTime2 = [];
                    var lastTimeResult2 = result[0];
                    for(var i in lastTimeResult2) {
                        lastTime2.push(lastTimeResult2[i]);
                    }
                    if(lastTime2[0] == 15) {
                        db_name[0] = 'third_day';
                    }

                    let gettingCountThirdTable = db.query('SELECT COUNT(*) FROM third_day', (err, result) => {
                        var cnt3 = [];
                        var cnt3rs = result[0];
                        for(var i in cnt3rs) {
                            cnt3.push(cnt3rs[i]);
                        }

                        if(lastTime2[0] == 15) {
                            if(hours[0] < 11 && cnt3[0] == 0) {
                                let firstInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 11, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 11 && cnt3[0] == 1) {
                                let secondInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 11 && cnt3[0] == 2) {
                                let thirdInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 13 && cnt3[0] == 0) {
                                let fourthInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 13, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 13 && cnt3[0] == 1) {
                                let fifthInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
    
                           else if(hours[0] < 15 && cnt3[0] == 0) {
                                let sixthInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, 15, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                            }
                        }
                    });
                });

                let appointmentFull = db.query('SELECT time FROM third_day ORDER BY id DESC LIMIT 1', (err, result) => {
                    var lastTime3 = [];
                    var lastTimeResult3 = result[0];
                    for(var i in lastTimeResult3) {
                        lastTime3.push(lastTimeResult3[i]);
                    }

                    if(lastTime3[0] == 15) {
                        db_name[0] = 'Appointment is FULL!!';
                    }
                    console.log(db_name);
                });
                // let dateSetterQuery = db.query('SELECT time FROM appointment ORDER BY id DESC LIMIT 1', (err, result) => {
                //     var lastTime = [];
                //     var lastTimeResult = result[0];
                //     for(var i in lastTimeResult) {
                //         lastTime.push(lastTimeResult[i]);
                //     }
                //     // console.log(lastTime[0]);   //returns last time appointment

                //     var date = [];
                //     if(lastTime[0] == 15) {
                //         date.push('CURDATE() + INTERVAL 1 day');

                //     }

                // });
            });
        });
    }
    else {
        res.render('display_error', {display: 'Please enter all details!!'});
    }   
    
});

app.listen(3002, () => {
    console.log('Server running on port 3002...');
});