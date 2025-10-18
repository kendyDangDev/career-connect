/*
  Warnings:

  - The values [DRAFT] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_read` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `message_type` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `recipient_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `related_application_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `messages` table. All the data in the column will be lost.
  - Added the required column `conversation_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ConversationType" AS ENUM ('DIRECT', 'GROUP', 'APPLICATION_RELATED');

-- CreateEnum
CREATE TYPE "public"."ParticipantRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- AlterEnum - Create new JobStatus enum and migrate data
BEGIN;
CREATE TYPE "public"."JobStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED', 'EXPIRED');
ALTER TABLE "public"."jobs" ALTER COLUMN "status" DROP DEFAULT;
-- Map DRAFT to PENDING and others remain the same
ALTER TABLE "public"."jobs" ALTER COLUMN "status" TYPE "public"."JobStatus_new" USING (
  CASE 
    WHEN "status"::text = 'DRAFT' THEN 'PENDING'::public."JobStatus_new"
    ELSE "status"::text::"public"."JobStatus_new"
  END
);
ALTER TYPE "public"."JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "public"."JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "public"."jobs" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- Adding enum values one by one and committing between each
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'TEXT';
COMMIT;
BEGIN;
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'IMAGE';
COMMIT;
BEGIN;
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'VIDEO';

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_related_application_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "public"."jobs" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "is_read",
DROP COLUMN "message_type",
DROP COLUMN "recipient_id",
DROP COLUMN "related_application_id",
DROP COLUMN "subject",
ADD COLUMN     "conversation_id" TEXT NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reply_to_id" TEXT,
ADD COLUMN     "type" "public"."MessageType",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" "public"."ConversationType" NOT NULL DEFAULT 'DIRECT',
    "application_id" TEXT,
    "job_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_reads" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "public"."conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_reads_message_id_user_id_key" ON "public"."message_reads"("message_id", "user_id");

-- Update message type column after enum values are committed
UPDATE "public"."messages" SET "type" = 'TEXT' WHERE "type" IS NULL;
ALTER TABLE "public"."messages" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "public"."messages" ALTER COLUMN "type" SET DEFAULT 'TEXT';

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reads" ADD CONSTRAINT "message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reads" ADD CONSTRAINT "message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
