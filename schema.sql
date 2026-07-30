-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "gender" VARCHAR(20),
    "course" VARCHAR(255),
    "experience" TEXT,
    "status" VARCHAR(20) DEFAULT 'active',
    "user_type" VARCHAR(50) DEFAULT 'student',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "gender" VARCHAR(20),
    "course" VARCHAR(255),
    "organization" VARCHAR(255),
    "experience" TEXT,
    "status" VARCHAR(20) DEFAULT 'pending',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_user_courses" (
    "service_user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_user_courses_pkey" PRIMARY KEY ("service_user_id","course_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_courses" (
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_courses_pkey" PRIMARY KEY ("user_id","course_id")
);

-- CreateTable
CREATE TABLE "broadcast_logs" (
    "id" SERIAL NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "course_filter" VARCHAR(100),
    "recipient_count" INTEGER NOT NULL,
    "sent_count" INTEGER NOT NULL,
    "failed_emails" TEXT,
    "total_emails" INTEGER NOT NULL,
    "from_database" INTEGER NOT NULL,
    "from_excel" INTEGER NOT NULL,
    "duplicates_removed" INTEGER NOT NULL,
    "pdf_attached" BOOLEAN NOT NULL DEFAULT false,
    "pdf_name" VARCHAR(255),
    "image_attached" BOOLEAN NOT NULL DEFAULT false,
    "image_name" VARCHAR(255),
    "image_url" TEXT,
    "target_type" VARCHAR(50) DEFAULT 'users',
    "target_filter" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_users_user_id_key" ON "service_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_users_email_key" ON "service_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "courses_name_key" ON "courses"("name");

-- AddForeignKey
ALTER TABLE "service_users" ADD CONSTRAINT "service_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_user_courses" ADD CONSTRAINT "service_user_courses_service_user_id_fkey" FOREIGN KEY ("service_user_id") REFERENCES "service_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_user_courses" ADD CONSTRAINT "service_user_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

