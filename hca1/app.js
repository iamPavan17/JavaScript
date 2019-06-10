const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');

const DIR = './uploads';
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
 
let upload = multer({storage: storage});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hca'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//sending reminder message
function remainderMessage(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");
    
    req.query({
      "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
      "sender_id": "FSTSMS",
      "message": `Dear ${messageBody.p_name}, You appointment is at ${messageBody.time}, ${messageBody.date}`,
      "language": "english",
      "route": "p",
      "numbers": messageBody.p_phone,
    });
    
    req.headers({
      "cache-control": "no-cache"
    });
    
  
    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      console.log(res.body);
    });
}

//Remainder message
(function () {
    let getTimeQuery = db.query('SELECT HOUR(CURTIME())', (err, result) => {
        var currentTimeResult = result[0];
        var hours = [];
        for(var i in currentTimeResult) {
            hours.push(currentTimeResult[i]);
        }
        // console.log(hours[0]);  //returns current time
        if(hours[0] == 1) {
            let firstTableQuery = db.query('SELECT * FROM first_day', (err, result) => {
                result.forEach((d) => {
                    remainderMessage(d);
                })   
            });
            let secondTableQuery = db.query('SELECT * FROM second_day', (err, result) => {
                result.forEach((d) => {
                    remainderMessage(d);
                })   
            });
            let thirdTableQuery = db.query('SELECT * FROM third_day', (err, result) => {
                result.forEach((d) => {
                    remainderMessage(d);
                })   
            });
        }
    });
})();

