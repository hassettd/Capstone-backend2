/*
  Warnings:

  - Added the required column `imageUrl` to the `Watch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Watch" ADD COLUMN     "imageUrl" TEXT NOT NULL;
