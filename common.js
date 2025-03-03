const { Client } = require("pg");

// Initialize the pg client with the database URL (default is 'postgres://localhost/watches2_db')
const client = new Client(
  process.env.DATABASE_URL || "postgres://localhost/watches2_db"
);

// Export the client so that it can be used in other files (like in your seed script)
module.exports = { client };

// const { Client } = require("pg");
// const pg = require("pg");

// const client = new pg.Client(
//   process.env.DATABASE_URL || "postgres://localhost/watches2_db"
// );

// module.exports = { express, client };
