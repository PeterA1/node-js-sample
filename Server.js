// var debug = require('debug')('apn'); // //
var fs = require('fs');
var http = require('http');
var https = require('https');
var apn = require('apn');
var DOMParser = require('xmldom').DOMParser;
var SPARQLclient = require('sparql-client');
var util = require('util');
var endpoint = 'http://landregistry.data.gov.uk/landregistry/query';
var orders = {};

console.log("And here we start");

//var query1 = 'SELECT ?paon ?saon ?street ?town ?county ?postcode ?amount ?date WHERE { ?transx lrppi:pricePaid ?amount ; lrppi:transactionDate ?date ; lrppi:propertyAddress ?addr; ?addr lrcommon:postcode ?postcode."';
    //''+postCode+
//var query2 = '"^^xsd:string. OPTIONAL {?addr lrcommon:county ?county} OPTIONAL {?addr lrcommon:paon ?paon} OPTIONAL {?addr lrcommon:saon ?saon} OPTIONAL {?addr lrcommon:street ?street} OPTIONAL {?addr lrcommon:town ?town} } ORDER BY ?amount';

//var query1 = 'SELECT ?paon ?saon ?street ?town ?county ?postcode ?amount ?date ' + 'WHERE { ?transx lrppi:pricePaid ?amount ; lrppi:transactionDate ?date ;  lrppi:propertyAddress ?addr. '+
             '?addr lrcommon:postcode "';

//var query2 = '"^^xsd:string. ?addr lrcommon:postcode ?postcode. '+
             'OPTIONAL {?addr lrcommon:county ?county} OPTIONAL {?addr lrcommon:paon ?paon} OPTIONAL {?addr lrcommon:saon ?saon}  OPTIONAL {?addr lrcommon:street ?street} OPTIONAL {?addr lrcommon:town ?town} } ORDER BY ?date';
//var prefix =  "prefix xsd: <http://www.w3.org/2001/XMLSchema#>"
//            + "prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>"
//            + "prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>";

var prefix =    "prefix xsd: <http://www.w3.org/2001/XMLSchema#>" +
                "prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>" +
                "prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>" +
                "prefix skos: <http://www.w3.org/2004/02/skos/core#>"+
                "prefix lrhpi: <http://landregistry.data.gov.uk/def/hpi/>"+
                "prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>"+
                "prefix owl: <http://www.w3.org/2002/07/owl#>" +
                "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
                "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>";


var prefix = "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
             "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
             "prefix owl: <http://www.w3.org/2002/07/owl#>" +
             "prefix xsd: <http://www.w3.org/2001/XMLSchema#>" +
             "prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>" +
             "prefix lrhpi: <http://landregistry.data.gov.uk/def/hpi/>" +
             "prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>" +
             "prefix skos: <http://www.w3.org/2004/02/skos/core#>" +
             "prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>" +
             "PREFIX  ppd:  <http://landregistry.data.gov.uk/def/ppi/>" +
             "PREFIX  lrcommon: <http://landregistry.data.gov.uk/def/common/>";
var query1 = "SELECT  ?ppd_pricePaid ?ppd_transactionDate ?ppd_estateType ?ppd_propertyAddressPaon ?ppd_propertyAddressPostcode ?ppd_propertyAddressSaon ?ppd_propertyAddressStreet ?ppd_propertyAddressTown ?ppd_propertyType" +
    " WHERE "+
    "{ ?ppd_propertyAddress <http://jena.apache.org/text#query> _:b0 . " +
    '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> "';

var query2 = '" . _:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> _:b1 . ' +
    "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> 3000000 . " +
    "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil> . " +
    " ?item ppd:hasTransaction ?ppd_hasTransaction . " +
    "?item ppd:pricePaid ?ppd_pricePaid . " +
    "?item ppd:propertyAddress ?ppd_propertyAddress . " +
    "?item ppd:publishDate ?ppd_publishDate . " +
    "?item ppd:transactionDate ?ppd_transactionDate . " +
    "?item ppd:transactionId ?ppd_transactionId " +
    "OPTIONAL { ?item ppd:estateType ?ppd_estateType } " +
    "OPTIONAL { ?item ppd:newBuild ?ppd_newBuild } " +
    "OPTIONAL { ?item ppd:propertyAddress/lrcommon:county ?ppd_propertyAddressCounty } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:district ?ppd_propertyAddressDistrict } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:locality ?ppd_propertyAddressLocality } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:paon ?ppd_propertyAddressPaon } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:postcode ?ppd_propertyAddressPostcode } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:saon ?ppd_propertyAddressSaon } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:street ?ppd_propertyAddressStreet } " +
    "OPTIONAL  { ?item ppd:propertyAddress/lrcommon:town ?ppd_propertyAddressTown } " +
    "OPTIONAL  { ?item ppd:propertyType ?ppd_propertyType } " +
    "OPTIONAL  { ?item ppd:recordStatus ?ppd_recordStatus } " +
    "} ";




