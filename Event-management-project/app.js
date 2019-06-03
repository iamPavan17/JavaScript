const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//database connection
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
app.use(fileUpload());

//Home Page
app.get('/', (req, res) => {
    // let sql = 'SELECT * FROM artist_schedule WHERE date < CURDATE()';
    res.send(`
        <html>
        <head> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></head>
        <body>
            <div class='text-center container pt-5'>
                <h3>This is HomePage </h3><br><br>
                <a href='/adminlogin'>Admin Login</a><br><br>
                <a href='/artist_registration'>Click here for Registration (Super User)</a><br><br>
                <a href='/artistlogin'>Click here for Login (Super User)</a><br><br>
                <a href='/norartist_registration'>Click here for Registration (Artist)</a><br><br>
                <a href='/norartistlogin'>Click here for Login (Artist)</a><br><br>
                <a href='/user_registration'>Click here for Registration (General User)</a><br><br>
                <a href='/userlogin'>Click here for Login (General User)</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/user_registration', (req, res) => {
    res.render('users_registration');
});

//redirects to admin login
app.get('/adminlogin', (req, res) => {
    res.render('admin_login');
});

app.get('/artistlogin', (req, res) => {
    res.render('artist_login');
});

app.get('/norartistlogin', (req, res) => {
    res.render('norartist_login');
})

app.get('/logout', (req, res) => {
    res.redirect('/');
    req.session.destroy();
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

app.get('/artist_home_list_artist', (req, res ) => {
    let sql = `SELECT * FROM invite_artist2 WHERE super_user = '${req.session.username}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('artist_home_list_artist', {display: result});
    });
});

app.get('/artist_home_training', (req, res) => {
    let query2 = db.query(`SELECT * FROM artist_training WHERE username = '${req.session.username   }'`, (err, result) => {
        if(err) throw err;
        res.render('artist_home_training', {display: result});
    })
});

app.get('/artist_home_appointment', (req, res) => {
    let query = db.query(`SELECT * FROM artist_appointment WHERE artist_name = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        // console.log(dateFilter.slice(0,16));
        for(var i in result) {
            let dateFilter = String(result[i].user_date);
            result[i]['user_date'] = dateFilter.slice(0,16);
        }   
        // console.log(result)
        // result[0]['user_date'] = dateFilter.slice(0,16);
        res.render('artist_home_appointment', {display: result});
    });
});

app.get('/norartist_home_appointment', (req, res) => {
    let query = db.query(`SELECT * FROM artist_appointment WHERE artist_name = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        // console.log(dateFilter.slice(0,16));
        for(var i in result) {
            let dateFilter = String(result[i].user_date);
            result[i]['user_date'] = dateFilter.slice(0,16);
        }   
        // console.log(result)
        // result[0]['user_date'] = dateFilter.slice(0,16);
        result['ArtistNama'] = req.session.username;
        res.render('norartist_home_appointment', {display: result});
    });
});

function appointmentMessageAccept(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Dear ${messageBody.user_name}, ${messageBody.artistname}, has accepted to your Appointment request.`,
    "language": "english",
    "route": "p",
    "numbers": messageBody.user_phone,
    });

    req.headers({
    "cache-control": "no-cache"
    });


    req.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log(res.body);
    });
}

function appointmentMessageReject(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Dear ${messageBody.user_name}, ${messageBody.artistname}, has rejected to your Appointment request.`,
    "language": "english",
    "route": "p",
    "numbers": messageBody.user_phone,
    });

    req.headers({
    "cache-control": "no-cache"
    });


    req.end(function (res) {
    if (res.error) throw new Error(res.error);
    console.log(res.body);
    });
}

