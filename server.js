const express = require('express');
const mysql = require('mysql');

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
const port = process.env.PORT || 3000;

// Define a simple API endpoint
app.get('/', (req, res) => {
  // Example query to retrieve data from a table
  db.query('SELECT * FROM Industry', (error, results, fields) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