var client = new SPARQLclient(endpoint);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var WebSocketServer = require('ws').Server;

var Traffic = new Array();

var options = {};

options.passphrase = 'rooster';
options.production = false;
options.gateway = 'gateway.sandbox.push.apple.com';
options.port = 2195;
// options.enhanced = true;


VolMessages = 0;

Counter = 1000;

var CurrentPlex = "";

wss = new WebSocketServer({port: 5000});

var CF = [];
var allPlex = {};
var count = 0;
fs.readdir('/home/ec2-user/node/NewServer',function (a,b) { console.log(a,b); files(a,b) } );

function files(a,b) {
	if ( a ) { console.log("Error Reading Directory",a); }
    for ( var i = 0; i < b.length; i++ ) { if ( b[i].substring(b[i].length-7,b[i].length) == '.plexDB' ) { CF.push(b[i])} }
    loadAllPlex();
}

function loadAllPlex() {
    if ( count >= CF.length ) { return; }
    fs.readFile('/home/ec2-user/node/NewServer/'+CF[count],'utf8',function(err,data) { allPlex[CF[count]] = data;  count = count +1 ; loadAllPlex(); } );
}

wss.on('connection', function(ws) { ws.id = "myUID"+Counter;
                                    Traffic.push(ws);
                                    console.log("Opened to : ",ws.id);
                                    ws.send(JSON.stringify(['NEW',ws.id+""])); Counter = Counter + 1;
                                    ws.send(JSON.stringify(['CLP',CurrentPlex,CF,allPlex['plexStart.plexDB']]));
                                    ws.on('message', function(message) { MessageRecieved(ws,message); } );
                                    ws.addEventListener('close', function(code)    { wsRemove(code.target.id); return; },true );
                                    ws.addEventListener('error', function(error)   { console.log("Error  :",error); return; },true );
                                  } );

function MessageRecieved(ws,message) {
    var D = JSON.parse(message);
    console.log("Revieved",ws.id,message.substring(0,150));
    if ( D[0] == 'RST' ) { ws.send(JSON.stringify(['CLP',CurrentPlex,CF,allPlex['plexStart.plexDB']])); return; }
    if ( D[0] == 'MYU' ) { console.log("re-naming",ws.id,"to",D[1]); ws.id = D[1]; return; }
    if ( D[0] == 'SVP' ) { fs.writeFile('/home/ec2-user/node/NewServer/'+D[1].n+'.plexDB',JSON.stringify(D[1])); allPlex[D[1].n+'.plexDB'] = JSON.stringify(D[1]); console.log("Saving ",D[1].n); if ( CF.indexOf(D[1].n+'.plexDB') < 0 ) { CF.push(D[1].n+'.plexDB'); } return; }
    if ( D[0] == 'GMP' ) { ws.send(JSON.stringify(['HAP',CF])); return; }
    if ( D[0] == 'SMP' ) { ws.send(JSON.stringify(['HYP',allPlex[D[1]]])); CurrentPlex = D[1]; return;  }
    if ( D[0] == 'SMS' ) { ws.send(JSON.stringify(['HIS',allPlex['PlexShareItems.plexDB']])); return; }
    if ( D[0] == 'APN' ) { if ( D[1] != null ) { D.push(ws.id); SendMessage(ws,JSON.stringify(D)); console.log(D); } else { console.log("null APN token received"); } return; }
    if ( D[0] == 'PNS' ) { SendNotification(D[1],D[2],D[3],D[4],D[5]); return; }
    if ( D[0] == 'DIG' ) { console.log(D); return; }
    if ( D[0] == 'WSC' ) { WebServiceConnect(ws,D[1],D[2],D[3],D[4],D[5]); return; }
    if ( D[0] == 'GML' ) { GiveMeLocation(ws,D[1],D[2],D[3],D[4]); return; }
    if ( D[0] == 'HPI' ) { HousePriceCheck(ws,D[1],D[2]); return; }
    if ( D[0] == 'MPP' ) { Plex2Client(ws,D[1]); return; }
    if ( D[0] == 'PSQ' ) { fs.writeFile('/home/ec2-user/node/NewServer/Resources.plexREST',JSON.stringify(D[1])); ResourcesPlex = JSON.stringify(D[1]); console.log('Saved Queries'); return; }
    if ( D[0] == 'ORD' ) { NewOrder(ws,D[1]); return; }
    SendMessage(ws,message);

}

