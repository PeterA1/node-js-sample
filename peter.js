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

      var result = op(a,b);
      
      sys.puts(sys.inspect(parts));
      
      res.writeHead(200, {'Content-Type': 'text/html'});
      
      res.write("<h1>Hello World!</h1>");
      
      res.write(result);
      
      res.end("<h2>This is the end!</h2>");
      
      res.end(result);
      
    }).listen(5000);
    
console.log("Server running at port 5000");
