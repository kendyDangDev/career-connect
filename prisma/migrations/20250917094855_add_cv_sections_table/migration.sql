-- CreateTable
CREATE TABLE "public"."cv_sections" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" JSONB,
    "order" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cv_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cv_sections" ADD CONSTRAINT "cv_sections_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."user_cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