function NewOrder(ws,order) {
	if ( order.eMoney ) {
		console.log("eMoney Order Recieved");
		var orderRef = MD5(JSON.stringify(order)).toUpperCase().substring(0,11);
		console.log('Order Reference',orderRef);
		orders[orderRef] = order;
		console.log(orders);
		ws.send(JSON.stringify(['ORR',orderRef]));
	}
}

function Plex2Client(ws,name) {
    if ( typeof allPlex[name] == 'string' && allPlex[name].length > 100000 ) {
        var Bplex = allPlex[name];
        var length = Bplex.length;
        for ( var i = 0; i < length; i += 100000 ) {
            ws.send(JSON.stringify(['PPP',i,length,Bplex.substring(i,i+100000)]));
        }
        ws.send(JSON.stringify(['HYP',length]));
    }
    else {
        ws.send(JSON.stringify(['HYP', JSON.parse(allPlex[name]) ] ));
    }
}

function HousePriceCheck(ws,query,selected) {
    if ( selected ) { fs.readFile('/home/ec2-user/node/NewServer/pricesearches/'+ws.id+'.arr', function(e,data) { if (e) { console.log("Error Reading ",'pricesearches/'+ws.id+'.arr'); return; } DownSort(ws,selected,JSON.parse(data)); });  return; }
    client.query(prefix+query1+query+query2).execute(function(errors,results) { ProcessHousePriceCheck(ws,results,errors); return; });
}

function DownSort(ws,selected,data) {
    var newData = [];
    if ( selected[0] == 'street' || selected[0] == 'postcode' ) { for ( var i = 0; i < data.length; i++ ) { if ( data[i][selected[0]] == selected[1] ) { newData.push(data[i]); } } }
    if ( selected[0] == 'date' ) { for ( var i = 0; i < data.length; i++ ) { if ( new Date(data[i].valdate).getFullYear() == selected[1] ) { newData.push(data[i]); } } }
    if ( selected[0] == 'price' ) {
        var min,max,price;
        if ( selected[1] == 'less than £100,000' ) { min = 0; max = 100000; }
        if ( selected[1] == '£100,000 to £250,000' ) { min = 100000; max = 250000; }
        if ( selected[1] == '£250,000 to £500,000' ) { min = 250000; max = 500000; }
        if ( selected[1] == '£500,000 to £750,000' ) { min = 500000; max = 750000; }
        if ( selected[1] == '£750,000 to £1,000,000' ) { min = 750000; max = 1000000; }
        if ( selected[1] == 'over £1,000,000' ) { min = 1000000; max = 99999999999; }
        for ( var i = 0; i < data.length; i++ ) { var price = data[i].price; price = parseInt(price.substring(1,price.length).replace(/,/g,"")); if ( price > min && price < max ) { newData.push(data[i]); } }
    }
    ws.send(JSON.stringify(["HPR",newData]));
}

var Months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
var rds = [ 3,23 ];
var sts = [ 1,21 ];
var nds = [ 2,22 ];
var notth = [ 3,23,1,21,2,22 ];
// anything else is 'th'
function toCAPS(input) {
    var k = input.split(" ");
    for ( var i = 0; i < k.length; i++ ) {
        k[i] = k[i].charAt(0).toUpperCase() + k[i].slice(1).toLowerCase();
    }
    return k.join(" ");
}

