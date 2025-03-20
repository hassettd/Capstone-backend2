const bcrypt = require("bcryptjs");
const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require("@prisma/client");

const prisma = new PrismaClient();

const seed = async () => {
  try {
    // Clear existing data in the correct order
    // Step 1: Delete comments associated with users
    await prisma.comment.deleteMany({}); // This will delete all comments first

    // Step 2: Delete reviews that are associated with watches and users
    await prisma.review.deleteMany({});

    // Step 3: Delete watches (since comments and reviews may reference watches)
    await prisma.watch.deleteMany({});

    // Step 4: Finally, delete users
    await prisma.user.deleteMany({}); // This deletes the users after clearing related data

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

    // Insert watches data
    const watches = await Promise.all([
      prisma.watch.create({
        data: {
          name: "Rolex Submariner",
          brand: "Rolex",
          model: "Submariner 116610LN",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/c/cd/Rolex-Submariner.jpg",
          strapMaterial: "Oystersteel",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Omega Speedmaster",
          brand: "Omega",
          model: "Speedmaster Professional",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/0/06/Omega_speedmaster_reduced_351050.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Manual",
          caseSize: 42,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Audemars Piguet Royal Oak",
          brand: "Audemars Piguet",
          model: "Royal Oak 15400",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Audemars_2385.jpg/1024px-Audemars_2385.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 41,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Patek Philippe Nautilus",
          brand: "Patek Philippe",
          model: "Nautilus 5711",
          imageUrl:
            "https://robbreport.com/wp-content/uploads/2022/10/PP_5811_1G_001_AMB_fond.jpg?w=1000",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Seiko Presage",
          brand: "Seiko",
          model: "Presage Cocktail Time",
          imageUrl:
            "https://seikousa.com/cdn/shop/files/SSA459_1_450x450.png?v=1686324996",
          strapMaterial: "Leather",
          metalColor: "Silver",
          movement: "Automatic",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Omega Seamaster",
          brand: "Omega",
          model: "Seamaster Diver 300M",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/e/e1/Bond-Omega.JPG",
          strapMaterial: "Rubber",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 42,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Tag Heuer Monaco",
          brand: "Tag Heuer",
          model: "Monaco Caliber 11",
          imageUrl:
            "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw6d697770/TAG_Heuer_Monaco/CAW211P.FC6356/CAW211P.FC6356_1000.png",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 39,
        },
      }),
      prisma.watch.create({
        data: {
          name: "AP Royal Oak Offshore",
          brand: "Audemars Piguet",
          model: "Royal Oak Offshore",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Royal_Oak_Offshore_watch_by_Audemars_Piguet.JPG/1280px-Royal_Oak_Offshore_watch_by_Audemars_Piguet.JPG",
          strapMaterial: "Rubber",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 44,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Grand Seiko",
          brand: "Grand Seiko",
          model: "SBGA413",
          imageUrl:
            "https://www.grand-seiko.com/us-en/-/media/Images/GlobalEn/GrandSeiko/Home/collections/Products/SBGA413/04_SHUNBUN-img02.jpg",
          strapMaterial: "Leather",
          metalColor: "Silver",
          movement: "Spring Drive",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Rolex Day-Date",
          brand: "Rolex",
          model: "Day-Date 40",
          imageUrl:
            "https://media.rolex.com/image/upload/q_auto:eco/f_auto/t_v7-majesty/c_limit,w_800/v1/catalogue/2024/upright-c/m228238-0042",
          strapMaterial: "Leather",
          metalColor: "Gold",
          movement: "Automatic",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "IWC Pilot",
          brand: "IWC",
          model: "Big Pilot",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/IWC_Big_Pilot_St_Exupery_Edition_%28cropped%29.jpg/800px-IWC_Big_Pilot_St_Exupery_Edition_%28cropped%29.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 46,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Hublot Big Bang",
          brand: "Hublot",
          model: "Big Bang Unico",
          imageUrl:
            "https://www.hublot.com/sites/default/files/styles/global_medium_desktop_1x/public/2023-04/Big-Bang-unico-king-gold-44-mm-Profile-shot-lifestyle.jpg",
          strapMaterial: "Rubber",
          metalColor: "Gold",
          movement: "Automatic",
          caseSize: 45,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Panerai Luminor",
          brand: "Panerai",
          model: "Luminor Marina 1950",
          imageUrl:
            "https://www.newportwatchclub.com/cdn/shop/products/PaneraiPAM00352LuminorMarina19503Days_BoxShot_-1.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 44,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Breguet Classique",
          brand: "Breguet",
          model: "Classique 5177",
          imageUrl:
            "https://www.breguet.com/sites/default/files/images/5177BR299V6_Soldat.png",
          strapMaterial: "Leather",
          metalColor: "Rose Gold",
          movement: "Automatic",
          caseSize: 39,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Tag Heuer Carrera",
          brand: "Tag Heuer",
          model: "Carrera Caliber 16",
          imageUrl:
            "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw5b3ae0a1/TAG_Heuer_Carrera/CV201AP.FC6429/CV201AP.FC6429_1000.png",
          strapMaterial: "Leather",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 41,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Longines Master Collection",
          brand: "Longines",
          model: "Master Collection 40mm",
          imageUrl:
            "https://api.ecom.longines.com/media/catalog/product/l/o/longines-master-collection-l2-793-4-78-3-bottom-detailed-view-2286x2000-51-1733406403.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Jaeger-LeCoultre Reverso",
          brand: "Jaeger-LeCoultre",
          model: "Reverso Classic",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Jaeger-LeCoultre-Reverso.jpg/800px-Jaeger-LeCoultre-Reverso.jpg",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Manual",
          caseSize: 42,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Vacheron Constantin Overseas",
          brand: "Vacheron Constantin",
          model: "Overseas 4500V",
          imageUrl:
            "https://www.vacheron-constantin.com/dam/vac/watches-wonders/2023/Overseas-Straps.jpg",
          strapMaterial: "Rubber",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 41,
        },
      }),
      prisma.watch.create({
        data: {
          name: "A. Lange & Söhne Saxonia",
          brand: "A. Lange & Söhne",
          model: "Saxonia Thin",
          imageUrl:
            "https://img.alange-soehne.com/intro-block-media-3/af4444b7b7417a9de84a399dbb202f626a5de284.jpg",
          strapMaterial: "Leather",
          metalColor: "Platinum",
          movement: "Manual",
          caseSize: 40,
        },
      }),
      prisma.watch.create({
        data: {
          name: "Breitling Navitimer",
          brand: "Breitling",
          model: "Navitimer 01",
          imageUrl:
            "https://www-storefront.breitling.com/api/image-proxy/www-breitling.eu.saleor.cloud/media/thumbnails/products/ab0139241c1p1-three-quarter_fe4a57cf_thumbnail_1024.webp",
          strapMaterial: "Leather",
          metalColor: "Steel",
          movement: "Automatic",
          caseSize: 43,
        },
      }),
    ]);

    // Insert users data
    const users = await prisma.user.createMany({
      data: [
        {
          username: "john_doe",
          email: "john.doe@example.com",
          password: hashedPasswords[0],
        },
        {
          username: "jane_doe",
          email: "jane.doe@example.com",
          password: hashedPasswords[1],
        },
        {
          username: "alice_smith",
          email: "alice.smith@example.com",
          password: hashedPasswords[2],
        },
        {
          username: "bob_johnson",
          email: "bob.johnson@example.com",
          password: hashedPasswords[3],
        },
        {
          username: "charlie_brown",
          email: "charlie.brown@example.com",
          password: hashedPasswords[4],
        },
        {
          username: "david_jones",
          email: "david.jones@example.com",
          password: hashedPasswords[5],
        },
        {
          username: "emma_davis",
          email: "emma.davis@example.com",
          password: hashedPasswords[6],
        },
        {
          username: "frank_miller",
          email: "frank.miller@example.com",
          password: hashedPasswords[7],
        },
        {
          username: "grace_wilson",
          email: "grace.wilson@example.com",
          password: hashedPasswords[8],
        },
        {
          username: "henry_moore",
          email: "henry.moore@example.com",
          password: hashedPasswords[9],
        },
      ],
    });

    console.log(`${users.count} users have been created.`);

    // Fetch created users and watches to get valid IDs
    const createdUsers = await prisma.user.findMany();
    const createdWatches = await prisma.watch.findMany();

    console.log("Created users:", createdUsers);
    console.log("Created watches:", createdWatches);

    // Create reviews
    const reviewData = [
      {
        userId: createdUsers[0].id,
        watchId: createdWatches[0].id,
        reviewText: "Great watch!",
        score: 5,
      },
      {
        userId: createdUsers[1].id,
        watchId: createdWatches[1].id,
        reviewText: "Love the design, but the strap is a bit tight.",
        score: 4,
      },
      {
        userId: createdUsers[2].id,
        watchId: createdWatches[2].id,
        reviewText: "Stylish and timeless.",
        score: 5,
      },
      {
        userId: createdUsers[3].id,
        watchId: createdWatches[3].id,
        reviewText: "A bit too expensive for my taste.",
        score: 3,
      },
      {
        userId: createdUsers[4].id,
        watchId: createdWatches[4].id,
        reviewText: "Perfect for casual everyday wear.",
        score: 4,
      },
      {
        userId: createdUsers[5].id,
        watchId: createdWatches[5].id,
        reviewText: "Amazing craftsmanship and looks great.",
        score: 5,
      },
      {
        userId: createdUsers[6].id,
        watchId: createdWatches[6].id,
        reviewText: "Nice, but a bit too heavy.",
        score: 3,
      },
      {
        userId: createdUsers[7].id,
        watchId: createdWatches[7].id,
        reviewText: "I prefer more classic designs.",
        score: 2,
      },
      {
        userId: createdUsers[8].id,
        watchId: createdWatches[8].id,
        reviewText: "Great value for money.",
        score: 4,
      },
      {
        userId: createdUsers[9].id,
        watchId: createdWatches[9].id,
        reviewText: "Not my style, but the quality is there.",
        score: 3,
      },
    ];
    const reviews = await Promise.all(
      reviewData.map((review) =>
        prisma.review.create({
          data: review,
        })
      )
    );

    console.log(`${reviews.count} reviews have been created.`);

    // Create comments
    const comments = await prisma.comment.createMany({
      data: [
        {
          userId: createdUsers[1].id,
          reviewId: reviews[0].id,
          commentText: "I agree, it's an excellent watch.",
        },
        {
          userId: createdUsers[0].id,
          reviewId: reviews[1].id,
          commentText: "Thanks for the feedback!",
        },
        {
          userId: createdUsers[3].id,
          reviewId: reviews[2].id,
          commentText: "I love the design too.",
        },
        {
          userId: createdUsers[2].id,
          reviewId: reviews[3].id,
          commentText: "I think the price is justified for the quality.",
        },
        {
          userId: createdUsers[4].id,
          reviewId: reviews[4].id,
          commentText: "Comfort is definitely a plus!",
        },
        {
          userId: createdUsers[5].id,
          reviewId: reviews[5].id,
          commentText: "Couldn’t agree more, the craftsmanship is stunning.",
        },
        {
          userId: createdUsers[7].id,
          reviewId: reviews[6].id,
          commentText: "It was a bit bulky for me, but the looks are good.",
        },
        {
          userId: createdUsers[8].id,
          reviewId: reviews[7].id,
          commentText: "I prefer something more minimalistic.",
        },
        {
          userId: createdUsers[9].id,
          reviewId: reviews[8].id,
          commentText: "I love the quality, but not the style.",
        },
        {
          userId: createdUsers[6].id,
          reviewId: reviews[9].id,
          commentText: "I prefer other brands for a similar price range.",
        },
      ],
    });

    console.log(`${comments.count} comments have been created.`);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
    if (err instanceof PrismaClientKnownRequestError) {
      console.error("Prisma error code:", err.code);
    }
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seed function
seed();
// working version:
// const bcrypt = require("bcryptjs");
// const { client } = require("./common"); // Importing client from common.js

// // Seed function
// const seed = async () => {
//   try {
//     await client.connect(); // Connect to the database

//     // Hash the passwords before inserting them into the users table
//     const hashedPasswords = await Promise.all([
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//       bcrypt.hash("password123", 10),
//     ]);

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
//         model VARCHAR(100) NOT NULL,
//         strap_material VARCHAR(50),         -- New field for strap material
//         metal_color VARCHAR(50),            -- New field for metal color
//         movement VARCHAR(50),               -- New field for movement type
//         case_size INT                       -- New field for case size in mm
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
//       CREATE EXTENSION IF NOT EXISTS pgcrypto;
//       -- Insert data into watches table
//      INSERT INTO watches (id, name, brand, model, strap_material, metal_color, movement, case_size)
//       VALUES
//         (gen_random_uuid(), 'Submariner', 'Rolex', 'Submariner 116610LN', 'Oystersteel', 'Steel', 'Automatic', 40),
//         (gen_random_uuid(), 'Speedmaster', 'Omega', 'Speedmaster Professional', 'Leather', 'Steel', 'Manual', 42),
//         (gen_random_uuid(), 'Royal Oak', 'Audemars Piguet', 'Royal Oak 15400', 'Leather', 'Steel', 'Automatic', 41),
//         (gen_random_uuid(), 'Patek Philippe Nautilus', 'Patek Philippe', 'Nautilus 5711', 'Leather', 'Steel', 'Automatic', 40),
//         (gen_random_uuid(), 'Seiko Presage', 'Seiko', 'Presage Cocktail Time', 'Leather', 'Silver', 'Automatic', 40),
//         (gen_random_uuid(), 'Omega Seamaster', 'Omega', 'Seamaster Diver 300M', 'Rubber', 'Steel', 'Automatic', 42),
//         (gen_random_uuid(), 'Tag Heuer Monaco', 'Tag Heuer', 'Monaco Caliber 11', 'Leather', 'Steel', 'Automatic', 39),
//         (gen_random_uuid(), 'AP Royal Oak Offshore', 'Audemars Piguet', 'Royal Oak Offshore', 'Rubber', 'Steel', 'Automatic', 44),
//         (gen_random_uuid(), 'Grand Seiko', 'Grand Seiko', 'SBGA413', 'Leather', 'Silver', 'Spring Drive', 40),
//         (gen_random_uuid(), 'Rolex Day-Date', 'Rolex', 'Day-Date 40', 'Leather', 'Gold', 'Automatic', 40),
//         (gen_random_uuid(), 'IWC Pilot', 'IWC', 'Big Pilot', 'Leather', 'Steel', 'Automatic', 46),
//         (gen_random_uuid(), 'Hublot Big Bang', 'Hublot', 'Big Bang Unico', 'Rubber', 'Gold', 'Automatic', 45),
//         (gen_random_uuid(), 'Panerai Luminor', 'Panerai', 'Luminor Marina 1950', 'Leather', 'Steel', 'Automatic', 44),
//         (gen_random_uuid(), 'Breguet Classique', 'Breguet', 'Classique 5177', 'Leather', 'Rose Gold', 'Automatic', 39),
//         (gen_random_uuid(), 'Tag Heuer Carrera', 'Tag Heuer', 'Carrera Caliber 16', 'Leather', 'Steel', 'Automatic', 41),
//         (gen_random_uuid(), 'Longines Master Collection', 'Longines', 'Master Collection 40mm', 'Leather', 'Steel', 'Automatic', 40),
//         (gen_random_uuid(), 'Jaeger-LeCoultre Reverso', 'Jaeger-LeCoultre', 'Reverso Classic', 'Leather', 'Steel', 'Manual', 42),
//         (gen_random_uuid(), 'Vacheron Constantin Overseas', 'Vacheron Constantin', 'Overseas 4500V', 'Rubber', 'Steel', 'Automatic', 41),
//         (gen_random_uuid(), 'A. Lange & Söhne Saxonia', 'A. Lange & Söhne', 'Saxonia Thin', 'Leather', 'Platinum', 'Manual', 40),
//         (gen_random_uuid(), 'Breitling Navitimer', 'Breitling', 'Navitimer 01', 'Leather', 'Steel', 'Automatic', 43);

//       -- Insert data into users table (with hashed passwords)
//       INSERT INTO users (id, username, email, password)
//       VALUES
//         (gen_random_uuid(), 'john_doe', 'john.doe@example.com', '${hashedPasswords[0]}'),
//         (gen_random_uuid(), 'jane_doe', 'jane.doe@example.com', '${hashedPasswords[1]}'),
//         (gen_random_uuid(), 'alice_smith', 'alice.smith@example.com', '${hashedPasswords[2]}'),
//         (gen_random_uuid(), 'bob_johnson', 'bob.johnson@example.com', '${hashedPasswords[3]}'),
//         (gen_random_uuid(), 'charlie_brown', 'charlie.brown@example.com', '${hashedPasswords[4]}'),
//         (gen_random_uuid(), 'david_jones', 'david.jones@example.com', '${hashedPasswords[5]}'),
//         (gen_random_uuid(), 'emma_davis', 'emma.davis@example.com', '${hashedPasswords[6]}'),
//         (gen_random_uuid(), 'frank_miller', 'frank.miller@example.com', '${hashedPasswords[7]}'),
//         (gen_random_uuid(), 'grace_wilson', 'grace.wilson@example.com', '${hashedPasswords[8]}'),
//         (gen_random_uuid(), 'henry_moore', 'henry.moore@example.com', '${hashedPasswords[9]}');

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
