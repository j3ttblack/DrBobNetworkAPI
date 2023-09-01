// Run the code: node server.js

const http = require('http');
const port = 1100;
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
    case "/backorder/add":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                let ended = false;
                obj.forEach(product => {
                    for(let i = 0; i < product.count && !ended; i++) {
                        try{
                            connection.query('INSERT INTO Backorder (Name, PurchasePrice) VALUES (\'' + 
                            product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + product.purchasePrice.toString() + '\')')
                        } catch(error) {
                            res.end();
                            ended = true;
                        }
                    }
                });
            }
        });
        break;
    case "/backorder/get":
        req.on('end', () => {
            try{
                connection.query(
                    'SELECT Name AS name, PurchasePrice AS purchasePrice FROM Backorder ', function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
    case "/backorder/transfer":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                let ended = false;
                let currentDate = new Date();
                obj.forEach(product => {
                    for(let i = 0; i < product.count && !ended; i++) {
                        let expired = new Date(product.expiryDate) < currentDate ? '1' : '0';
                        try{
                            connection.query('INSERT INTO Bottle (Name, PurchasePrice, Expired, Used, Open, ExpiryDate) VALUES (\'' + 
                            product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + product.purchasePrice.toString() + '\',' + 
                            expired + ',0,0,\'' + product.expiryDate + '\')'
                            )
                        } catch(error) {
                            res.end();
                            ended = true;
                        }
                    }
                });
            }
        });
        break;
    case "/backorder/delete":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                let ended = false;
                obj.forEach(product => {
                    if(!ended){
                        try{
                            connection.query('DELETE FROM Backorder WHERE Name = \'' + product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\'');
                        } catch(error) {
                            res.end();
                            ended = true;
                        }
                    }
                });
            }
        });
        break;
    case "/bottles":
        req.on('end', () => {
            try{
                connection.query(
                    'select ' + 
                        'p.Name as name, ' +
                        'p.RetailPrice as retailPrice, ' +
                        'CASE WHEN b.Open IS NOT NULL THEN b.Open ELSE 0 END as open, ' +
                        'b.Expired as expired, ' + 
                        'CASE WHEN b.Used IS NOT NULL THEN b.Used ELSE 0 END as used, ' +
                        'CASE WHEN b.ExpiryDate IS NOT NULL THEN b.ExpiryDate ELSE \'0000/00/00\' END as expiryDate, ' +
                        'CASE WHEN b.PurchasePrice IS NOT NULL THEN ROUND(b.PurchasePrice,2) ELSE \'0.00\' END as purchasePrice ' +
                    'from Product p '+ 
                        'left JOIN Bottle b ON p.Name = b.Name ', function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
    case "/bottles/open":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                try {
                    connection.query('UPDATE BOTTLE AS b INNER JOIN (SELECT MIN(b.id) AS id FROM Bottle b, (SELECT MIN(ExpiryDate) AS mindate, Name FROM Bottle WHERE Name = \'' + obj.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' AND Open = 0 AND Used = 0 GROUP BY Name) AS b2 WHERE b.ExpiryDate = b2.mindate AND b.Name = b2.Name AND b.Open = 0 AND b.Used = 0 GROUP BY b.Name) AS b2 ON b.id = b2.id SET b.Open = 1');
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/bottles/finish":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                try {
                    connection.query('UPDATE Bottle AS b INNER JOIN (SELECT MIN(b.id) AS id FROM Bottle b WHERE b.Open = 1 AND b.Used = 0 AND b.Name = \'' + obj.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' GROUP BY b.Name) AS b2 ON b.id = b2.id SET b.Used = 1');
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/bottles/use":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                let ended = false;
                obj.forEach(product => {
                    if(!ended) {
                        if(product.sellExpired) {
                            try {
                                connection.query('UPDATE Bottle AS b INNER JOIN (SELECT id FROM Bottle WHERE Name = \'' + product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' AND Open = 0 AND Used = 0 ORDER BY ExpiryDate LIMIT ' + product.sellCount + ') AS b2 ON b.id = b2.id SET b.Used = 1');
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        } else {
                            try {
                                connection.query('UPDATE Bottle AS b INNER JOIN (SELECT id FROM Bottle WHERE Name = \'' + product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' AND Open = 0 AND Used = 0 AND Expired = 0 ORDER BY ExpiryDate LIMIT ' + product.sellCount + ') AS b2 ON b.id = b2.id SET b.Used = 1');
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        }
                    }
                });
            }
        });
        break;
    case "/bottles/delete":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                let ended = false;
                obj.forEach(product => {
                    if(!ended) {
                        if(product.sellExpired) {
                            try {
                                connection.query('DELETE b FROM Bottle AS b INNER JOIN (SELECT id FROM Bottle WHERE Name = \'' + product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' AND Open = 0 AND Used = 0 ORDER BY ExpiryDate LIMIT ' + product.sellCount + ') AS b2 ON b.id = b2.id WHERE b2.id IS NOT NULL');
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        } else {
                            try {
                                connection.query('DELETE b FROM Bottle AS b INNER JOIN (SELECT id FROM Bottle WHERE Name = \'' + product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' AND Open = 0 AND Used = 0 AND Expired = 0 ORDER BY ExpiryDate LIMIT ' + product.sellCount + ') AS b2 ON b.id = b2.id WHERE b2.id IS NOT NULL');
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        }
                    }
                });
            }
        });
        break;
    case "/bottles/delete/all":
        try{
            connection.query('DELETE FROM Bottle WHERE Used = 1');
        } catch(error) {
            res.end();
        }
    case "/expiryupdate/get":
        req.on('end', () => {
            try{
                connection.query(
                    'SELECT MAX(Date) AS lastDate FROM ExpiryUpdate ', function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
    case "/expiryupdate/update":
        req.on('end', () => {
            let ended = false;
            let currentDate = new Date().toISOString().slice(0,10).replace(/-/g,"/");
            
            try{
                connection.query('UPDATE Bottle SET Expired = 1 WHERE Expired = 0 AND ExpiryDate < \'' + currentDate + '\'')
            } catch(error) {
                res.end();
                ended = true;
            }

            if(!ended) {
                try{
                    connection.query('INSERT INTO ExpiryUpdate (Date) VALUES (\'' + currentDate + '\')' )
                } catch (error) {
                    res.end();
                }
            }
        });
        break;
    case "/products":
        req.on('end', () => {
            try{
                connection.query(
                    'select Name as name, RetailPrice as retailPrice from Product p ', function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
    case "/products/add":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                let ended = false;
                let currentDate = new Date();
                obj.forEach(product => {
                    if(product.isNewProduct && !ended) {
                        try {
                            connection.query('INSERT INTO Product (Name, RetailPrice) VALUES (\'' + 
                            product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + 
                            product.retailPrice.toString().replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\')');
                        } catch(error) {
                            res.end();
                            ended = true;
                        }
                    }
                
                    for(let i = 0; i < product.count && !ended; i++) {
                        let expired = new Date(product.expiryDate) < currentDate ? '1' : '0';
                        try{
                            connection.query('INSERT INTO Bottle (Name, PurchasePrice, Expired, Used, Open, ExpiryDate) VALUES (\'' + 
                            product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + product.purchasePrice.toString() + '\',' + 
                            expired + ',0,0,\'' + product.expiryDate + '\')'
                            )
                        } catch(error) {
                            res.end();
                            ended = true;
                        }
                    }
                });
            }
        });
        break;
    case "/products/update":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                let ended = false;
                obj.forEach(product => {
                   
                    if(!ended) {
                        if(product.name != product.originalName) {
                            try {
                                connection.query('INSERT INTO Product (Name, RetailPrice) VALUES (\'' + 
                                product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + 
                                product.retailPrice + '\')', function(err, results) {
                                    try {
                                        connection.query('UPDATE Bottle SET Name =  \'' + 
                                        product.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\' WHERE Name = \'' + 
                                        product.originalName.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\'', function(err2, results2) {
                                            try {
                                                connection.query('DELETE FROM Product WHERE NAME = \'' + product.originalName.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\'');
                                            } catch(error) {
                                                res.end();
                                                ended = true;
                                            }
                                        });
                                    } catch(error) {
                                        res.end();
                                        ended = true;
                                    }
                                });
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        } else {
                            try {
                                connection.query('UPDATE Product SET RetailPrice = \'' + product.retailPrice +
                                '\' WHERE Name = \'' + product.originalName.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\'');
                            } catch(error) {
                                res.end();
                                ended = true;
                            }
                        }
                    }
                });
            }
        });
        break;
    case "/purchase":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                try {
                    connection.query('INSERT INTO Purchases (Date, PurchasePrice, GSTR) VALUES (\'' + 
                    obj.date + '\',\'' + obj.purchasePrice + '\',\'' + obj.gstr + '\')')
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/receipts":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                try {
                    connection.query('INSERT INTO Receipts (ClientName, Date, SalePrice, PurchasePrice, Products) VALUES (\'' + 
                    obj.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + obj.date + '\',\'' + obj.salePrice + '\',\'' + 
                    obj.purchasePrice + '\',\'' + obj.products.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\')')
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/family":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                // Try and find the appropriate fields with data, retrieve data
                try {
                    connection.query('INSERT INTO Family (Name, Date, SalePrice, PurchasePrice, Products) VALUES (\'' + 
                    obj.name.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\',\'' + obj.date + '\',\'' + obj.salePrice + '\',\'' + 
                    obj.purchasePrice + '\',\'' + obj.products.replace(/\\/gi,'\\').replace(/'/gi, '\\\'') + '\')')
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/inventory":
        req.on('end', () => {
            try{
                connection.query(
                    'SELECT g1.Name AS name, g1.RetailPrice AS retailPrice, g1.AvgPurchasePrice AS avgPurchasePrice, g2.Count AS count, g2.CountValue AS countValue, g3.Expired AS expired, g3.ExpiredValue AS expiredValue, g4.Open AS open, g4.OpenValue AS openValue ' +
                    'FROM (' + 
                        'SELECT p.Name AS Name, p.RetailPrice AS RetailPrice, AVG(b.PurchasePrice) AS AvgPurchasePrice FROM Product p LEFT JOIN Bottle b ON p.Name = b.Name GROUP BY p.Name' +
                    ') AS g1 LEFT JOIN (' +
                        'SELECT p.Name AS Name, COUNT(b.ID) AS Count, CASE WHEN SUM(b.PurchasePrice) IS NULL THEN 0 ELSE SUM(b.PurchasePrice) END AS CountValue FROM Product p LEFT JOIN (' +
                            'SELECT ID, Name, PurchasePrice FROM Bottle WHERE Used = 0 AND Expired = 0 AND Open = 0) ' + 
                        'AS b ON p.Name = b.Name GROUP BY p.Name' +
                    ') AS g2 ON g1.Name = g2.Name LEFT JOIN (' +
                        'SELECT p.Name AS Name, COUNT(b.ID) AS Expired, CASE WHEN SUM(b.PurchasePrice) IS NULL THEN 0 ELSE SUM(b.PurchasePrice) END AS ExpiredValue FROM Product p LEFT JOIN (' + 
                            'SELECT ID, Name, PurchasePrice FROM Bottle WHERE Used = 0 AND Expired = 1) ' +
                        'AS b ON p.Name = b.Name GROUP BY p.Name' +
                    ') AS g3 ON g1.Name = g3.Name LEFT JOIN (' +
                        'SELECT p.Name, COUNT(b.ID) AS Open, CASE WHEN SUM(b.PurchasePrice) IS NULL THEN 0 ELSE SUM(b.PurchasePrice) END AS OpenValue FROM Product p LEFT JOIN (' + 
                            'SELECT ID, Name, PurchasePrice FROM Bottle WHERE Used = 0 AND Expired = 0 AND Open = 1) ' +
                        'AS b ON p.Name = b.Name GROUP BY p.Name' +
                    ') AS g4 ON g1.Name = g4.Name', 
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });
            } catch(error) { res.end();}
        });
        break;
    case "/report/sales":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT ClientName AS clientName, Date AS date, SalePrice AS salePrice, PurchasePrice AS purchasePrice, Products AS products FROM Receipts ' +
                        'WHERE Date >= \'' + body + '\' AND Date < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/purchases":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT Date AS date, PurchasePrice AS purchasePrice, GSTR AS gstr FROM Purchases ' +
                        'WHERE Date >= \'' + body + '\' AND Date < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/expired":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT Name AS name, ExpiryDate AS expiryDate, PurchasePrice AS purchasePrice FROM Bottle ' +
                        'WHERE ExpiryDate >= \'' + body + '\' AND ExpiryDate < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/personal":
        req.on('end', () => {
            try {
                connection.query(
                    'SELECT Name AS name, COUNT(ID) AS count, SUM(PurchasePrice) AS purchasePrice FROM Bottle WHERE Used = 1 AND Expired = 0 GROUP BY Name',
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });                
            } catch(error) {
                res.end();
            }
        });
        break;
    case "/report/family":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT Name AS name, Date AS date, Products AS products FROM Family ' +
                        'WHERE Date >= \'' + body + '\' AND Date < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/monthly":
        req.on('end', () => {
            try {
                connection.query(
                    'SELECT Month AS month, InventoryValue as inventoryValue, GSTR as gstr, SaleRevenue as saleRevenue, ExpiredValue as expiredValue, UsedValue as usedValue FROM Monthly',
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });                
            } catch(error) {
                res.end();
            }
        });
        break;
    case "/report/monthly/recent":
        req.on('end', () => {
            try {
                connection.query(
                    'SELECT Max(Month) AS recentMonth FROM Monthly',
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });                
            } catch(error) {
                res.end();
            }
        });
        break;
    case "/report/monthly/inventory":
        req.on('end', () => {
            try {
                connection.query(
                    'SELECT SUM(PurchasePrice) AS totalValue FROM Bottle WHERE Open = 0 AND Expired = 0 AND Used = 0',
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });                
            } catch(error) {
                res.end();
            }
        });
        break;
    case "/report/monthly/gst":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT SUM(GSTR) AS gstr FROM Purchases ' +
                        'WHERE Date >= \'' + body + '\' AND Date < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/monthly/sales":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT SUM(SalePrice) - SUM(PurchasePrice) AS saleRevenue FROM Receipts ' +
                        'WHERE Date >= \'' + body + '\' AND Date < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/monthly/expired":
        req.on('end', () => {
            if(body) {
                // Try and find the appropriate fields with data, retrieve data
                this.tempDate = new Date(body);
                this.tempDate.setMonth(this.tempDate.getMonth() + 1);
                this.tempDate = this.tempDate.toISOString().slice(0,10).replace(/-/g,"/")
                try {
                    connection.query(
                        'SELECT SUM(PurchasePrice) AS expiredCost FROM Bottle ' +
                        'WHERE ExpiryDate >= \'' + body + '\' AND ExpiryDate < \'' + this.tempDate + '\'', 
                        function(err, results) {
                        if(err) throw err;
                        if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                        else res.write(JSON.stringify(results), function(err) {res.end();});
                    });                
                } catch(error) {
                    res.end();
                }
            }
        });
        break;
    case "/report/monthly/used":
        req.on('end', () => {
            try {
                connection.query(
                    'SELECT SUM(PurchasePrice) AS usedCost FROM Bottle WHERE Used = 1',
                    function(err, results) {
                    if(err) throw err;
                    if(results == null || results.length == 0) res.write('null', function(err) {res.end();})
                    else res.write(JSON.stringify(results), function(err) {res.end();});
                });                
            } catch(error) {
                res.end();
            }
        });
        break;
    case "/monthly/insert":
        req.on('end', () => {
            let obj;
            let isJSON = false;

            // Try to convert the input message to a JSON object -> if failure, it stems from an external command
            try{
                obj = JSON.parse(body);
                isJSON = true;
            } catch(error) {
                res.end();
            }

            if(isJSON) {
                try{
                    connection.query('INSERT INTO Monthly (Month, InventoryValue, GSTR, SaleRevenue, ExpiredValue, UsedValue) VALUES (\'' + 
                    obj.month + '\',\'' + obj.inventoryValue + '\',\'' + obj.gstr + '\',\'' + obj.saleRevenue + '\',\'' + 
                    obj.expiredValue + '\',\'' + obj.usedValue + '\')')
                } catch(error) {
                    res.end();
                }
            }
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