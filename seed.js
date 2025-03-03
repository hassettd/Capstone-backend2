const bcrypt = require("bcryptjs");
const { client } = require("./common"); // Importing client from common.js

// Seed function
const seed = async () => {
  try {
    await client.connect(); // Connect to the database

    // Hash the passwords before inserting them into the users table
    const hashedPasswords = await Promise.all([
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
      bcrypt.hash("password123", 10),
    ]);

    // SQL to drop tables if they exist, and recreate them
    const SQL = `
      -- Drop tables if they exist
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS watches CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;

      -- Create users table
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      -- Create watches table
      CREATE TABLE watches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL
      );

      -- Create reviews table
      CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        watch_id UUID REFERENCES watches(id) ON DELETE CASCADE,
        review_text TEXT,
        score INT CHECK (score >= 1 AND score <= 5),
        UNIQUE(user_id, watch_id)  -- Ensures a user can only leave one review per watch
      );

      -- Create comments table
      CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      -- Insert data into watches table
      INSERT INTO watches (id, name, brand, model)
      VALUES
        (gen_random_uuid(), 'Submariner', 'Rolex', 'Submariner 116610LN'),
        (gen_random_uuid(), 'Speedmaster', 'Omega', 'Speedmaster Professional'),
        (gen_random_uuid(), 'Royal Oak', 'Audemars Piguet', 'Royal Oak 15400'),
        (gen_random_uuid(), 'Patek Philippe Nautilus', 'Patek Philippe', 'Nautilus 5711'),
        (gen_random_uuid(), 'Seiko Presage', 'Seiko', 'Presage Cocktail Time'),
        (gen_random_uuid(), 'Omega Seamaster', 'Omega', 'Seamaster Diver 300M'),
        (gen_random_uuid(), 'Tag Heuer Monaco', 'Tag Heuer', 'Monaco Caliber 11'),
        (gen_random_uuid(), 'AP Royal Oak Offshore', 'Audemars Piguet', 'Royal Oak Offshore'),
        (gen_random_uuid(), 'Grand Seiko', 'Grand Seiko', 'SBGA413'),
        (gen_random_uuid(), 'Breitling Navitimer', 'Breitling', 'Navitimer 01');

      -- Insert data into users table (with hashed passwords)
      INSERT INTO users (id, username, email, password)
      VALUES
        (gen_random_uuid(), 'john_doe', 'john.doe@example.com', '${hashedPasswords[0]}'),
        (gen_random_uuid(), 'jane_doe', 'jane.doe@example.com', '${hashedPasswords[1]}'),
        (gen_random_uuid(), 'alice_smith', 'alice.smith@example.com', '${hashedPasswords[2]}'),
        (gen_random_uuid(), 'bob_johnson', 'bob.johnson@example.com', '${hashedPasswords[3]}'),
        (gen_random_uuid(), 'charlie_brown', 'charlie.brown@example.com', '${hashedPasswords[4]}'),
        (gen_random_uuid(), 'david_jones', 'david.jones@example.com', '${hashedPasswords[5]}'),
        (gen_random_uuid(), 'emma_davis', 'emma.davis@example.com', '${hashedPasswords[6]}'),
        (gen_random_uuid(), 'frank_miller', 'frank.miller@example.com', '${hashedPasswords[7]}'),
        (gen_random_uuid(), 'grace_wilson', 'grace.wilson@example.com', '${hashedPasswords[8]}'),
        (gen_random_uuid(), 'henry_moore', 'henry.moore@example.com', '${hashedPasswords[9]}');

      -- Insert data into reviews table
      INSERT INTO reviews (id, user_id, watch_id, review_text, score)
      VALUES
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM watches WHERE name = 'Submariner'), 'Great watch! Love the build quality and timeless design. Highly recommend.', 5),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'jane_doe'), (SELECT id FROM watches WHERE name = 'Speedmaster'), 'Iconic design, excellent accuracy, but the strap could be better. 4 stars.', 4),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'alice_smith'), (SELECT id FROM watches WHERE name = 'Royal Oak'), 'Classic style, but very expensive for what you get.', 3),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'bob_johnson'), (SELECT id FROM watches WHERE name = 'Nautilus'), 'Love the elegant design and craftsmanship, but a bit too flashy for my taste.', 4),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'charlie_brown'), (SELECT id FROM watches WHERE name = 'Seiko Presage'), 'Great value for money, looks stunning, but not as durable as I hoped.', 3),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'david_jones'), (SELECT id FROM watches WHERE name = 'Omega Seamaster'), 'Fantastic for diving, great durability, but a bit bulky for everyday wear.', 4),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'emma_davis'), (SELECT id FROM watches WHERE name = 'Tag Heuer Monaco'), 'Stylish and unique, but not as functional as I would like. 3 stars.', 3),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'frank_miller'), (SELECT id FROM watches WHERE name = 'AP Royal Oak Offshore'), 'Luxury at its finest! Looks amazing, but very expensive.', 5),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'grace_wilson'), (SELECT id FROM watches WHERE name = 'Grand Seiko'), 'Precision at its best, but the design is too understated for my preference.', 4),
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'henry_moore'), (SELECT id FROM watches WHERE name = 'Breitling Navitimer'), 'Great chronograph, but the size is a bit overwhelming for my wrist.', 4);

      -- Insert data into comments table
      INSERT INTO comments (id, user_id, review_id, comment_text)
      VALUES
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'john_doe'), 
         (SELECT id FROM reviews WHERE review_text = 'Great watch! Love the build quality and timeless design. Highly recommend.'), 
         'I completely agree with this review! Amazing watch.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'alice_smith'), 
         (SELECT id FROM reviews WHERE review_text = 'Classic style, but very expensive for what you get.'), 
         'I feel the same! It’s a beautiful watch, but the price is definitely a big factor to consider.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'bob_johnson'), 
         (SELECT id FROM reviews WHERE review_text = 'Love the elegant design and craftsmanship, but a bit too flashy for my taste.'), 
         'Agreed! The design is beautiful, but I’d prefer something more understated for everyday use.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'jane_doe'), 
         (SELECT id FROM reviews WHERE review_text = 'Iconic design, excellent accuracy, but the strap could be better. 4 stars.'), 
         'Exactly! The watch is amazing, but the strap could definitely be improved for comfort.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'charlie_brown'), 
         (SELECT id FROM reviews WHERE review_text = 'Great value for money, looks stunning, but not as durable as I hoped.'), 
         'Couldn’t agree more! It’s a great watch for the price, but I wish it was more durable for daily wear.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'david_jones'), 
         (SELECT id FROM reviews WHERE review_text = 'Fantastic for diving, great durability, but a bit bulky for everyday wear.'), 
         'Totally! It’s perfect for diving, but the bulk makes it difficult to wear daily.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'emma_davis'), 
         (SELECT id FROM reviews WHERE review_text = 'Stylish and unique, but not as functional as I would like. 3 stars.'), 
         'I agree! The design is stunning, but it’s not as functional as other models for everyday use.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'frank_miller'), 
         (SELECT id FROM reviews WHERE review_text = 'Luxury at its finest! Looks amazing, but very expensive.'), 
         'I think it’s worth it if you love luxury watches, but definitely not for everyone due to the price.'),
  
        (gen_random_uuid(), (SELECT id FROM users WHERE username = 'grace_wilson'), 
         (SELECT id FROM reviews WHERE review_text = 'Precision at its best, but the design is too understated for my preference.'), 
         'Exactly! The precision is incredible, but I wish it had a bit more flair in the design.');`;

    // Execute the SQL script
    await client.query(SQL);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
};

// Run the seed function
seed();
// const { Client } = require("pg");
// const bcrypt = require("bcryptjs");
// const { client } = require("./common"); // Importing client from common.js

// // Seed function
// const seed = async () => {
//   try {
//     await client.connect(); // Connect to the database

//     // SQL to drop tables if they exist, and recreate them
//     const SQL = `
//       -- Drop tables if they exist
//       DROP TABLE IF EXISTS comments CASCADE;
//       DROP TABLE IF EXISTS watches CASCADE;
//       DROP TABLE IF EXISTS users CASCADE;
//       DROP TABLE IF EXISTS reviews CASCADE;

//       -- Create users table
//       CREATE TABLE users (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         username VARCHAR(100) UNIQUE NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL
//       );

//       -- Create watches table
//       CREATE TABLE watches (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         name VARCHAR(100) UNIQUE NOT NULL,
//         brand VARCHAR(100) NOT NULL,
//         model VARCHAR(100) NOT NULL
//       );

//       -- Create reviews table
//       CREATE TABLE reviews (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//         watch_id UUID REFERENCES watches(id) ON DELETE CASCADE,
//         review_text TEXT,
//         score INT CHECK (score >= 1 AND score <= 5),
//         UNIQUE(user_id, watch_id)  -- Ensures a user can only leave one review per watch
//       );

//       -- Create comments table
//       CREATE TABLE comments (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//         review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
//         comment_text TEXT NOT NULL,
//         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
//       );

//       -- Insert data into watches table
//       INSERT INTO watches (id, name, brand, model)
//       VALUES
//         (gen_random_uuid(), 'Submariner', 'Rolex', 'Submariner 116610LN'),
//         (gen_random_uuid(), 'Speedmaster', 'Omega', 'Speedmaster Professional'),
//         (gen_random_uuid(), 'Royal Oak', 'Audemars Piguet', 'Royal Oak 15400'),
//         (gen_random_uuid(), 'Patek Philippe Nautilus', 'Patek Philippe', 'Nautilus 5711'),
//         (gen_random_uuid(), 'Seiko Presage', 'Seiko', 'Presage Cocktail Time'),
//         (gen_random_uuid(), 'Omega Seamaster', 'Omega', 'Seamaster Diver 300M'),
//         (gen_random_uuid(), 'Tag Heuer Monaco', 'Tag Heuer', 'Monaco Caliber 11'),
//         (gen_random_uuid(), 'AP Royal Oak Offshore', 'Audemars Piguet', 'Royal Oak Offshore'),
//         (gen_random_uuid(), 'Grand Seiko', 'Grand Seiko', 'SBGA413'),
//         (gen_random_uuid(), 'Breitling Navitimer', 'Breitling', 'Navitimer 01');

//       -- Insert data into users table (with hashed passwords)
//       INSERT INTO users (id, username, email, password)
//       VALUES
//         (gen_random_uuid(), 'john_doe', 'john.doe@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'jane_doe', 'jane.doe@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'alice_smith', 'alice.smith@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'bob_johnson', 'bob.johnson@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'charlie_brown', 'charlie.brown@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'david_jones', 'david.jones@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'emma_davis', 'emma.davis@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'frank_miller', 'frank.miller@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'grace_wilson', 'grace.wilson@example.com', '${await bcrypt.hash("password123", 10)}'),
//         (gen_random_uuid(), 'henry_moore', 'henry.moore@example.com', '${await bcrypt.hash("password123", 10)}');

//       -- Insert data into reviews table
//       INSERT INTO reviews (id, user_id, watch_id, review_text, score)
//       VALUES
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM watches WHERE name = 'Submariner'), 'Great watch! Love the build quality and timeless design. Highly recommend.', 5),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'jane_doe'), (SELECT id FROM watches WHERE name = 'Speedmaster'), 'Iconic design, excellent accuracy, but the strap could be better. 4 stars.', 4),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'alice_smith'), (SELECT id FROM watches WHERE name = 'Royal Oak'), 'Classic style, but very expensive for what you get.', 3),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'bob_johnson'), (SELECT id FROM watches WHERE name = 'Nautilus'), 'Love the elegant design and craftsmanship, but a bit too flashy for my taste.', 4),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'charlie_brown'), (SELECT id FROM watches WHERE name = 'Seiko Presage'), 'Great value for money, looks stunning, but not as durable as I hoped.', 3),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'david_jones'), (SELECT id FROM watches WHERE name = 'Omega Seamaster'), 'Fantastic for diving, great durability, but a bit bulky for everyday wear.', 4),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'emma_davis'), (SELECT id FROM watches WHERE name = 'Tag Heuer Monaco'), 'Stylish and unique, but not as functional as I would like. 3 stars.', 3),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'frank_miller'), (SELECT id FROM watches WHERE name = 'AP Royal Oak Offshore'), 'Luxury at its finest! Looks amazing, but very expensive.', 5),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'grace_wilson'), (SELECT id FROM watches WHERE name = 'Grand Seiko'), 'Precision at its best, but the design is too understated for my preference.', 4),
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'henry_moore'), (SELECT id FROM watches WHERE name = 'Breitling Navitimer'), 'Great chronograph, but the size is a bit overwhelming for my wrist.', 4);