function NewSort(a,b) {
    if ( a.address < b.address ) { return -1 }
    if ( a.address > b.address ) { return  1 }
    if ( parseInt(a.paon) < parseInt(b.paon) ) { return  -1 }
    if ( parseInt(a.paon) > parseInt(b.paon) ) { return   1 }
    if ( parseInt(a.saon) > parseInt(b.saon) ) { return  -1 }
    if ( parseInt(a.saon) < parseInt(b.saon) ) { return   1 }
    if ( a.valdate < b.valdate ) { return -1 }
    if ( a.valdate > b.valdate ) { return  1 }
    return 0;
}

function ProcessHousePriceCheck(ws,results,errors) {
    var now = Date.now();
    var DataArr = results.results.bindings;
    var street = { plexcount: 0 };
    var postcode = { plexcount: 0 };
    var date = { plexcount: 0 };
    var price = { 'less than £100,000': 0, '£100,000 to £250,000': 0, '£250,000 to £500,000': 0, '£500,000 to £750,000': 0, '£750,000 to £1,000,000': 0 , 'over £1,000,000': 0 };
    var NewData = [];
    for ( var i = 0; i < DataArr.length; i++ ) {
        for ( var a in DataArr[i] ) {
            NewData[i] = NewData[i]  || {};
            switch (a) {
                case 'ppd_propertyType': {
                    var d = DataArr[i][a].value; d = d.split("/");
                    NewData[i].type = d[d.length-1];
                    break;
                }
                case 'ppd_pricePaid': {
                    var v = parseInt(DataArr[i][a].value);
                    NewData[i].price = '£'+ DataArr[i][a].value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    if ( v < 100000 ) { price['less than £100,000']++; break; }
                    if ( v < 250000 ) { price['£100,000 to £250,000']++; break; }
                    if ( v < 500000 ) { price['£250,000 to £500,000']++; break; }
                    if ( v < 750000 ) { price['£500,000 to £750,000']++; break; }
                    if ( v < 1000000 ) { price['£750,000 to £1,000,000']++; break; }
                    price['over £1,000,000']++;
                    break;
                }
                case 'ppd_propertyAddressPostcode': {
                    NewData[i].postcode = DataArr[i][a].value.slice(0).toUpperCase();
                    if ( postcode[NewData[i].postcode] ) { postcode[NewData[i].postcode]++;} else { postcode[NewData[i].postcode] = 1; postcode.plexcount++ }
                    break;
                }
                case 'ppd_propertyAddressPaon': {
                    NewData[i].paon = toCAPS(DataArr[i][a].value);
                    break;
                }
                case 'ppd_propertyAddressSaon': {
                    NewData[i].saon = toCAPS(DataArr[i][a].value);
                    break;
                }
                case 'ppd_propertyAddressStreet': {
                    NewData[i].address = toCAPS(DataArr[i][a].value);
                    if ( DataArr[i].ppd_propertyAddressTown ) { var ST = NewData[i].address + ', '+toCAPS(DataArr[i].ppd_propertyAddressTown.value); } else { var ST = NewData[i].address; }
                    if ( street[ST] ) { street[ST]++ } else { street[ST] = 1; street.plexcount++ }
                    NewData[i].street = ST;
                    break;
                }
                case 'ppd_propertyAddressTown': {
                    NewData[i].town = toCAPS(DataArr[i][a].value);
                    break;
                }
                case 'ppd_transactionDate': {
                    var d = new Date(Date.parse(DataArr[i][a].value));
                    var year = d.getFullYear();
                    if ( date[year] ) { date[year]++ } else { date[year] = 1; date.plexcount++ }
                    var day = d.getDate();
                    if ( notth.indexOf(day) < 0 ) { day = day + 'th'; } else { if ( rds.indexOf(day) > -1 ) { day = day + 'rd' } if ( sts.indexOf(day) > -1 ) { day = day + 'st' } if ( nds.indexOf(day) > -1 ) { day +='nd' } }
                    NewData[i].date = day + " " + Months[d.getMonth()] + " " + d.getFullYear();
                    NewData[i].valdate = d.valueOf();
                }
            } }

    }
    NewData.sort(NewSort);
    fs.writeFile('/home/ec2-user/node/NewServer/pricesearches/'+ws.id+'.arr',JSON.stringify(NewData));
    if ( NewData.length < 1000 ) { ws.send(JSON.stringify(["HPR",NewData])); } else { ws.send(JSON.stringify(["HPR", { plexcount: NewData.length, street: street,postcode: postcode, date: date, price: price }])); }
    console.log("First Pass", Date.now() - now);
}

