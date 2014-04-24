Days  = [ "Sunday","Monday", "Tuseday", "Wednesday","Thursday","Friday","Saturday","Sunday","Monday", "Tuseday", "Wednesday","Thursday","Friday","Saturday "]; 
Month = [ "January", "February","March","April","May","June","July","August","September","October","November","December","January", "February","March","April","May","June","July","August","September","October","November","December" ];
Mth   = [ [ 1, 21, 31 ],[ 2, 22 ],[ 3, 23 ] ]; // st,nd,rd (others are th).

var WebSocketServer = require('ws').Server

var Traffic = new Array();

VolMessages = 0;

Counter = 1000;

wss = new WebSocketServer({port: 5000});

wss.on('connection', function(ws) { ws.id = "myUID"+Counter;  ws.send(ws.id); Counter = Counter + 1; Traffic.push(ws); Now = new Date(); console.log("Opened to : ",ws.id, GetDate(Now));
                                    ws.on('message', function(message) { MessageRecieved(ws,message); } ); 
                                    ws.addEventListener('close', function(code)    { wsRemove(code.target.id); return; },true );
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
      if (Traffic[k].id == faultyconnection ) { Traffic[k].id = ""; Now = new Date(); console.log("Removed :" + faultyconnection, GetDate(Now) ); return; }; 
    };
    Now = new Date(); console.log("Could not find :" + faultyconnection, GetDate(Now)); 
};
    
function GetDate(date) {

fDate = new Date();
fDate.setTime(date);
    rDate = Days[fDate.getDay()]+",";
	f = 0;
    rDate += " " + Month[fDate.getMonth()];
    if (Mth[0].indexOf(fDate.getDate()) > -1 ) { rDate = rDate+" "+fDate.getDate()+"st"; f=1;};
    if (Mth[1].indexOf(fDate.getDate()) > -1 ) { rDate = rDate+" "+fDate.getDate()+"nd"; f=1;};
    if (Mth[2].indexOf(fDate.getDate()) > -1 ) { rDate = rDate+" "+fDate.getDate()+"rd"; f=1;};
    if (f == 0 ) {rDate = rDate+", "+fDate.getDate()+"th"; };
    
    rDate += " " + fDate.getFullYear();
    Hours = fDate.getHours();
    Minutes = fDate.getMinutes();
    if (Hours < 12) { AMPM = "am"; }; if (Hours > 11) { AMPM = "pm"; if (Hours > 12) { Hours = Hours - 12; }; };
    Minutes = Minutes + AMPM; if (Minutes.length < 4) { Minutes = "0" + Minutes };
    rDate += ", "+ Hours + "." + Minutes +" (+"+fDate.getMilliseconds()+"ms)";

return rDate;

};
    
   
    