//messaging to patient
function message(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Dear ${messageBody.name}, Your Appointment has been booked with DR.${messageBody.doctor}, at ${messageBody.time}, ${messageBody.day}.`,
    "language": "english",
    "route": "p",
    "numbers": messageBody.phone,
    });

    req.headers({
    "cache-control": "no-cache"
    });


    req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
    });
}

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
    res.render('home');
});

//patient registration
app.get('/patientreg', (req, res) => {
    res.render('patient_reg');
});

app.post('/patientreg', (req, res) => {
    let data = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password1
    };
    let passwords = {
        password1: req.body.password1,
        password2: req.body.password2
    };

    if(passwords.password1 !== passwords.password2) {
        res.render('patient_reg', {password: 'Passwords are not matching!!'});
    }
    else {
        let phoneValidation = /^\d{10}$/;
        if(data.phone.match(phoneValidation)) {
            let checkingUniqueUsernameQuery =  db.query(`SELECT COUNT(*) FROM patient WHERE username = '${data.username}'`, (err, result) => {
                if(err) throw err;
                let countResult = result[0];
                let count;
                for(var i in countResult) {
                    count = countResult[i];
                }
                // console.log(count);
                if(count > 0) {
                    let usernameGenQuery = db.query('SELECT uuid()', (err, result) => {
                        if(err) throw err;
                        let code = String(result[0]['uuid()'].slice(2,7));
                        let numb = code.match(/\d/g);
                        numb = numb.join("");
                        // console.log(`${data.username}${numb.slice(-5, -1)}`);
                        var avaUsernames = `${data.username}${numb.slice(-5, -1)}`;
                        // console.log(avaUsernames); 
                        res.render('patient_reg', {username: `OOPS!!!, Username is already taken, You can try`, suguser: `${data.username}${code}`});       
                    });
                }
                else {
                    let sql = 'INSERT INTO patient SET ?';
                    let query = db.query(sql, data, (err, result) => {
                        if(err) throw err;
                        res.redirect('/');
                    });
                }
            });
        }
        else {
            res.render('patient_reg', {phonenum: 'Please enter a valid phone number!!'});
        }
    }
});

//patient login
app.get('/patientlogin', (req, res) => {
    res.render('patient_login');
});

app.post('/patientlogin', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password1
    };
    let sql = `SELECT COUNT(*) FROM patient WHERE username = '${data.username}' AND password = '${data.password}'`;
    let query = db.query(sql, (err, result) => {
        let countResult = result[0];
        let count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        // console.log(count)
        if(count > 0) {
            req.session.loggedin = true;
            req.session.username = data.username;
            let timeQuery = db.query('SELECT CURRENT_TIME()', (err, result) => {
                if(err) throw err;
                // console.log(result[0]['CURRENT_TIME()']);
                let curTime = result[0]['CURRENT_TIME()'].slice(0,2);
                // console.log(dbTime);
                let time = [];
                if(curTime > 0 && curTime < 12) {
                    time.push('morning');
                }
                else if(curTime >= 12 && curTime < 16) {
                    time.push('afternoon');
                }
                else {
                    time.push('evening');
                }
                let display = {};
                display['username'] = req.session.username;
                display['time'] = time[0];
                res.render('patient-home', {display: display});
            });
        }
        else {
            res.render('patient_login', {error: 'Username/Password is Incoorect!!'});
        }
    })
});

app.get('/patient_home', (req, res) => {
    let timeQuery = db.query('SELECT CURRENT_TIME()', (err, result) => {
        if(err) throw err;
        // console.log(result[0]['CURRENT_TIME()']);
        let curTime = result[0]['CURRENT_TIME()'].slice(0,2);
        // console.log(dbTime);
        let time = [];
        if(curTime > 0 && curTime < 12) {
            time.push('morning');
        }
        else if(curTime >= 12 && curTime < 16) {
            time.push('afternoon');
        }
        else {
            time.push('evening');
        }
        let display = {};
        display['username'] = req.session.username;
        display['time'] = time[0];
        res.render('patient-home', {display: display});
    });
})

app.get('/patient_appointment', (req, res) => {
    res.render('patient_appointment');
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
            // res.render('display_doctor', {display: ab});
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
                        let t = 11;
                        let firstInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }

                   else if(hours[0] < 11 && cnt1[0] == 1) {
                       let t = 13;
                        let secondInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }

                   else if(hours[0] < 11 && cnt1[0] == 2) {
                       let t = 15;
                        let thirdInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }

                   else if(hours[0] < 13 && cnt1[0] == 0) {
                       let t = 13;
                        let fourthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }

                   else if(hours[0] < 13 && cnt1[0] == 1) {
                       let t = 15;
                        let fifthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }

                   else if(hours[0] < 15 && cnt1[0] == 0) {
                       let t = 15;
                        let sixthInsert = db.query(`INSERT INTO first_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE())`, (err, result) => {
                            if(err) throw err;
                        });
                        messageBody = {
                            phone: appData.p_phone,
                            name: appData.p_name,
                            doctor: max.doctor,
                            time: `${t}:00`,
                            day: 'Today'
                        };
                        message(messageBody);
                        ab[0]['t'] = `${t} - Today`;
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
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
                            if(cnt2[0] == 0) {
                                let t = 11;
                                let firstInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
                            }
    
                           else if(cnt2[0] == 1) {
                               let t = 13;
                                let secondInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
                            }
    
                            else if(cnt2[0] == 2) {
                                let t = 15;
                                let thirdInsert2 = db.query(`INSERT INTO second_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 1 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
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
                            if(cnt3[0] == 0) {
                                let t = 11;
                                let firstInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Day-after Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Day-after Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
                            }
    
                           else if(cnt3[0] == 1) {
                               let t = 13;
                                let secondInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Day-after Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Day-after Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
                            }
    
                           else if(cnt3[0] == 2) {
                               let t = 15;
                                let thirdInsert3 = db.query(`INSERT INTO third_day (d_id, p_name, p_email, p_phone, time, date) VALUES (${appData.d_id}, '${appData.p_name}', '${appData.p_email}', ${appData.p_phone}, ${t}, CURDATE() + INTERVAL 2 DAY)`, (err, result) => {
                                    if(err) throw err;
                                });
                                messageBody = {
                                    phone: appData.p_phone,
                                    name: appData.p_name,
                                    doctor: max.doctor,
                                    time: `${t}:00`,
                                    day: 'Day-after Tomorrow'
                                };
                                message(messageBody);
                                ab[0]['t'] = `${t} - Day-after Tomorrow`;
                                ab[0]['phone'] = appData.p_phone;
                                res.render('display_doctor', {display: ab});
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
                        ab[0]['t'] = db_name[0];
                        ab[0]['phone'] = appData.p_phone;
                        res.render('display_doctor', {display: ab});
                    }
                    console.log(db_name);
                    
                    // res.render('display_doctor', {display: ab});
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

