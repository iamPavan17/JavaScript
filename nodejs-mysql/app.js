const express = require('express');
const mysql = require('mysql');

// Creates connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nodemysql'
});
  
db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('MySql Connected....');
})

const app = express();

app.get('/', (req, res) => {
    res.send('Node-js with MySQL');
})

//creates table
app.get('/createtable', (req, res) => {
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title varchar(50), body varchar(50), PRIMARY KEY (id))';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Posts table created!!!');
    });
});

//Insert Post1
app.get('/addpost1', (req, res) => {
    let post = {
        title: 'Post One',
        body: 'THis is post body one'
    };
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Posts1 Added!!!');
    })
});

//Insert Post2
app.get('/addpost2', (req, res) => {
    let post = {
        title: 'This is post2 title',
        body: 'This is post2 body'
    };
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post2 Added!!!');
    });
});

//Select
app.get('/getposts', (req, res) => {
    let sql = 'SELECT * FROM posts';
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        // console.log(results[0].id); //returns id
        console.log(results); //returns whole data
        res.send('Posts record Fetched!!!');
    });
});

//select by id
app.get('/getpost/:id', (req, res) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post record1 Fetched!!!');
    });
});

//update
app.get('/updatepost/:id', (req, res) => {
    let newTitle = 'Updated Post';
    let sql = `UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Updated Post!!!');
    })
})

app.listen('3000', () => {
    console.log('Server started on port 3000');
});