function GiveMeLocation(ws,host,path,query,selected) {
    // https://maps.googleapis.com/maps/api/geocode/json?latlng=51.759766000000006,-0.567857&sensor=true&key=AIzaSyBA3ffK6HhJPpXdGngbCxsAhul4hrrZ-KY
    var ssl = false;
    if ( query ) { path = path + '?' + toJSONhttp(query); }
    if ( host.substring(0,8) == 'https://' ) { host = host.substring(8,host.length); ssl = true; }
    if ( host.substring(0,7) == 'http://' ) { host = host.substring(7,host.length); }
    var str = "";
    var options = {
        host: host,
        path: path,
        headers: { 'Content-Type':'application-json' },
        method: 'GET'
    };
    console.log(host,path);
    if ( ssl ) {
        https.request(options,function(response) {
            response.on('data', function(c) { str += c; });
            response.on('end', function() { SendPostCode(ws,str); }); //ws.send(JSON.stringify(['WSR',str,options,selected])); });
        }).end();
    } else {
        http.request(options,function(response) {
            response.on('data', function(c) { str += c; });
            response.on('end', function() {  SendPostCode(ws,str); }); //ws.send(JSON.stringify(['WSR',str,options,selected])); });
        }).end();
    }
}

function SendPostCode(ws,str) {
    var i = str.indexOf('<postcode>');
    str = str.substring(i+10,i+20);
    str = str.substring(0,str.indexOf("<"));
    ws.send(JSON.stringify(['HPC',str]));
}

function WebServiceConnect(ws,host,path,query,method,selected) {
//if ( typeof query == 'object' ) { query = createXML(query); return; }
//if ( method == 'PUT' ) { query = JSON.stringify(query); }
console.log("Host/Path is ",method,host+path)
console.log("Query",query);

var ssl = false;
var a;
    if ( method == 'GET' && query ) { path = path + '?' + toJSONhttp(query); }
    if ( host.substring(0,8) == 'https://' ) { host = host.substring(8,host.length); ssl = true; }
    if ( host.substring(0,7) == 'http://' ) { host = host.substring(7,host.length); }
var str = "";

var options = {
    host: host,
    path: path,
    Accept: '*/*',
    headers: { 'Content-Type':'application-json' },
    method: method
};

    if ( method == 'POST' && typeof query == 'string' ) {
        var Q = query.split("&");
        var NQ = {};
        for ( var i = 0; i < Q.length; i++ ) { var Q1 = Q[i].split('='); NQ[Q1[0]] = Q1[1]; }
        query = JSON.stringify(NQ);
        options.headers = { 'Connection': 'Keep-Alive', 'Accept': 'application/JSON', 'Expect': '100-continue', 'Content-Type': 'application/JSON; charset=utf-8', 'Content-Length': query.length }
    }

    if ( method == 'POST' && typeof query == 'object' ) {
        query = JSON.stringify(query);
        options.headers = { 'Connection': 'Keep-Alive', 'Accept': 'application/JSON', 'Expect': '100-continue', 'Content-Type': 'application/JSON; charset=utf-8', 'Content-Length': query.length }
    }
    console.log("Host/Path is ",method,host+path);
    console.log("Query is ",query);
    console.log("headers are",options.headers);
    if ( ssl ) {
        var req = https.request(options,function(response) {
        response.on('data', function(c) { str += c; });
        response.on('end', function() { downselect(ws,str,options,selected); });
        });
        req.on('error', function(e) { console.log(Date(),"hhtps reports Error :", e.message); console.log(options.headers); });
    } else {
        var req = http.request(options,function(response) {
            response.on('data', function(c) { str += c;  });
            response.on('end', function() {  downselect(ws,str,options,selected); });
        });
        req.on('error', function(e) { console.log(Date(),"hhtp reports Error :", e.message); console.log(options.headers); });
    }
    if ( method == 'POST' || method == 'PUT' ) { req.write(query); req.end(); } else { req.end(); }
}

