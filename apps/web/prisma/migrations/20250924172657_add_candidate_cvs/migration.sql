-- CreateTable
CREATE TABLE "public"."candidate_cvs" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "cv_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_viewed_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_cvs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_candidate_cvs_primary" ON "public"."candidate_cvs"("candidate_id", "is_primary");

-- AddForeignKey
ALTER TABLE "public"."candidate_cvs" ADD CONSTRAINT "candidate_cvs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
