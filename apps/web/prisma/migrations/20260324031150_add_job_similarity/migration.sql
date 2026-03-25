-- CreateTable
CREATE TABLE "job_similarities" (
    "id" TEXT NOT NULL,
    "source_job_id" TEXT NOT NULL,
    "target_job_id" TEXT NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_job_similarities_source_score" ON "job_similarities"("source_job_id", "similarity_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "job_similarities_source_job_id_target_job_id_key" ON "job_similarities"("source_job_id", "target_job_id");

-- CreateIndex
CREATE INDEX "idx_applications_user_job_applied" ON "applications"("user_id", "job_id", "applied_at");

-- CreateIndex
CREATE INDEX "idx_job_views_user_job_viewed" ON "job_views"("user_id", "job_id", "viewed_at");

-- CreateIndex
CREATE INDEX "idx_saved_jobs_candidate_created" ON "saved_jobs"("candidate_id", "created_at");

-- AddForeignKey
ALTER TABLE "job_similarities" ADD CONSTRAINT "job_similarities_source_job_id_fkey" FOREIGN KEY ("source_job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_similarities" ADD CONSTRAINT "job_similarities_target_job_id_fkey" FOREIGN KEY ("target_job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
