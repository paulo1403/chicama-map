-- Add keywords/interests to points
ALTER TABLE "Point" ADD COLUMN "keywords" JSONB NOT NULL DEFAULT '[]';