function createXML (oObjTree) {
    function loadObjTree (oParentEl, oParentObj) {
        var vValue, oChild;
        if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
            oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
            if (oParentObj === oParentObj.valueOf()) { return; }
        } else if (oParentObj.constructor === Date) {
            oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toGMTString()));
        }
        for (var sName in oParentObj) {
            if (isFinite(sName)) { continue; } /* verbosity level is 0 */
            vValue = oParentObj[sName];
            if (sName === "keyValue") {
                if (vValue !== null && vValue !== true) { oParentEl.appendChild(oNewDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
            } else if (sName === "keyAttributes") { /* verbosity level is 3 */
                for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
            } else if (sName.charAt(0) === "@") {
                oParentEl.setAttribute(sName.slice(1), vValue);
            } else if (vValue.constructor === Array) {
                for (var nItem = 0; nItem < vValue.length; nItem++) {
                    oChild = oNewDoc.createElement(sName);
                    loadObjTree(oChild, vValue[nItem]);
                    oParentEl.appendChild(oChild);
                }
            } else {
                oChild = oNewDoc.createElement(sName);
                if (vValue instanceof Object) {
                    loadObjTree(oChild, vValue);
                } else if (vValue !== null && vValue !== true) {
                    oChild.appendChild(oNewDoc.createTextNode(vValue.toString()));
                }
                oParentEl.appendChild(oChild);
            }
        }
    }
    const oNewDoc = document.implementation.createDocument("", "", null);
    loadObjTree(oNewDoc, oObjTree);
    return oNewDoc;
}

