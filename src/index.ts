import "dotenv/config";
import prisma from "./prisma";

async function main() {
	const users = await prisma.user.findMany({
		include: { orders: true },
	});

	console.log("Users:", users);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
