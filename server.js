// Run the code: node server.js

const http = require('http');
const port = 1337;
const mysql = require('mysql');
const { stringify } = require('querystring');
const connection = mysql.createConnection({
    host     : 'sql3.freesqldatabase.com',
    user     : 'sql3643696',
    password : 'PiRwG3wfKP',
    database : 'sql3643696'
  });

connection.connect();

const label = 'Dr. Bob\'s Network API';

const requestListener = function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me");
    // res.writeHead(200);

    let body = '';
    req.on('data', (chunk) => {body += chunk});        
    console.log('Recieved a request: ' + req.url);
    switch(req.url) {
    case "/network":
        req.on('end', () => {
            try{
                connection.query(
                    'SELECT * FROM Industry ', function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
   
    default:
        res.write(label, function(err) {res.end();})
  } 
}

const server = http.createServer(requestListener);
console.log(`Express server listening on port ` + port);

server.listen(port);

// create table BACKORDER (ID int not null PRIMARY KEY auto_increment, Name varchar(255) not null, PurchasePrice varchar(7) )
// create table FAMILY (ID int not null PRIMARY KEY auto_increment, Name varchar(255) not null, Date char(10) not null, SalePrice varchar(7), PurchasePrice varchar(7), Products varchar(255))
// create table EXPIRYUPDATE (ID int not null PRIMARY KEY auto_increment, Date char(10) not null)
// alter table monthly drop column gst
// update monthly set salerevenue = salerevenue + visitrevenue
// alter table monthly drop column visitrevenue