app.post('/appointmentAccept', (req, res) => {
    let data = {
        id: req.body.id,
        status: req.body.status,
        message: 'none'
    };
    let sql = `SELECT * FROM artist_appointment WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let a = result[0];
        var appData = {};
        for(var i in a) {
            appData[i] = a[i];
        }
        // console.log(appData);
        let query2 = db.query(`DELETE FROM artist_appointment WHERE id = ${data.id}`, (err, result) => {
            if(err) throw err;
        });
        let query3 = db.query(`INSERT INTO appointment_history(user_name, user_phone, user_date, artist_name, status, reason) VALUES('${appData.user_name}', '${appData.user_phone}', '${appData.user_date}', '${appData.artistname}', '${data.status}', '${data.message}')`, (err, result) => {
            if(err) throw err;
            appointmentMessageAccept(appData);
            res.redirect('artist_home_appointment');
        });
    });
});

app.post('/appointmentReject', (req, res) => {
    let data = {
        id: req.body.id,
        status: req.body.status,
        message: req.body.message
    };
    let sql = `SELECT * FROM artist_appointment WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let a = result[0];
        var appData = {};
        for(var i in a) {
            appData[i] = a[i];
        }
        // console.log(appData);
        let query2 = db.query(`DELETE FROM artist_appointment WHERE id = ${data.id}`, (err, result) => {
            if(err) throw err;
        });
        let query3 = db.query(`INSERT INTO appointment_history(user_name, user_phone, user_date, artist_name, status, reason) VALUES('${appData.user_name}', '${appData.user_phone}', '${appData.user_date}', '${appData.artist_name}', '${data.status}', '${data.message}')`, (err, result) => {
            if(err) throw err;
            appointmentMessageReject(appData);
            res.redirect('artist_home_appointment');
        });
    });
});

app.get('/artist_home_appointment_history', (req, res) => {
    let sql = `SELECT * FROM appointment_history WHERE artist_name = '${req.session.username}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('artist_home_appointment_history', {display: result});
    })
})

app.post('/appointmentAccept1', (req, res) => {
    let data = {
        id: req.body.id,
        status: req.body.status,
        message: 'none'
    };
    let sql = `SELECT * FROM artist_appointment WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let a = result[0];
        var appData = {};
        for(var i in a) {
            appData[i] = a[i];
        }
        // console.log(appData);
        let query2 = db.query(`DELETE FROM artist_appointment WHERE id = ${data.id}`, (err, result) => {
            if(err) throw err;
        });
        let query3 = db.query(`INSERT INTO appointment_history(user_name, user_phone, user_date, artist_name, status, reason) VALUES('${appData.user_name}', '${appData.user_phone}', '${appData.user_date}', '${appData.artistname}', '${data.status}', '${data.message}')`, (err, result) => {
            if(err) throw err;
            appointmentMessageAccept(appData);
            res.redirect('norartist_home_appointment');
        });
    });
});

app.post('/appointmentReject1', (req, res) => {
    let data = {
        id: req.body.id,
        status: req.body.status,
        message: req.body.message
    };
    let sql = `SELECT * FROM artist_appointment WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let a = result[0];
        var appData = {};
        for(var i in a) {
            appData[i] = a[i];
        }
        // console.log(appData);
        let query2 = db.query(`DELETE FROM artist_appointment WHERE id = ${data.id}`, (err, result) => {
            if(err) throw err;
        });
        let query3 = db.query(`INSERT INTO appointment_history(user_name, user_phone, user_date, artist_name, status, reason) VALUES('${appData.user_name}', '${appData.user_phone}', '${appData.user_date}', '${appData.artist_name}', '${data.status}', '${data.message}')`, (err, result) => {
            if(err) throw err;
            appointmentMessageReject(appData);
            res.redirect('norartist_home_appointment');
        });
    });
});

app.get('/artist_home_appointment_history1', (req, res) => {
    let sql = `SELECT * FROM appointment_history WHERE artist_name = '${req.session.username}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('norartist_home_appointment_history', {display: result});
    })
})

app.get('/norartist_home_training', (req, res) => {
    let query2 = db.query(`SELECT * FROM artist_training WHERE username = '${req.session.username   }'`, (err, result) => {
        if(err) throw err;
        result['username'] = req.session.username;
        res.render('norartist_home_training', {display: result});
    })
});

