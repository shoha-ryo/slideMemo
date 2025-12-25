-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "cardIds" TEXT[];

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "childrenIds" TEXT[];