app.get('/forgotPassword', (req, res) => {
    res.render('forgot_password');
})
//
app.get('/logout', (req, res) => {
    res.redirect('/');
    req.session.destroy();
});

//forgot password

//OTP
function messageOTP(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Your code is ${messageBody.Code}.`,
    "language": "english",
    "route": "p",
    "numbers": messageBody.phone,
    });

    req.headers({
    "cache-control": "no-cache"
    });


    req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
    });
}

app.post('/forgot1', (req, res) => {
    let data = {
        phone: req.body.phone
    };
    let sql = `SELECT * FROM patient WHERE phone = ${data.phone}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        let dbResult = result[0];
        let dbData = {};
        for(var i in dbResult) {
            dbData[i] = dbResult[i];
        }
        if(result.length) {
            // console.log('found')
            // console.log(dbData);
            // messageOTP(dbData);
            let query1 = db.query('SELECT uuid()', (err, result) => {
                if(err) throw err;
                dbData['Code'] = result[0]['uuid()'].slice(0,4);
                req.session.phoneNumber = data.phone;
                req.session.code = dbData['Code'];
                messageOTP(dbData);
                res.render('forgot_password1', {phone: req.session.phoneNumber});    
            });
        }
        else{
            res.render('forgot_password', {error: 'Phone number not found!!!'})
        }
    });
});

app.post('/forgot2', (req, res) => {
    let data = {
        code: req.body.code,
        password1: req.body.password1,
        password2: req.body.password2
    }
    if(data.password1 !== data.password2) {
        res.render('forgot_password1', {error: 'Passwords are not matching!'});
    } 
    else if(data.code !== req.session.code) {
        res.render('forgot_password1', {codeerror: 'Code is not correct!'})
    } 
    else {
        let query = db.query(`UPDATE patient SET password = '${data.password1}' WHERE phone = ${req.session.phoneNumber}`, (err, result) => {
            if(err) throw err;
            res.send(
                `
                    <html>
                        Password has been updated successfully.
                        <a href='/patientlogin'>Click here to login</a>
                    </html
                `
            )
        })
    }
});


app.get('/insurance_claim', (req, res) => {
    let query2 = db.query(`SELECT * FROM patient_insurance WHERE username = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        // console.log(result)
        // console.log(filterdDate.slice(0,15))
        if(result.length){
            let filterdDate = String(result[0].uploaded_date);
        result[0].uploaded_date = filterdDate.slice(0,15);}
        // console.log(result['filteredDate'])
        res.render('insurance_claim', {result: result});
    });
});

app.post('/viewPdf', (req, res) => {
    let data = {
        pdfFile: req.body.pdfFile
    };
    res.sendFile(__dirname + `/uploads/${data.pdfFile}`)
});

app.post('/upload',upload.single('insfile'), (req, res) => {
    if(!req.file) {
        console.log('No file received!!');
        message = 'Error!!! in file upload.';
        res.render('insurance_claim', {message: message});
    }
    else if(req.file.mimetype !== 'application/pdf'){
        res.render('insurance_claim', {message: 'File is not in PDF format!!'});
    }
    else {
        console.log('File received');
        // console.log(req);
        let query3 = db.query(`DELETE FROM patient_insurance WHERE username = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
        });
        let sql = `INSERT INTO patient_insurance(username, name, type, size, uploaded_date) VALUES('${req.session.username}', '${req.file.filename}', '${req.file.mimetype}', ${req.file.size}, CURRENT_DATE)`;
        // console.log(sql);
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
        });
        let query2 = db.query(`SELECT * FROM patient_insurance WHERE username = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            message = "Successfully uploaded!!!";
            let filterdDate = String(result[0].uploaded_date);
            // console.log(filterdDate.slice(0,15))
            result[0].uploaded_date = filterdDate.slice(0,15);
            // console.log(result['filteredDate'])
            res.render('insurance_claim', {message: message, result: result});
        });
    }   
});



app.get('/forgot_password', (req, res) => {
    res.render('forgot_password');
})
app.get('/forgot_password1', (req, res) => {
    res.render('forgot_password1');
})

app.listen(3002, () => {
    console.log('Server running on port 3002...');
});