-- Add academic level enum and fields for divisions and subjects
CREATE TYPE "AcademicLevel" AS ENUM ('SSC', 'HSC');

ALTER TABLE "divisions"
ADD COLUMN "level" "AcademicLevel" NOT NULL DEFAULT 'SSC';

ALTER TABLE "subjects"
ADD COLUMN "level" "AcademicLevel";
