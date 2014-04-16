var WebSocketServer = require('ws').Server

var Traffic = new Array();

VolMessages = 0;

Counter = 1000;

wss = new WebSocketServer({ port:0080 });

wss.on('connection', function(ws) { ws.id = "myUID"+Counter; Counter = Counter + 1; ws.send('UID'+Counter); Traffic.push(ws); ws.on('message', function(message) { MessageRecieved(ws,message); } ); 
                                    ws.addEventListener('close', function(code)    { console.log("We have just closed :",code.target.id); wsRemove(code.target.id); return; },true );
                                    ws.addEventListener('error', function(error)   { console.log("Error  :",error); return; },true );
                                  } );

function MessageRecieved(ws,message) {

    SendMessage(ws,message); VolMessages = VolMessages + 1; console.log(VolMessages);

};

function SendMessage(ws,message) {
  for (k=0;k<Traffic.length;k++) {
      

      
      if (Traffic[k].id != ws.id && Traffic[k].id.length > 0) { Traffic[k].send(message); VolMessages = VolMessages + 1; console.log(VolMessages); };

  };
    
};

function wsRemove(faultyconnection) {
  
    for (k=0;k<Traffic.length;k++) {
      

      
      if (Traffic[k].id == faultyconnection ) { Traffic[k].id = ""; console.log("Removed :" + faultyconnection); return; };
        
      console.log("Could Not find");

    };
    
};
  
