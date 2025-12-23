import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient()

	async function prismaTest() {
		// ボードの並び順を保存してみる
		await prisma.appConfig.create({
			data: {
				id: 1,
				boardOrder: ["board-1", "board-2", "board-3"] // 配列がそのままいけます！
			}
		})
	}

export {prisma}