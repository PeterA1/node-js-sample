var sys = require('sys'),
    http = require('http');
    
    http.createServer(function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write("<h1>Hello World!<h1>");
      res.end("<h2>This is the end!!<h2>");
    }).listen(5000);
    
sys.puts("Server running at port 5000");
