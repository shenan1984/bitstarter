var express = require('express');

var app = express.createServer(express.logger());

var fs = required('fs');

app.get('/', function(request, response) {
    var out = fs.readFileSync(index.html);
    buf.toString('utf8',0,27);
    response.send(out);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
