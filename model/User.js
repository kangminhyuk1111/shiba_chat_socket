const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: '1234',
    database: 'codingon'
})

module.exports = conn;