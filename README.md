# Json to MySQL

I thought it is easy to merge json arry to mysql but I can't find a good reference so far.  
Also, I know MySQL 8.0 is supporting this easily but unfortuniately, my own version is still 5.7.x.  
So, let me share a solution based on this reference.   

[Convert JSON array in MySQL to rows](https://stackoverflow.com/questions/39906435/convert-json-array-in-mysql-to-rows)  

### create temperary table
mysql> CREATE TABLE jj (num int(10) unsigned NOT NULL, PRIMARY KEY (num));
mysql> INSERT jj VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

### json object  
SET @j = '[
    {
        "time": 1561553417713,
        "value": 0.2
    },
    {
        "time": 1561553417813,
        "value": 0.3
    },
    {
        "time": 1561636991563,
        "value": 0.5
    }
]';

### create mysql table
mysql> CREATE TABLE IF NOT EXISTS test.data(num BIGINT AUTO_INCREMENT, time BIGINT, value FLOAT(2.2),PRIMARY KEY(num))

### extact the values from json and then put in MySQL as bellow.
mysql> INSERT INTO test.data (time, value) SELECT JSON_EXTRACT(@j,CONCAT('$[', num, '].time')),JSON_EXTRACT(@j,CONCAT('$[', num, '].value')) FROM (SELECT @j AS B) AS A JOIN jj ON num < JSON_LENGTH(@j);
Query OK, 3 rows affected (0.00 sec)  
Records: 3  Duplicates: 0  Warnings: 0  

mysql> select * from test.data;
+-----+---------------+-------+  
| num | time          | value |  
+-----+---------------+-------+  
|   1 | 1561553417713 |   0.2 |  
|   2 | 1561553417813 |   0.3 |  
|   3 | 1561636991563 |   0.5 |  
+-----+---------------+-------+  
6 rows in set (0.00 sec)  

Let me share an example in MySQL which is supporting a easy to way to convert json array to mysql.  
[MySQL 8.0]  
(https://dev.mysql.com/doc/refman/8.0/en/json-table-functions.html)  
mysql> SELECT *  
    -> FROM  
    ->   JSON_TABLE(  
    ->     '[{"x":2,"y":"8"},{"x":"3","y":"7"},{"x":"4","y":6}]',  
    ->     "$[*]" COLUMNS(  
    ->       xval VARCHAR(100) PATH "$.x",  
    ->       yval VARCHAR(100) PATH "$.y"  
    ->     )
    ->   ) AS  jt1;  

+------+------+  
| xval | yval |   
+------+------+  
| 2    | 8    |  
| 3    | 7    |  
| 4    | 6    |  
+------+------+  

# Example
### create a cluster based on EKS  
$ eksctl create k8s/cluster -f cluser.yaml  

### prepare MySQL server
$ kubectl create -f k8s/mysql/local-volumes.yaml  
$ kubectl create -f k8s/mysql/mysql-pv-claim.yaml  
$ kubectl create -f k8s/mysql/mysql.yaml  
$ kubectl create -f k8s/mysql-service.yaml  

#### setup the database in .bashrc  
export DB_HOST='abcedfefewfdfdfdf-158449500.eu-west-2.elb.amazonaws.com';  
export DB_USER='root';  
export DB_PASS='passwd';  
export DB_NAME='database';  

### config MySQL
$ kubectl create secret generic mysql-credential --from-file=./username --from-file=./password  
$ kubectl create -f k8s/mysql-configmap.yaml  
$ mysql -h [server address] -u root -p  

### initiate
$ npm init
$ npm install --save mysql express express-myconnection -f

$ curl localhost:8080/createDatatable
$ curl localhost:8080/createJJtable
$ curl localhost:8080/initializejj

### run
curl localhost:8080/add -H "Content-Type: application/json" -d '{"time":1561553417713,"value":0.3}'
curl localhost:8080/getdata | python -m json.tool
curl localhost:8080/add_bulk -H "Content-Type: application/json" -d '[{"time": 1561553417713,"value": 0.2},{"time": 1561553417813,"value": 0.3},{"time": 1561636991563,"value": 0.5}]'
curl localhost:8080/getdata | python -m json.tool