function distance(lat1, lon1, lat2, lon2) {

    var R = 3959; // Radius of the earth in miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat)/2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

function convert24to12(stringtime) {
    var time = parseInt(stringtime);
    var hours = parseInt(time / 100);
    var minutes = parseInt((time/100) - hours);
    if ( minutes < 10 ) { minutes = '0'+minutes; }
    if ( hours > 11 ) { var AMPM = 'pm'; } else { var AMPM = 'am'; }
    hours = hours%12;
    return hours+":"+minutes+AMPM;

}

function downselect(ws,string,options,selected) {

    console.log(string.substring(0,500));

    if ( options.host == 'maps.googleapis.com' && options.path.indexOf('/nearbysearch/') > -1 ) {
        //console.log(options);
        var latlong = options.path; latlong = latlong.substring(latlong.indexOf('location=')+9,latlong.length); latlong = latlong.substring(0,latlong.indexOf("&")).split(","); var lat = latlong[0]; var long = latlong[1];
        var data = JSON.parse(string);
        var newData = [];
        if ( !data.results ) { return; }
        for ( var i = 0; i < data.results.length; i++) {
            var dist = parseFloat(distance(lat,long,data.results[i].geometry.location.lat,data.results[i].geometry.location.lng).toFixed(2));
            newData.push({ name: data.results[i].name, lat:data.results[i].geometry.location.lat, long: data.results[i].geometry.location.lng, address: data.results[i].vicinity, distance: dist, place_id:data.results[i].place_id });
        }
        newData.sort(function(a,b) { if ( a.distance < b.distance ) { return -1 } if ( a.distance > b.distance ) { return 1 } return 0 });
        ws.send(JSON.stringify(['WSR',"",options,newData]));
        return;
    }

    if ( options.host == 'maps.googleapis.com' && options.path.indexOf('/details/') > -1 ) {
        data = JSON.parse(string);
        var newData = {};
        if ( !data.result ) { return; }
        newData['place_id'] = data.result['place_id'];
        newData['website'] = data.result['website'];
        newData['phone'] = data.result['formatted_phone_number'];
        var opening = [];
        if ( data.result['opening_hours'] ) {
            newData['open_now'] = data.result['opening_hours']['open_now'];
            for ( var i = 0; i < data.result['opening_hours'].periods.length; i++ ) {
                data.result['opening_hours'].periods[i].close = data.result['opening_hours'].periods[i].close || {};
                data.result['opening_hours'].periods[i].open = data.result['opening_hours'].periods[i].open || {};
                opening[data.result['opening_hours'].periods[i].close.day] = { open: convert24to12(data.result['opening_hours'].periods[i].open.time), close: convert24to12(data.result['opening_hours'].periods[i].close.time)  }
            }
        }
        newData['hours'] = opening;
        if ( data.result.photos  ) {
            newData['photos'] = data.result.photos.length;
            for ( var i = 0; i < data.result.photos.length; i++ ) {
                var PhotoOptions = { url: 'https://maps.googleapis.com', resource:'/maps/api/place/photo' };
                if ( data.result.photos[i].html_attributions.length == 0 ) {
                    PhotoOptions.query = 'maxwidth=800&photoreference='+data.result.photos[i].photo_reference+'&key=AIzaSyBA3ffK6HhJPpXdGngbCxsAhul4hrrZ-KY';
                    WebServiceConnect(ws,PhotoOptions.url,PhotoOptions.resource,PhotoOptions.query);
                }
            }
        }
        ws.send(JSON.stringify(['WSR',"",options,newData]));
        return;
    }

    if ( string.length == 0 ) { console.log("we have a problem",options); return; }
    if ( !selected ) { ws.send(JSON.stringify(['WSR',string,options,selected])); return; }
    if ( string.substring(0,6) == '<HTML>' || string.substring(0,6) =='<html>' ) { console.log("***************  ******* HTML returned");  ws.send(JSON.stringify(['WSR',string,options,selected])); return; }
    if ( string.indexOf('<h1>Developer Over Rate</h1>') > -1 ) { console.log("Developer Limits exceeded"); return; }
    if ( string.indexOf("<?xml version") > -1 || string.indexOf('xmlns=') > -1 ) {
        var parser = new DOMParser();

        var data = xmlToJSON(parser.parseFromString(string,'text/xml'));
        console.log("XML was returned");
        //console.log(string);
        //for ( var kk = 0; kk < data.response.listing.length; kk++ ) { console.log(data.response.listing[kk]['floor_plan']); console.log(data.response.listing[kk]['displayable_address']);}
    }
    else {
        //console.log("JSON was returned,data");
        var data = JSON.parse(string);
    }
    if ( data.response && data.response.disambiguation ) { ws.send(JSON.stringify(["WSR","",options,data.response])); return; }  //for ( var i = 0; i < data.response.disambiguation.length; i++ ) { console.log("DisAm",data.response.disambiguation[i]);  } return; }

    if ( data.response && data.response.error_code ) { ws.send(JSON.stringify(["WSR","",options,data.response])); return; }
    
    console.log("507",selected);
    console.log("508",data);
    for (s in selected) {
        var B = s.split(",");
        var DO = JSON.parse(JSON.stringify(data));
        selected[s] = {};
        for ( var b = 0; b < B.length; b++ ) {
            if ( B[b+1] == '0' && !Array.isArray(DO[B[b]])) { selected[s] = buildONEarr(DO[B[b]],b,B); break; }

            if ( Array.isArray(DO[B[b]]) ) { selected[s] = buildObj(DO[B[b]],b,B); break; } else { selected[s][B[b]] = DO[B[b]]; selected[s] = selected[s][B[b]]; DO = DO[B[b]]; } }
    }

    for ( a in selected ) { if ( DO['result_count'] ) { var count = DO['result_count']['#text'] }; ws.send(JSON.stringify(['WSR',"",options,selected,count])); return; }
      console.log("520",data);
    ws.send(JSON.stringify(['WSR',"",options,data,count]));
}

function buildONEarr(data,index,Arr) {
    var returnArr = [];
    for ( var a = index+2; a < Arr.length; a++ ) { if ( typeof data == 'undefined' ) { console.log("Got An undefined BuildONE"); return returnArr; } data = data[Arr[a]]; }
    returnArr.push(data.toString());
    return returnArr;
}

function buildObj(data,index,Arr) {
    var returnArr = [];
    for ( var i = 0; i < data.length; i++) {
        var newObj = data[i];
        for ( var a = index+2; a < Arr.length; a++ ) {
            if ( data[i].hasOwnProperty(Arr[a]) ) { newObj[Arr[a]] = data[i][Arr[a]]; data[i] = data[i][Arr[a]]; newObj = newObj[Arr[a]]; }
            else { if ( Array.isArray(data[i]) && data[i][0].hasOwnProperty(Arr[a]) ) { newObj = []; for ( var kk = 0; kk < data[i].length; kk++ ) { newObj.push(data[i][kk][Arr[a]]); } } else {  newObj = ""; } };
        }
        returnArr.push(newObj);
    }
    return returnArr;
}

function xmlToJSON(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            //obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                //obj["@attributes"][attribute.nodeName] = attribute.nodeValue; //
                obj[attribute.nodeName] = attribute.value; //
            }
        }
    }
    else if (xml.nodeType == 3) { // text
        var text = xml.nodeValue;
        //console.log(":"+text+":"+text.charCodeAt(0));
        if ( text.charCodeAt(0) != 10 && text.charCodeAt(0) != 32 ) { obj = xml.nodeValue; }
        else { if ( text.length == 1 ||  text.charCodeAt(1) == 10 && text.substring(2,text.length) == WhiteSpace.substring(2,text.length) ) { return; }
        else { obj = text; }
        }
    }

    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJSON(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJSON(item));
            }
        }
    }
    //console.log(obj);
    return obj;
}