//       -- Insert data into comments table
//       INSERT INTO comments (id, user_id, review_id, comment_text)
//       VALUES
//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'john_doe'),
//          (SELECT id FROM reviews WHERE review_text = 'Great watch! Love the build quality and timeless design. Highly recommend.'),
//          'I completely agree with this review! Amazing watch.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'alice_smith'),
//          (SELECT id FROM reviews WHERE review_text = 'Classic style, but very expensive for what you get.'),
//          'I feel the same! It’s a beautiful watch, but the price is definitely a big factor to consider.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'bob_johnson'),
//          (SELECT id FROM reviews WHERE review_text = 'Love the elegant design and craftsmanship, but a bit too flashy for my taste.'),
//          'Agreed! The design is beautiful, but I’d prefer something more understated for everyday use.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'jane_doe'),
//          (SELECT id FROM reviews WHERE review_text = 'Iconic design, excellent accuracy, but the strap could be better. 4 stars.'),
//          'Exactly! The watch is amazing, but the strap could definitely be improved for comfort.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'charlie_brown'),
//          (SELECT id FROM reviews WHERE review_text = 'Great value for money, looks stunning, but not as durable as I hoped.'),
//          'Couldn’t agree more! It’s a great watch for the price, but I wish it was more durable for daily wear.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'david_jones'),
//          (SELECT id FROM reviews WHERE review_text = 'Fantastic for diving, great durability, but a bit bulky for everyday wear.'),
//          'Totally! It’s perfect for diving, but the bulk makes it difficult to wear daily.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'emma_davis'),
//          (SELECT id FROM reviews WHERE review_text = 'Stylish and unique, but not as functional as I would like. 3 stars.'),
//          'I agree! The design is stunning, but it’s not as functional as other models for everyday use.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'frank_miller'),
//          (SELECT id FROM reviews WHERE review_text = 'Luxury at its finest! Looks amazing, but very expensive.'),
//          'I think it’s worth it if you love luxury watches, but definitely not for everyone due to the price.'),

//         (gen_random_uuid(), (SELECT id FROM users WHERE username = 'grace_wilson'),
//          (SELECT id FROM reviews WHERE review_text = 'Precision at its best, but the design is too understated for my preference.'),
//          'Exactly! The precision is incredible, but I wish it had a bit more flair in the design.');`;

//     // Execute the SQL script
//     await client.query(SQL);

//     console.log("Database seeded successfully!");
//   } catch (err) {
//     console.error("Error seeding database:", err);
//   } finally {
//     await client.end();
//   }
// };

// // Run the seed function
// seed();
