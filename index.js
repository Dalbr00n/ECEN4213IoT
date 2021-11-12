const express = require('express');
var NodeWebcam = require('node-webcam');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

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


app.use(express.static("public"));
app.use("/img", express.static("img"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});



var opts={
  quality:30,
  frames: 1,
  saveShots: false,
  output:"jpeg",
  callbackReturn:"base64",
  verbose:false
}

var Webcam = NodeWebcam.create( opts );


setInterval(function(){
    io.emit('web',data);
}, 500);



server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});


// pause / resume frame emission (without tunning off the camera)
// shutdown everything, including, camera, browser, server:
console.log('Capturing camera');