const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json())

// Create connection
var mysql = require('mysql')

var DB_HOST = process.env.DB_HOST;
var DB_USER = process.env.DB_USER;
var DB_PASS = process.env.DB_PASS;
var DB_NAME = process.env.DB_NAME;

var myConnection  = require('express-myconnection')
var dbOptions = {
    host : DB_HOST,
    user : DB_USER,
    password : DB_PASS,
    database : DB_NAME
}
app.use(myConnection(mysql, dbOptions, 'pool'))

// Insert Data - single 
app.post('/add', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let post = {time: req.body.time, value: req.body.value}
        console.log(post);
        let sql = 'INSERT INTO my_db.mysql_data SET ?'
        conn.query(sql, post, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('Success...')
        })
    })
})

// Insert Data - multiple
app.post('/add_bulk/', (req, res) => {     
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   
      
        console.log(req.body);
        var body = JSON.stringify(req.body);

        let sql = 'INSERT INTO my_db.mysql_data (time, value) SELECT JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].time\')),JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].value\')) FROM (SELECT \''+body+'\' AS B) AS A JOIN jj ON num < JSON_LENGTH(\''+body+'\');'      
        console.log(sql);

        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('Success...')
        })  
    }) 
})

// show all datas
app.get('/getdata', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }  

        let sql = 'SELECT * FROM my_db.mysql_data'
        
        console.log(sql)
        conn.query(sql, (err,result) => {
            if(err) throw err
            console.log(result)

            if(result == "") res.status(404).send("No Data")
            else             res.status(200).send(result)
        })
    })
})

app.listen('8080',() => {
    console.log('Server started on port 8080')
})
