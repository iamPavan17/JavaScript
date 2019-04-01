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
    database: 'node_express_assignment'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(`
        <h3> Home </h3>
    `);
});

app.get('/display', (req, res) => {
    let sql = 'SELECT * FROM db_api';
    db.query(sql, (err, result) => {
        res.render('display', {display: result});
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000...');
})
