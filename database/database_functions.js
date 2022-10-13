const { Pool } = require('pg');
var dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.dbport,
  max: 3, // set pool max size to 10
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000,
});


exports.user_db_functions = {
  // register new user
  addNewUser: (user) => {
    return new Promise((resolve, reject) => {
      pool.query('INSERT INTO users (username, password_hash) values($1, $2)', [user.username, user.password_hash], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  },

  // gets single user from database with according username
  getUser: (username) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  },

}