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

// Create JJ table - which is required for Json to MySQL
app.get('/createDatatable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }    
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.mysql_data(seq INT AUTO_INCREMENT, time BIGINT, value FLOAT(3.3), PRIMARY KEY(seq))'
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            console.log(result)

            res.status(200).send('The table was created.')
        })
    })
})

// Create JJ table - which is required for Json to MySQL
app.get('/createJJtable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }    
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.jj(seq INT AUTO_INCREMENT,num INT, PRIMARY KEY(seq))'
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            console.log(result)

            res.send('The table was created.')
        })
    })
})

// Initialize JJ
app.get('/initializejj', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let sql = 'INSERT INTO my_db.jj (num) VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),(41),(42),(43),(44),(45),(46),(47),(48),(49),(50),(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),(61),(62),(63),(64),(65),(66),(67),(68),(69),(70),(71),(72),(73),(74),(75),(76),(77),(78),(79),(80),(81),(82),(83),(84),(85),(86),(87),(88),(89),(90),(91),(92),(93),(94),(95),(96),(97),(98),(99)'

        console.log(sql);
        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            
            res.send('Table JJ is intialized')
        })
    })
})

app.listen('8080',() => {
    console.log('Server started on port 8080')
})
