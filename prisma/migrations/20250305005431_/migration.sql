/*
  Warnings:

  - You are about to drop the column `watchId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_watchId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "watchId";
