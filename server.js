const express = require('express');         // enables server hosting
const mysql = require('mysql');             // enables access to sql
const bodyParser = require('body-parser');  // enables parsing and reading request body
const cors = require('cors');               // enables cross-axis policy changes
const production = false;

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
app.use(cors());

// Middleware inspector, logs all information
if (production) {
  app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Request Params:', req.params);
    next();
  });
}

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
app.get('/:parameter', (req, res) => {

  // Get the table
  let tableName = getTable(req.path);
  if(!tableName) {
    console.log('table name not found')
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
app.post('/:parameter', (req, res) => {
  // Access the request body
  const requestBody = req.body;

  // Get the table
  const tableName = getTable(req.path);
  if (!tableName) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

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

// All put (update) requests
app.put('/:table/:id', (req, res) => {
  // Access the request body
  const requestBody = req.body;

  // Split the path to extract the table name and ID
  const pathParts = req.path.split('/');
  if (pathParts.length !== 3) {
    res.status(404).json({ error: 'Invalid URL' });
    return;
  }

  const [, tableName, id] = pathParts;

  // Get the table
  const normalizedTableName = getTable('/' + tableName);
  if (!normalizedTableName) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  // Build the UPDATE SQL statement dynamically
  const sql = `UPDATE ${normalizedTableName} SET ? WHERE id = ?`;

  // Execute the query to update data
  db.query(sql, [requestBody, id], (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Check if any rows were affected to determine if the update was successful
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Resource not found' });
      } else {
        // If the update is successful, you can send a success response
        res.json({ message: 'Data updated successfully', updatedData: requestBody });
      }
    }
  });
});

// All delete requests
app.delete('/:table/:id1/:id2', (req, res) => {
  // Split the path to extract the table name and ID
  const pathParts = req.path.split('/');
  if (pathParts.length !== 4) {
    res.status(404).json({ error: 'Invalid URL' });
    return;
  }

  const [, tableName, id1, id2] = pathParts;

  // Get the table
  const normalizedTableName = getTable('/' + tableName);
  if (!normalizedTableName || normalizedTableName != 'Connection') {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  // Build the DELETE SQL statement dynamically
  const sql = `DELETE FROM ${normalizedTableName} WHERE person_id_1 = ? AND person_id_2 = ?`;

  // Execute the query to delete data
  db.query(sql, [id1, id2], (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Check if any rows were affected to determine if the delete was successful
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Resource not found' });
      } else {
        // If the delete is successful, you can send a success response
        res.json({ message: 'Data deleted successfully' });
      }
    }
  });
})

app.delete('/:table/:id', (req, res) => {
  // Split the path to extract the table name and ID
  const pathParts = req.path.split('/');
  if (pathParts.length !== 3) {
    res.status(404).json({ error: 'Invalid URL' });
    return;
  }

  const [, tableName, id] = pathParts;

  // Get the table
  const normalizedTableName = getTable('/' + tableName);
  if (!normalizedTableName) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  // Build the DELETE SQL statement dynamically
  const sql = `DELETE FROM ${normalizedTableName} WHERE id = ?`;

  // Execute the query to delete data
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Check if any rows were affected to determine if the delete was successful
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Resource not found' });
      } else {
        // If the delete is successful, you can send a success response
        res.json({ message: 'Data deleted successfully' });
      }
    }
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
