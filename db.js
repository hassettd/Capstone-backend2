const { PrismaClient } = require("@prisma/client"); // assuming you have set up prismaClient
const prisma = new PrismaClient();
// Get all watches
const getWatches = async () => {
  const watches = await prisma.watch.findMany({
    select: {
      name: true,
      id: true,
    },
  });
  return watches;
};

// Get all reviews for a specific watch
const getReviewsForWatch = async (watchId) => {
  const reviews = await prisma.review.findMany({
    where: {
      watchId: watchId,
    },
    select: {
      reviewText: true,
      score: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  return reviews;
};

// Get the average score for a watch
const getAverageScoreForWatch = async (watchId) => {
  const averageScore = await prisma.review.aggregate({
    where: {
      watchId: watchId,
    },
    _avg: {
      score: true,
    },
  });
  return averageScore._avg.score || 0;
};

module.exports = {
  getWatches,
  getReviewsForWatch,
  getAverageScoreForWatch,
};
// working verdion
// const { client } = require("./common");

// // Get all watches
// const getWatches = async () => {
//   const SQL = `
//     SELECT watches.name, watches.id as watch_id
//     FROM watches
//   `;
//   const response = await client.query(SQL);
//   return response.rows;
// };

// // Get all reviews for a specific watch
// const getReviewsForWatch = async (watchId) => {
//   const SQL = `
//     SELECT reviews.review_text, reviews.score, users.username
//     FROM reviews
//     INNER JOIN users ON reviews.user_id = users.id
//     WHERE reviews.watch_id = $1
//   `;
//   const response = await client.query(SQL, [watchId]);
//   return response.rows;
// };

// // Get the average score for a watch
// const getAverageScoreForWatch = async (watchId) => {
//   const SQL = `
//     SELECT AVG(score) as average_score
//     FROM reviews
//     WHERE watch_id = $1
//   `;
//   const response = await client.query(SQL, [watchId]);
//   return response.rows[0].average_score || 0;
// };

// module.exports = { getWatches, getReviewsForWatch, getAverageScoreForWatch };
