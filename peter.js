var sys = require('sys'),
    http = require('http');
    
var operations = {
    add: function(a,b) { return a + b },
    sub: function(a,b) { return a - b },
    mul: function(a,b) { return a * b },
    div: function(a,b) { return a / b }
};
    http.createServer(function(req, res) {
      
      var parts = req.url.split("/"),
        op = operations[parts[1]],
        a = parseInt(parts[2], 10),
        b = parseInt(parts[3], 10);

      var result = "" + op(a,b);
      
      sys.puts(sys.inspect(parts));
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      
      res.write("<h1>The Worlds simplest Web Service in Node.js</h1>");
      
      res.write("<h2>You have asked for " + parts[2] + " " + parts[1] + " " + parts[3] + "</h2>")
      
      res.end(result);
      
    }).listen(5000);
    
console.log("Server running at port 5000");