app.post('/userreg', (req, res) => {
    let data = {
        name: req.body.username,
        password: req.body.password,
        email: req.body.email
    };
    let sql = 'INSERT INTO users SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        res.redirect('/');
    });
});


app.post('/artist_home_training', (req, res) => {
    let data = {
        timings: req.body.timings,
        address: req.body.address,
        batches: req.body.batches,
        contact: req.body.contact,
        username: req.session.username
    };
    let sql = 'INSERT INTO artist_training SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM artist_training WHERE username = '${data.username}'`, (err, result) => {
            if(err) throw err;
            res.render('artist_home_training', {display: result});
        })
    });
});

app.post('/norartist_home_training', (req, res) => {
    let data = {
        timings: req.body.timings,
        address: req.body.address,
        batches: req.body.batches,
        contact: req.body.contact,
        username: req.session.username
    };
    let sql = 'INSERT INTO artist_training SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM artist_training WHERE username = '${data.username}'`, (err, result) => {
            if(err) throw err;
            res.render('norartist_home_training', {display: result});
        })
    });
});

app.post('/updatecredits', (req, res) => {
    let data = {
        artistId: req.body.artistid,
        credits: req. body.credits
    };
    let sql = `UPDATE new_artist SET rewards = rewards + ${data.credits} WHERE id = ${data.artistId}`;
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

app.get('/artist_home_invite_user', (req, res) => {
    res.render('artist_home_invite_user');
})

app.get('/inviteartist', (req, res) => {
    res.render('admin_home');
});

app.get('/artist_update_about', (req, res) => {
    // console.log(req.session.username)
    res.render('artist_update_about');
});

app.get('/artist_home_performance', (req, res) => {
    let query = db.query(`SELECT * FROM artist_performance_list WHERE artist_name = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        result['username'] = req.session.username;
        let oldScheduleDataQuery = db.query(`SELECT * FROM artist_schedule WHERE date < CURDATE() AND artist_name = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            // console.log(result);
            var newData = {};
            let a = result[0];
            for(var i in a){
                newData[i] = a[i];
            }
            // console.log(newData);
            // if(Object.keys(newData).length) {
            //     console.log('hello');
            // }
            // console.log(newData.date.slice(0,11));
            if(Object.keys(newData).length) {
                let sql = `INSERT INTO artist_performance_list(event_name, place, date, image_loc, artist_name) VALUES('${newData.title}', '${newData.link}', '${newData.date}', 'null', '${newData.artist_name}')`;
                let addtoPerformanceQuery = db.query(sql, (err, result) => {
                    if(err) throw err;
                });
                let sql1 = `DELETE FROM artist_schedule WHERE id = ${newData.id}`;
                let deleteScheduleQuery = db.query(sql1, (err, result) => {
                    if(err) throw err;
                });
                }  
        });
        res.render('artist_home_performance', {display: result});
    })
});

app.get('/norartist_home_performance', (req, res) => {
    let query = db.query(`SELECT * FROM artist_performance_list WHERE artist_name = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        result['username'] = req.session.username;
        result['username'] = req.session.username;
        let oldScheduleDataQuery = db.query(`SELECT * FROM artist_schedule WHERE date < CURDATE() AND artist_name = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            // console.log(result);
            var newData = {};
            let a = result[0];
            for(var i in a){
                newData[i] = a[i];
            }
            // console.log(newData);
            // if(Object.keys(newData).length) {
            //     console.log('hello');
            // }
            // console.log(newData.date.slice(0,11));
            if(Object.keys(newData).length) {
                let sql = `INSERT INTO artist_performance_list(event_name, place, date, image_loc, artist_name) VALUES('${newData.title}', '${newData.link}', '${newData.date}', 'null', '${newData.artist_name}')`;
                let addtoPerformanceQuery = db.query(sql, (err, result) => {
                    if(err) throw err;
                });
                let sql1 = `DELETE FROM artist_schedule WHERE id = ${newData.id}`;
                let deleteScheduleQuery = db.query(sql1, (err, result) => {
                    if(err) throw err;
                });
                }  
        });
        res.render('norartist_home_performance', {display: result});
    })
});

