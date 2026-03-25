-- CreateTable
CREATE TABLE "candidate_search_history" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "normalized_keyword" TEXT NOT NULL,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_search_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_candidate_search_history_recent" ON "candidate_search_history"("candidate_id", "searched_at" DESC);

-- CreateIndex
CREATE INDEX "idx_candidate_search_history_keyword_recent" ON "candidate_search_history"("candidate_id", "normalized_keyword", "searched_at" DESC);

-- AddForeignKey
ALTER TABLE "candidate_search_history" ADD CONSTRAINT "candidate_search_history_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
