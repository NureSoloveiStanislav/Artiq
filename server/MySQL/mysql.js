const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "artiq_db",
  password: "password"
});

connection.connect((err) => {
  if (err) {
    return console.error("Error DB: " + err.message);
  }
  else{
    console.log("MySQL successfully connected");
  }
});

const promiseConnection = connection.promise();

module.exports = connection;