app.get('/artist_home', (req, res) => {
    let query = db.query(`SELECT * FROM new_artist WHERE username = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        res.render('artist_home', {display: result});
    }) 
});

app.post('/artist_performance_insert', (req, res) => {
    let data = {
        event_name: req.body.event_name,
        place: req.body.place,
        date: req.body.date,
        image_loc: req.body.image,
        artist_name: req.session.username
    }
    // console.log(req.session.username)
    let sql = 'INSERT INTO artist_performance_list SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM artist_performance_list WHERE artist_name = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            result['username'] = req.session.username;
            res.render('artist_home_performance', {display: result});
        })
    })
});

app.post('/norartist_performance_insert', (req, res) => {
    let data = {
        event_name: req.body.event_name,
        place: req.body.place,
        date: req.body.date,
        image_loc: req.body.image,
        artist_name: req.session.username
    }
    // console.log(req.session.username)
    let sql = 'INSERT INTO artist_performance_list SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM artist_performance_list WHERE artist_name = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            result['username'] = req.session.username;
            res.render('norartist_home_performance', {display: result});
        })
    })
});

app.get('/artist_home_reset_password', (req, res) => {
    res.render('artist_home_reset_password');
});

app.get('/artist_forgot_password', (req, res) => {
    res.render('artist_forgot_password');
});

app.post('/artist_forgot_password', (req, res) => {
    let data = {
        email: req.body.email,
        current: req.body.pass1,
        new: req.body.pass2
    };

    if(data.current === data.new) {
        let sql = `UPDATE new_artist SET password = '${data.new}' WHERE email = '${data.email}'`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            res.redirect('/');
        });
    }
    else {
        res.render('artist_home_reset_password', {msg: 'Password mismatch!!!'})
    }
});

app.post('/artist_home_reset_password', (req, res) => {
    let data = {
        current: req.body.pass1,
        new: req.body.pass2
    };

    if(data.current === data.new) {
        let sql = `UPDATE new_artist SET password = '${data.new}' WHERE username = '${req.session.username}'`;
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            let query2 = db.query(`SELECT * FROM new_artist WHERE username = '${req.session.username}'`, (err, result) => {
                if(err) throw err;
                // result['user'] = req.session.username;
                res.render('artist_home', {display: result});
            });
        });
    }
    else {
        res.render('artist_home_reset_password', {msg: 'Password mismatch!!!'})
    }
});

app.get('/artist_home_schedule', (req, res) => {
    // let query = db.query()
    let query2 = db.query(`SELECT day(date) day, month(date) month, year(date) year, title, link, artist_name FROM artist_schedule WHERE artist_name = '${req.session.username}'`, (err, result) => {
        res.render('artist_home_schedule', {display: encodeURIComponent(JSON.stringify(result))});
    });
});

app.get('/norartist_home_schedule', (req, res) => {
    let query2 = db.query(`SELECT day(date) day, month(date) month, year(date) year, title, link, artist_name FROM artist_schedule WHERE artist_name = '${req.session.username}'`, (err, result) => {
        res.render('norartist_home_schedule', {display: encodeURIComponent(JSON.stringify(result))});
    });
});


app.post('/artist_home_schedule', (req, res) => {
    var data = {
        date: req.body.date,
        title: req.body.title,
        link: req.body.link,
        artist_name: req.session.username
    }
    let sql = 'INSERT INTO artist_schedule SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT day(date) day, month(date) month, year(date) year, title, link, artist_name FROM artist_schedule WHERE artist_name = '${req.session.username}'`, (err, result) => {
            res.render('artist_home_schedule', {display: encodeURIComponent(JSON.stringify(result))});
        })
    })
});