function toJSONhttp(Obj) {
    if ( typeof  Obj == 'string' ) { return Obj; }
    var p = [];
    var n,v;
    for ( n in Obj ) { v = Obj[n].toString(); p.push(n + "=" + v); }
    return p.join("&").replace(/%20/g,"+")
}

// Changes XML to JSON
function xmlToJSON(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            //obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                //obj["@attributes"][attribute.nodeName] = attribute.nodeValue; //
                obj[attribute.nodeName] = attribute.value; //
            }
        }
    }
    else if (xml.nodeType == 3) { // text
        if (xml.nodeValue.charCodeAt(0) != 10) { obj = xml.nodeValue;
        } else { if ( xml.nodeValue.indexOf("e") > -1 || xml.nodeValue.indexOf("a") > -1 ) { alert("Oh No!!"); } return; }
    }

    // do children
    if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJSON(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJSON(item));
            }
        }
    }
    return obj;
}


options.production = false;
options.gateway = 'gateway.sandbox.push.apple.com';
options.port = 2195;
options.errorCallback = function(error) { console.log("errorCallback ",error); };

var appConnection = new apn.Connection(options);

appConnection.on('error', function(error) { console.log("error",error);},true);
appConnection.on('socketError', function(socketError) { console.log("socket error",socketError); });
appConnection.on('cacheTooSmall', function(cacheTooSmall){ console.log("cacheTooSmall",cacheTooSmall); });
appConnection.on('transmissionError',function(errorCode,notification,device) { console.log("transmissionError",errorCode,notification,device);});

appConnection.on('connected', function(connected) { console.log("connected",connected); });
appConnection.on('transmitted', function(transmitted) { console.log("transmitted",transmitted); });
appConnection.on('disconnected', function() { console.log("disconnected");});

function SendNotification(DeviceID,Message,Badge,Sound,AddData) {


var note = new apn.Notification();
var myDevice = new apn.Device(DeviceID);
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.alert = Message;
    if ( Sound.length > 0 ) { note.sound = Sound; }
    if ( Badge.length > 0 ) { note.badge = parseInt(Badge); }
    if ( AddData != null )  { note.payload = AddData; }
    console.log('My AddData',AddData);
    appConnection.pushNotification(note,myDevice);
}

function SendMessage(ws,message) {
if ( JSON.parse(message)[0] == 'ULF' ) { var R = JSON.parse(message); if ( R[2].length > 50 ) { fs.writeFile('img/'+R[1]+'.png',R[2].substring(22,R[2].length),'base64'); SendMessage("",JSON.stringify(['DUN',R[1],'img/'+R[1]+'.png'])); }; return; } // fs.writeFile(R[1],atob(R[2]), function(e) { console.log('Was there an error',e) });
  for (k=0;k<Traffic.length;k++) {

      if (Traffic[k].id != ws.id && Traffic[k].id.length > 0 && Traffic[k].readyState == '1' ) { Traffic[k].send(message); VolMessages = VolMessages + 1; console.log(":"+Traffic[k].id+":",VolMessages,message.length,message.substring(0,100)); };

  };

};

function wsRemove(faultyconnection) {

    for (k=0;k<Traffic.length;k++) {

      if (Traffic[k].id == faultyconnection ) { Traffic[k].id = ""; console.log("Removed :" + faultyconnection); return; };

    };

};

function MD5(string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}
