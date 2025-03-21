require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client"); // Import PrismaClient
const prisma = new PrismaClient();

const {
  getWatches,
  getReviewsForWatch,
  getAverageScoreForWatch,
} = require("./db"); // Assuming you still use this helper
const uuid = require("uuid");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan("dev"));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing");
  process.exit(1);
}

// Enable CORS for requests from localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests only from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Define allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

// Middleware for JWT Authentication
const authenticateJWT = (req, res, next) => {
  const token =
    req.header("Authorization") &&
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

// Example of a protected route using the authenticateJWT middleware
app.get("/secure-data", authenticateJWT, (req, res) => {
  res.send("This is secured data!");
});

// Route for getting all watches
app.get("/watches", async (req, res) => {
  try {
    const watches = await prisma.watch.findMany(); // Using Prisma's findMany
    res.json(watches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for getting reviews for a specific watch
app.get("/watches/:id/reviews", async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { watchId: id },
      include: {
        user: true, // Include user info with each review
      },
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for getting average score for a specific watch
app.get("/watches/:id/average", async (req, res) => {
  const { id } = req.params;
  try {
    const averageScore = await prisma.review.aggregate({
      where: { watchId: id },
      _avg: {
        score: true,
      },
    });
    res.json({ average_score: averageScore._avg.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to search for watches by name
app.get("/search-watches", async (req, res) => {
  const { query } = req.query;
  try {
    const watches = await prisma.watch.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
        ],
      },
    });
    res.json(watches);
  } catch (error) {
    console.error("Error fetching watches:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch reviews for a specific watch by watch_id
app.get("/watch-reviews/:watchId", async (req, res) => {
  const { watchId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { watchId: watchId },
      include: {
        user: true, // Include user info
      },
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Internal Server Error");
  }
});

// User Routes

// POST /api/auth/register
app.post(
  "/api/auth/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          id: uuid.v4(),
          username,
          email,
          password: hashedPassword,
        },
      });
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET, // Using the environment secret
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me 🔒
app.get("/api/auth/me", authenticateJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/watches
app.get("/api/watches", async (req, res) => {
  const { page = 1, limit = 10, brand, model } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageLimit = parseInt(limit, 10);

  // Prepare the filtering criteria dynamically
  const whereConditions = {};

  if (brand) {
    whereConditions.brand = {
      contains: brand,
      mode: "insensitive", // Case insensitive search
    };
  }

  if (model) {
    whereConditions.model = {
      contains: model,
      mode: "insensitive", // Case insensitive search
    };
  }

  try {
    const watches = await prisma.watch.findMany({
      where: whereConditions, // Apply dynamic filters
      skip: (pageNumber - 1) * pageLimit, // Pagination: skip items based on page number
      take: pageLimit, // Limit number of items per page
    });

    // Return the fetched watches
    res.status(200).json(watches);
  } catch (err) {
    console.error("Error fetching watches:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/watches/:watchId
app.get("/api/watches/:watchId", async (req, res) => {
  const { watchId } = req.params;
  try {
    const watch = await prisma.watch.findUnique({
      where: { id: watchId }, // Ensure you're querying based on the `id` of the watch
    });

    if (!watch) {
      return res.status(404).json({ message: "Watch not found" });
    }

    res.status(200).json(watch);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/watches/:watchId/reviews
app.get("/api/watches/:watchId/reviews", async (req, res) => {
  const { watchId } = req.params; // Changed to watchId
  try {
    const reviews = await prisma.review.findMany({
      where: { watchId: watchId }, // Ensure you're querying reviews by watchId
      include: { user: true },
    });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET /api/watches/:watchId/reviews/:reviewId
app.get("/api/watches/:watchId/reviews/:reviewId", async (req, res) => {
  const { watchId, reviewId } = req.params; // Changed itemId to watchId

  try {
    // Fetch the review for the specific watch (previously item) and reviewId
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        watchId: watchId, // Ensure the review belongs to the specific watch
      },
      include: {
        user: true, // Optionally include user details who posted the review
        comments: true, // Optionally include comments on the review
      },
    });

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found for this watch." });
    }

    // Return the review data
    res.status(200).json(review);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// POST /api/watches/:watchId/reviews
app.post("/api/watches/:watchId/reviews", authenticateJWT, async (req, res) => {
  const { watchId } = req.params; // Changed itemId to watchId
  const { reviewText, score } = req.body;
  const userId = req.user.id;

  if (!reviewText || reviewText.trim() === "") {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (score < 1 || score > 5) {
    return res.status(400).json({ message: "Score must be between 1 and 5." });
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        watchId, // Ensure the review is associated with the watch
        reviewText,
        score,
      },
    });

    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/reviews/me 🔒
app.get("/api/reviews/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        watch: true, // Ensure watch data is included here
      },
    });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/users/:userId/reviews/:reviewId 🔒
app.put(
  "/api/users/:userId/reviews/:reviewId",
  authenticateJWT,
  async (req, res) => {
    const { userId, reviewId } = req.params;
    const { reviewText, score } = req.body;

    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden. You can only update your own reviews." });
    }

    try {
      const review = await prisma.review.update({
        where: {
          id: reviewId,
          userId: userId,
        },
        data: { reviewText, score },
      });

      res.status(200).json(review);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// POST /api/watches/:watchId/reviews/:reviewId/comments (requires token)
app.post(
  "/api/watches/:watchId/reviews/:reviewId/comments",
  authenticateJWT, // Protect the route
  async (req, res) => {
    const { watchId, reviewId } = req.params; // Changed itemId to watchId
    const { commentText } = req.body; // Comment text from the request body
    const userId = req.user.id; // Get the userId from the JWT

    // Ensure commentText is provided and not empty
    if (!commentText || commentText.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    try {
      // Check if the review exists for the given watch
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          watch: true, // Ensure the review is linked to the correct watch
        },
      });

      if (!review || review.watch.id !== watchId) {
        return res
          .status(404)
          .json({ message: "Review not found for this watch." });
      }

      // Create the comment in the database
      const comment = await prisma.comment.create({
        data: {
          userId, // Associate the comment with the authenticated user
          reviewId, // Link the comment to the specific review
          commentText, // Store the comment's text
        },
      });

      // Return the newly created comment
      res.status(201).json({ message: "Comment added successfully", comment });
    } catch (err) {
      console.error("Error adding comment:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
// GET /api/comments/me (requires token)
app.get("/api/comments/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id; // Get userId from the JWT (authentication middleware)

  try {
    // Fetch all comments made by the authenticated user
    const comments = await prisma.comment.findMany({
      where: {
        userId: userId, // Only fetch comments by the current user
      },
      include: {
        review: {
          select: {
            id: true,
            reviewText: true,
            score: true,
            watch: {
              select: {
                id: true,
                name: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    // If no comments are found, return a message
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this user." });
    }

    // Return the list of comments with review details
    res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/users/:userId/comments/:commentId (requires token)
app.put(
  "/api/users/:userId/comments/:commentId",
  authenticateJWT,
  async (req, res) => {
    const { userId, commentId } = req.params; // Get userId and commentId from the URL parameters
    const { commentText } = req.body; // Get new commentText from the request body

    // Ensure the user is updating their own comment
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this comment." });
    }

    try {
      // Fetch the comment to check if it exists and if it belongs to the user
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { user: true }, // Include the user who made the comment
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
      }

      // Check if the comment belongs to the current authenticated user
      if (comment.user.id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment." });
      }

      // Update the comment text
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          commentText: commentText, // Set the new comment text
        },
      });

      // Return the updated comment
      res.status(200).json(updatedComment);
    } catch (err) {
      console.error("Error updating comment:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// DELETE /api/users/:userId/comments/:commentId (requires token)
app.delete(
  "/api/users/:userId/comments/:commentId",
  authenticateJWT,
  async (req, res) => {
    const { userId, commentId } = req.params; // Get userId and commentId from the URL parameters

    // Ensure the user is trying to delete their own comment
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    try {
      // Fetch the comment to check if it exists and if it belongs to the user
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { user: true }, // Include the user who made the comment
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
      }

      // Check if the comment belongs to the current authenticated user
      if (comment.user.id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment." });
      }

      // Delete the comment
      await prisma.comment.delete({
        where: { id: commentId },
      });

      // Return success response
      res.status(200).json({ message: "Comment deleted successfully." });
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// DELETE /api/users/:userId/reviews/:reviewId 🔒
app.delete(
  "/api/users/:userId/reviews/:reviewId",
  authenticateJWT,
  async (req, res) => {
    const { userId, reviewId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const review = await prisma.review.delete({
        where: {
          id: reviewId,
          userId: userId,
        },
      });

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Clean shutdown handler
process.on("SIGINT", () => {
  prisma.$disconnect().then(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});

// Start the server after the connection is established
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// working version 3/3
// require("dotenv").config();
// const express = require("express");
// const morgan = require("morgan");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { client } = require("./common.js");

// const {
//   getWatches,
//   getReviewsForWatch,
//   getAverageScoreForWatch,
// } = require("./db"); // Updated to watches schema
// const uuid = require("uuid");
// const { body, validationResult } = require("express-validator");

// const app = express();
// const PORT = 3000;

// app.use(express.json());
// app.use(morgan("dev"));

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) {
//   console.error("JWT_SECRET is missing");
//   process.exit(1);
// }

// // Middleware for JWT Authentication
// const authenticateJWT = (req, res, next) => {
//   // Extract token from Authorization header (format: "Bearer <token>")
//   const token =
//     req.header("Authorization") &&
//     req.header("Authorization").replace("Bearer ", "");

//   // If no token is provided, return a 401 error
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Access denied. No token provided." });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     // Changed "your_jwt_secret" to JWT_SECRET for consistency
//     if (err) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     req.user = user;
//     next();
//   });
// };
// // Example of a protected route using the authenticateJWT middleware
// app.get("/secure-data", authenticateJWT, (req, res) => {
//   res.send("This is secured data!");
// });

// // Route for getting all watches
// app.get("/watches", async (req, res) => {
//   try {
//     const watches = await getWatches();
//     res.json(watches);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Route for getting reviews for a specific watch
// app.get("/watches/:id/reviews", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const reviews = await getReviewsForWatch(id);
//     res.json(reviews);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Route for getting average score for a specific watch
// app.get("/watches/:id/average", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const averageScore = await getAverageScoreForWatch(id);
//     res.json({ average_score: averageScore });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Route to search for watches by name
// app.get("/search-watches", async (req, res) => {
//   const { query } = req.query; // Assuming the search term comes as a query parameter (e.g., ?query=Rolex)

//   const SQL = `
//       SELECT watches.name, watches.id, watches.brand, watches.model
//       FROM watches
//       WHERE watches.name ILIKE $1 OR watches.brand ILIKE $1 OR watches.model ILIKE $1
//     `;

//   try {
//     const response = await client.query(SQL, [`%${query}%`]);
//     res.json(response.rows); // Return the list of watches matching the search
//   } catch (error) {
//     console.error("Error fetching watches:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Route to fetch reviews for a specific watch by watch_id
// app.get("/watch-reviews/:watchId", async (req, res) => {
//   const { watchId } = req.params;

//   const SQL = `
//       SELECT reviews.review_text, reviews.score, users.username
//       FROM reviews
//       JOIN users ON reviews.user_id = users.id
//       WHERE reviews.watch_id = $1
//     `;

//   try {
//     const response = await client.query(SQL, [watchId]);
//     res.json(response.rows); // Return the list of reviews for the watch
//   } catch (error) {
//     console.error("Error fetching reviews:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // User Routes

// // POST /api/auth/register
// app.post(
//   "/api/auth/register",
//   [
//     body("username").notEmpty().withMessage("Username is required"),
//     body("email").isEmail().withMessage("Invalid email format"),
//     body("password")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters")
//       .matches(/[a-zA-Z]/)
//       .withMessage("Password must contain at least one letter")
//       .matches(/\d/)
//       .withMessage("Password must contain at least one number"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { username, email, password } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       const result = await client.query(
//         "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
//         [uuid.v4(), username, email, hashedPassword]
//       );
//       const user = result.rows[0];
//       res.status(201).json({ message: "User registered successfully", user });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // POST /api/auth/login
// app.post("/api/auth/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await client.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       "your_jwt_secret", // Replace with your actual secret
//       {
//         expiresIn: "1h",
//       }
//     );

//     res.status(200).json({ message: "Logged in successfully", token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/auth/me 🔒
// app.get("/api/auth/me", authenticateJWT, async (req, res) => {
//   try {
//     const result = await client.query("SELECT * FROM users WHERE id = $1", [
//       req.user.id,
//     ]);
//     const user = result.rows[0];
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/items
// app.get("/api/items", async (req, res) => {
//   const { page = 1, limit = 10, brand, model } = req.query;

//   const pageNumber = parseInt(page, 10);
//   const pageLimit = parseInt(limit, 10);

//   let filterConditions = [];
//   let filterValues = [];

//   if (brand) {
//     filterConditions.push("watches.brand ILIKE $1");
//     filterValues.push(`%${brand}%`);
//   }
//   if (model) {
//     filterConditions.push("watches.model ILIKE $2");
//     filterValues.push(`%${model}%`);
//   }

//   const offset = (pageNumber - 1) * pageLimit;
//   const limitClause = `LIMIT $${filterValues.length + 1} OFFSET $${
//     filterValues.length + 2
//   }`;

//   const SQL = `
//       SELECT * FROM watches
//       ${
//         filterConditions.length > 0
//           ? "WHERE " + filterConditions.join(" AND ")
//           : ""
//       }
//       ${filterConditions.length > 0 ? "AND" : "WHERE"} true
//       ${limitClause}
//     `;

//   try {
//     const response = await client.query(SQL, [
//       ...filterValues,
//       pageLimit,
//       offset,
//     ]);
//     res.status(200).json(response.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/items/:itemId
// app.get("/api/items/:itemId", async (req, res) => {
//   const { itemId } = req.params;
//   try {
//     const result = await client.query("SELECT * FROM watches WHERE id = $1", [
//       itemId,
//     ]);
//     const watch = result.rows[0];
//     if (!watch) {
//       return res.status(404).json({ message: "Watch not found" });
//     }
//     res.status(200).json(watch);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/items/:itemId/reviews
// app.get("/api/items/:itemId/reviews", async (req, res) => {
//   const { itemId } = req.params;

//   try {
//     const result = await client.query(
//       "SELECT reviews.review_text, reviews.score, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.watch_id = $1",
//       [itemId]
//     );

//     if (result.rows.length === 0) {
//       return res
//         .status(200)
//         .json({ message: "No reviews yet, will you be the first?" });
//     }

//     res.status(200).json(result.rows); // Return the list of reviews for the watch
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Review Routes

// // GET /api/items/:itemId/reviews/:reviewId
// app.get("/api/items/:itemId/reviews/:reviewId", async (req, res) => {
//   const { itemId, reviewId } = req.params;
//   try {
//     const result = await client.query(
//       "SELECT * FROM reviews WHERE watch_id = $1 AND id = $2",
//       [itemId, reviewId]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Review not found" });
//     }
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // POST /api/items/:itemId/reviews/
// app.post("/api/items/:itemId/reviews", authenticateJWT, async (req, res) => {
//   const { itemId } = req.params;
//   const { reviewText, score } = req.body;
//   const userId = req.user.id;

//   if (!reviewText || reviewText.trim() === "") {
//     return res.status(400).json({ message: "Review text is required." });
//   }

//   if (score < 1 || score > 5) {
//     return res.status(400).json({ message: "Score must be between 1 and 5." });
//   }

//   try {
//     const result = await client.query(
//       "INSERT INTO reviews (user_id, watch_id, review_text, score) VALUES ($1, $2, $3, $4) RETURNING *",
//       [userId, itemId, reviewText, score]
//     );
//     const review = result.rows[0];
//     res.status(201).json({ message: "Review added successfully", review });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/reviews/me 🔒
// app.get("/api/reviews/me", authenticateJWT, async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const result = await client.query(
//       "SELECT * FROM reviews WHERE user_id = $1",
//       [userId]
//     );
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // PUT /api/users/:userId/reviews/:reviewId 🔒
// app.put(
//   "/api/users/:userId/reviews/:reviewId",
//   authenticateJWT,
//   async (req, res) => {
//     const { userId, reviewId } = req.params;
//     const { reviewText, score } = req.body;

//     if (req.user.id !== userId) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden. You can only update your own reviews." });
//     }

//     if (!reviewText || reviewText.trim() === "") {
//       return res.status(400).json({ message: "Review text is required." });
//     }

//     if (score < 1 || score > 5) {
//       return res
//         .status(400)
//         .json({ message: "Score must be between 1 and 5." });
//     }

//     try {
//       const result = await client.query(
//         "UPDATE reviews SET review_text = $1, score = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
//         [reviewText, score, reviewId, userId]
//       );

//       // Check if the review exists
//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           message: "Review not found or you are not the owner of the review.",
//         });
//       }

//       // Return the updated review
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );
// // Comments routes

// // POST /api/items/:itemId/reviews/:reviewId/comments 🔒
// app.post(
//   "/api/items/:itemId/reviews/:reviewId/comments",
//   authenticateJWT,
//   async (req, res) => {
//     const { reviewId } = req.params;
//     const { commentText } = req.body;
//     const userId = req.user.id;

//     try {
//       const result = await client.query(
//         "INSERT INTO comments (user_id, review_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
//         [userId, reviewId, commentText]
//       );
//       res.status(201).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // GET /api/comments/me 🔒
// app.get("/api/comments/me", authenticateJWT, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const result = await client.query(
//       "SELECT * FROM comments WHERE user_id = $1",
//       [userId]
//     );
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // PUT /api/users/:userId/comments/:commentId 🔒
// app.put(
//   "/api/users/:userId/comments/:commentId",
//   authenticateJWT,
//   async (req, res) => {
//     const { userId, commentId } = req.params;
//     const { commentText } = req.body;

//     // Ensure that the user is updating their own comment
//     if (req.user.id !== userId) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     try {
//       const result = await client.query(
//         "UPDATE comments SET comment_text = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
//         [commentText, commentId, userId]
//       );

//       // Check if the comment was found
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Comment not found" });
//       }

//       // Return the updated comment
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // DELETE /api/users/:userId/comments/:commentId 🔒
// app.delete(
//   "/api/users/:userId/comments/:commentId",
//   authenticateJWT,
//   async (req, res) => {
//     const { userId, commentId } = req.params;

//     // Ensure that the user is deleting their own comment
//     if (req.user.id !== userId) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     try {
//       const result = await client.query(
//         "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *",
//         [commentId, userId]
//       );

//       // Check if the comment exists
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Comment not found" });
//       }

//       // Respond with a success message
//       res.status(200).json({ message: "Comment deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // DELETE /api/users/:userId/reviews/:reviewId 🔒
// app.delete(
//   "/api/users/:userId/reviews/:reviewId",
//   authenticateJWT,
//   async (req, res) => {
//     const { userId, reviewId } = req.params;

//     // Ensure that the user is deleting their own review
//     if (req.user.id !== userId) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     try {
//       const result = await client.query(
//         "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
//         [reviewId, userId]
//       );

//       // Check if the review exists
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Review not found" });
//       }

//       // Respond with a success message
//       res.status(200).json({ message: "Review deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   }
// );

// // Clean shutdown handler
// process.on("SIGINT", () => {
//   client.end(() => {
//     console.log("Database connection closed");
//     process.exit(0);
//   });
// });

// // Start the server after the connection is established
// client
//   .connect()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Error connecting to the database:", err);
//     process.exit(1);
//   });
