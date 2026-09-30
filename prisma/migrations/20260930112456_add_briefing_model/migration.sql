-- CreateTable
CREATE TABLE "briefing" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "briefing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "briefing_category_date_key" ON "briefing"("category", "date");
