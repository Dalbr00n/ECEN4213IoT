const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql2');
const bodyParser = require("body-parser");
const net = require('net');
const util = require('util');
const kobuki = require( './build/Release/lab7iot_2-native.node');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

//joystick dependences to send and recieve
var http = require('http');
    fs = require('fs');
    url = require('url');
    qs = require('querystring');

const port = 3001;

//used to prevent overflow of database values
const start = Date.now();

//initialize mysqlconnection
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'node',
  password: '',
  database: 'KO',
  multipleStatements: true
});
connection.connect(function(err){
  if(err){
    console.error('error: ' + err.message);
  }

  console.log('MySQL connection successful!');
});

//reset the tables
const sqlinit = 'DROP TABLE IF EXISTS KODATA;'+
                'CREATE TABLE KODATA('+
                'time_in_ms int primary key,L_bump varchar(1),C_bump varchar(1),R_bump varchar(1),L_cliff varchar(1), C_cliff varchar(1), R_cliff varchar(1), L_wheel varchar(1), R_wheel varchar(1));';
connection.query(sqlinit, (error,results,feilds) =>{
  if(error){
    console.log("error: " + error.message);
  }

  console.log("Database Initialized")
});

/*
//code to deal with the server joy commands
http.createServer(function (request,res) {
  if (request.method == 'POST') {
      var body = '';
      //constructing the POST request 
      request.on('data', function (data) {
          body += data;
          // Too much POST data, kill the connection!
          // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
          if (body.length > 1e6)
              request.connection.destroy();
      });
      
      request.on('end', function () {
          var post = qs.parse(body);
          console.log(post);
          res.end();
      });
  }
  //getting data from the sql server
  if(request.method == 'GET'){
  }
}).listen(3001);*/
// listening on port 3001 for the POST request



app.use(express.static(__dirname + "/public"));
app.use("/img", express.static("img"));
app.use("/public",express.static("public"));

//opens up the index file for the server
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//handles getting sensor information
app.post('/sensordata',function(req,res){

  console.log(req.body.t);

  //building the SQL query

  //time in ms to get up to based on user request
  const upTo = (Date.now()-start) - req.body.t;

  const query = "SELECT * FROM KODATA WHERE time_in_ms > "+ upTo + " ORDER BY time_in_ms DESC";

  connection.query(query,(error,results,feilds) =>{
    console.log(results);
    res.send(results);
  });
});

//open up the server on port: port (defined above)
server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

const cComm = net.createServer((c) =>{
  console.log('client connected');

  c.on('end',()=>{
    console.log('client disconncected');
  });

  c.on('data', (data) => {
    //decode the array buffer
    var dec = new util.TextDecoder("utf-8");

    io.emit('web', dec.decode(data));
  });
});

cComm.listen({
  host:'127.0.0.1', 
  port: 3004
});

//handles the joystick data
app.post('/joydata',function(req,res){
  var xpos = req.body.x;
  var ypos = req.body.y;

  console.log("xpos: " + xpos + " ypos: " + ypos + "\n");
  kobuki.Method("xpos: " + xpos + " ypos: " + ypos);
  //this makes c++ wayyyy easier
  
  res.end();
});

//test code to fill the server with dummy data
setInterval(function(){
  const query = "INSERT INTO KODATA (time_in_ms, L_bump,R_cliff,R_wheel) VALUES (" + (Date.now()-start) + ",'1','0','1')";

  connection.query(query, (error, results, feilds) =>{
    if(error){
      console.log("error: "+error.message);
    }
  });
},1000);