app.post('/norartist_home_schedule', (req, res) => {
    var data = {
        date: req.body.date,
        title: req.body.title,
        link: req.body.link,
        artist_name: req.session.username
    }
    let sql = 'INSERT INTO artist_schedule SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT day(date) day, month(date) month, year(date) year, title, link, artist_name FROM artist_schedule WHERE artist_name = '${req.session.username}'`, (err, result) => {
            res.render('norartist_home_schedule', {display: encodeURIComponent(JSON.stringify(result))});
        })
    })
});

app.post('/artist_about_update', (req, res) => {
    let data = {
        about: req.body.about
    };

    let sql = `UPDATE new_artist SET about = '${data.about}' WHERE username = '${req.session.username}'`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM new_artist WHERE username = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            // result['user'] = req.session.username;
            res.render('artist_home', {display: result});
        });
    });
}); 

app.post('/norartist_about_update', (req, res) => {
    let data = {
        about: req.body.about
    };

    let sql = `UPDATE new_artist2 SET about = '${data.about}' WHERE username = '${req.session.username}'`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        let query2 = db.query(`SELECT * FROM new_artist2 WHERE username = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            // result['user'] = req.session.username;
            res.render('norartist_home', {display: result});
        });
    });
});

app.get('/norartist_home', (req, res) => {
    let query2 = db.query(`SELECT * FROM new_artist2 WHERE username = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        // result['user'] = req.session.username;
        res.render('norartist_home', {display: result});
    });
})

app.post('/norartistlogin', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password
    };

    let sql = `SELECT COUNT(*) FROM new_artist2 WHERE username = '${data.username}' AND password = '${data.password}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        if(count[0]) {
            let sql2 = `UPDATE new_artist2 SET last_login = NOW() WHERE username = '${data.username}' AND password = '${data.password}' `;
            let query2 = db.query(sql2, (err, result) => {
                if(err) throw err;
                req.session.loggedin = true;
                req.session.username = data.username;

                let query3 = db.query(`SELECT * FROM new_artist2 WHERE username = '${data.username}' AND password = '${data.password}'`, (err, result) => {
                    if(err) throw err;
                    result['user'] = data.username;
                    res.render('norartist_home', {display: result});
                });
            });
        }
        else {
            res.send('Incorrect Username an/or Password!!');
        }
    })
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
                req.session.loggedin = true;
                req.session.username = data.username;

                let query3 = db.query(`SELECT * FROM new_artist WHERE username = '${data.username}' AND password = '${data.password}'`, (err, result) => {
                    if(err) throw err;
                    result['user'] = req.session.username;
                    res.render('artist_home', {display: result});
                });
            });
        }
        else {
            res.send('Incorrect Username an/or Password!!');
        }
    })
});

app.get('/userlogin', (req, res) => {
    res.render('users_login');
});

app.get('/users_home_artist', (req, res) => {
    let sql = 'SELECT * FROM new_artist';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        result['username'] = req.session.username;        
        res.render('users_home_artist', {display: result});
    });
});

app.get('/users_home_artist_info', (req, res) => {
    let sql = `SELECT * FROM new_artist WHERE id = ${req.session.artistId}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // // console.log(result)
        // req.session.artistName = result[0].username;
        // req.session.artistId = data.id;
        res.render('users_home_artist_info', {display: result});
    });
});

app.post('/users_home_artist_info', (req, res) => {
    let data = {
        id: req.body.id
    };
    let sql = `SELECT * FROM new_artist WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result)
        req.session.artistName = result[0].username;
        req.session.artistId = data.id;
        req.session.artistPhone = result[0].phone;
        res.render('users_home_artist_info', {display: result})
    });
});

app.get('/users_home_artist_info_training', (req, res) => {
    let sql = `SELECT * FROM artist_training WHERE username = '${req.session.artistName}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result)
        res.render('users_home_artist_info_training', {display: result})
    });
});

