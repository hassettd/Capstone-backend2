import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

//working version
// const { Client } = require("pg");

// const client = new Client({
//   connectionString: process.env.DATABASE_URL, // Make sure this is set correctly
// });

// module.exports = { client };

// const { PrismaClient } = require("@prisma/client");

// // Initialize the pg client with the database URL (default is 'postgres://localhost/watches2_db')
// const prisma = new PrismaClient();

// // Export the client so that it can be used in other files (like in your seed script)
// module.exports = { prisma };

// const { Client } = require("pg");
// const pg = require("pg");

// const client = new pg.Client(
//   process.env.DATABASE_URL || "postgres://localhost/watches2_db"
// );

// module.exports = { express, client };
