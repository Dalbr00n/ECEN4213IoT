const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

//joystick dependences to send and recieve
var http = require('http');
    fs = require('fs');
    url = require('url');
    qs = require('querystring');

const port = 3000;

var xpos;
var ypos;

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
}).listen(3001);
// listening on port 3001 for the POST request

app.use(express.static("public"));
app.use("/img", express.static("img"));

//opens up the index file for the server
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//emits the camera image (data) to the webpage as 'web'
setInterval(function(){
    io.emit('web',data);
}, 500);


//open up the server on port: port (defined above)
server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});