app.get('/users_home_artist_info_schedule', (req, res) => {
    let sql = `SELECT * FROM artist_schedule WHERE artist_name = '${req.session.artistName}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result)
        res.render('users_home_artist_info_schedule', {display: result})
    });
})

app.get('/users_home_artist_info_performance', (req, res) => {
    let sql = `SELECT * FROM artist_performance_list WHERE artist_name = '${req.session.artistName}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result)
        res.render('users_home_artist_info_performance', {display: result})
    });
})

app.post('/users_home_artist_info2', (req, res) => {
    let data = {
        id: req.body.id
    };
    let sql = `SELECT * FROM new_artist2 WHERE id = ${data.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result[0].username)
        req.session.artistName = result[0].username;
        req.session.artistId = data.id;
        req.session.artistPhone = result[0].phone;
        res.render('users_home_artist_info', {display: result})
    });
});

app.get('/users_home_artist2', (req, res) => {
    let sql = 'SELECT * FROM new_artist2';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        result['username'] = req.session.username;        
        res.render('users_home_artist2', {display: result});
    });
});

app.get('/users_home', (req, res) => {
    let query = db.query(`SELECT * FROM users WHERE name = '${req.session.username}'`, (err, result) => {
        if(err) throw err;
        // console.log(result);
        let query = db.query(`SELECT * FROM appointment_history WHERE user_name = '${req.session.username}'`, (err, result) => {
            if(err) throw err;
            result['username'] = req.session.username;
            res.render('users_home', {display: result});
        });     
    });
});

app.post('/userlogin', (req, res) => {
    let data = {
        name: req.body.username,
        password: req.body.password
    };
    let sql = `SELECT COUNT(*) FROM users WHERE name = '${data.name}' AND password = '${data.password}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        req.session.loggedin = true;
        req.session.username = data.name;
        // console.log(result);
        result['username'] = req.session.username;
        if(count[0]) {
            res.redirect('/users_home');
        }
        else {
            res.send('Incorrect Username and/or Password!!!');
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

function appointmentMessage(messageBody) {
    var unirest = require("unirest");

    var req = unirest("GET", "https://www.fast2sms.com/dev/bulk");

    req.query({
    "authorization": "j4qN5V68iwZp7ScGLEyoUFduJ3kCtTrQAhIMsx1l2afWnOKeYD5ciXK1swQSL2WvkYaCquRA8gd0ZIoH",
    "sender_id": "FSTSMS",
    "message": `Dear ${messageBody.artist_name}, ${messageBody.user_name} has sent an Appointment request!!!`,
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

app.post('/sendAppointment', (req, res) => {
    let data = {
        user_name: req.body.name,
        user_email: req.body.email,
        user_phone: req.body.phone,
        user_date: req.body.date,
        user_time: req.body.time, 
        user_format: req.body.format,
        user_message: req.body.message,
        artist_name: req.session.artistName
    };
    let sql = 'INSERT INTO artist_appointment SET ?';
    let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        data['phone'] = req.session.artistPhone;
        appointmentMessage(data);
        let sql1 = `SELECT * FROM artist_training WHERE username = '${req.session.artistName}'`;
        let query1 = db.query(sql1, (err, result) => {
        if(err) throw err;
        let msg = 'Message has been sent!!!';
        res.render('users_home_artist_info_training', {display: result, msg: msg})
    });
    }); 
});

app.post('/inviteartist', (req, res) => {
    let data = {
        a_name: req.body.name,
        a_email: req.body.email,
        a_phone: req.body.phone,
        a_code: req.body.code,
        status: 'pending'
    };

    let sql1 = 'SELECT uuid()';
    let query1 = db.query(sql1, (err, result) => {
        if(err) throw err;
        var codeResult = result[0];
        for(var i in codeResult) {
            let filteredCode = codeResult[i].slice(0,7);
            data['a_code'] = filteredCode;
        }
        // console.log(data)
        let sql = 'INSERT INTO invite_artist SET ?';
        let query = db.query(sql, data, (err, result) => {
        if(err) throw err;
        message(data);
        // console.log(datalog);
        res.render('admin_home', {message: 'Invitation successfully sent!!!'});
    });
    });
});


app.post('/inviteartist2', (req, res) => {
    let data = {
        a_name: req.body.name,
        a_email: req.body.email,
        a_phone: req.body.phone,
        a_code: req.body.code,
        status: 'pending',
        super_user: req.session.username,
        count: 0
    };
    
    if(data.a_name && data.a_email && data.a_phone) {
        let phoneNumberVal = /^\d{10}$/;
        if(data.a_phone.match(phoneNumberVal)) {
            let sql1 = 'SELECT uuid()';
            let query1 = db.query(sql1, (err, result) => {
                if(err) throw err;
                var codeResult = result[0];
                for(var i in codeResult) {
                    let filteredCode = codeResult[i].slice(0,7);
                    data['a_code'] = filteredCode;
                }
                // console.log(data)
                let sql = 'INSERT INTO invite_artist2 SET ?';
                let query = db.query(sql, data, (err, result) => {
                if(err) throw err;
                message(data);
                // console.log(datalog);
                res.render('artist_home_invite_user', {message: 'Invitation successfully sent!!!'});
            });
            });
        }
        else {
            res.render('artist_home_invite_user', {message: 'Please enter valid phone number!!'});
        }
    }
    else {
        res.render('artist_home_invite_user', {message: 'Please enter all details!!'});
    }
});


//artist registration
app.get('/artist_registration', (req, res) => {
    res.render('artist_registration');
});

app.get('/norartist_registration', (req, res) => {
    res.render('norartist_registration');
});

app.post('/norartistreg', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code,
        email: req.body.email,
        singer: req.body.s,
        dancer: req.body.d,
        musician: req.body.m,
        badge: 'none',
        phone: req.body.phone
    };

    if(data.singer && data.dancer && data.musician) {
        data.badge = 'all rounder';
    }
    console.log(data.badge);
    // console.log(data);
    let sql = `SELECT COUNT(*) FROM invite_artist2 WHERE a_code = '${data.code}' AND a_email = '${data.email}'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        var countResult = result[0];
        var count = [];
        for(var i in countResult) {
            count.push(countResult[i]);
        }
        if(count[0]) {
            let query1 = db.query(`UPDATE invite_artist2 SET status = 'accepted', count = 1 WHERE a_code = '${data.code}' AND a_email = '${data.email}'`, (err, result) => {
                // let creditsUp = db.query(`UPDATE new_artist SET rewards = rewards + 50 WHERE username = ''`)
                let query3 = db.query(`SELECT * FROM invite_artist2 WHERE a_code = '${data.code}' AND a_email = '${data.email}'`, (err, result) => {
                    var superUserObj = {};
                    let a = result[0];
                    for(var i in a) {
                        superUserObj[i] = a[i];
                    }
                    // console.log(result);
                    let query4 = db.query(`UPDATE new_artist SET rewards = rewards + 50 WHERE username = '${superUserObj.super_user}'`, (err, result) => {
                        if(err) throw err;
                    });
                });
                if(err) throw err;
                let sql2 = `INSERT INTO new_artist2 (username, email, rewards, about, last_login, password, badge1, badge2, phone) VALUES ('${data.username}', '${data.email}', 100, 'Need to update!!', NOW(), '${data.password}', 'newbie', '${data.badge}', ${data.phone})`;
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

app.post('/artistreg', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code,
        email: req.body.email,
        phone: req.body.phone
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
                let sql2 = `INSERT INTO new_artist (username, email, rewards, about, last_login, password, phone) VALUES ('${data.username}', '${data.email}', 100, 'Need to update!!', NOW(), '${data.password}', ${data.phone})`;
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
});