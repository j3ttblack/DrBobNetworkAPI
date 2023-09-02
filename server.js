const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create a MySQL database connection
const db = mysql.createConnection({
  host: 'sql3.freesqldatabase.com',
  user: 'sql3643696',
  password: 'PiRwG3wfKP',
  database: 'sql3643696',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

/**
 * This function adds two numbers and returns the result.
 * @param {string} path - the route path of a request, in the form '/path'
 * @returns {string} - The name of the table to connect to
 */
function getTable(path) {
  let tableName;
  switch (path) {
    case '/industry':
      tableName = 'Industry';
      break;
    case '/person':
      tableName = 'Person';
      break;
    case '/connection':
      tableName = 'Connection';
      break;
  }
  return tableName
}

// All get requests
app.get('/', (req, res) => {

  // Get the table
  let tableName = getTable(req.path);
  if(!tableName) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // Build the SQL statement dynamically
  const sql = `SELECT * FROM ${tableName}`;

  // Execute the query
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// All post (insert) requests
app.post('/', (req, res) => {

  // Access the request body
  const requestBody = req.body;

  // Get the table
  const tableName = getTable(req.path);
  if (!tableName) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  for (var item in requestBody) {
    console.log(item);
  }
  return;

  // Build the INSERT SQL statement dynamically
  const sql = `INSERT INTO ${tableName} SET ?`; // Assuming you are inserting an object

  // Execute the query to insert data
  db.query(sql, requestBody, (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // If the insertion is successful, you can send a success response
      res.json({ message: 'Data inserted successfully', insertedData: requestBody });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
