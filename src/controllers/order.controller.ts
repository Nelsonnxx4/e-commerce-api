import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
	const { shippingAddress } = req.body;
	const userId = req.user!.userId;

	// get user cart items
	const cart = await prisma.cart.findUnique({
		where: { userId },
		include: { items: { include: { product: true } } },
	});

	if (!cart || cart.items.length === 0) {
		return res.status(400).json({ error: "Cart is emptyy" });
	}

	// calculate total
	let total = 0;
	for (const item of cart.items) {
		if (item.product.stock < item.quantity) {
			return res.status(400).json({
				error: `product ${item.product.name} has insufficient stock`,
			});
		}

		total += item.product.price * item.quantity;
	}

	// create order
	const order = await prisma.$transaction(async (tx) => {
		const newOrder = await tx.order.create({
			data: {
				userId,
				total,
				shippingAddress,
				status: "PENDING",
				items: {
					create: cart.items.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: item.product.price,
					})),
				},
			},
		});

		for (const item of cart.items) {
			await tx.product.update({
				where: { id: item.productId },
				data: { stock: { decrement: item.quantity } },
			});
		}

		// clear caRT
		await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

		return newOrder;
	});

	res.status(201).json(order);
};

// get orders
export const getMyOrders = async (req: Request, res: Response) => {
	const orders = await prisma.order.findMany({
		where: { userId: req.user!.userId },
		include: { items: { include: { product: true } } },
		orderBy: { createdAt: "desc" },
	});

	res.json(orders);
};

// get orders by Id
export const getOrderById = async (req: Request, res: Response) => {
	const { id } = req.params;
	const order = await prisma.order.findUnique({
		where: { id },
		include: { items: { include: { product: true } } },
	});
	if (!order) return res.status(404).json({ error: "Order not found" });

	if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
		return res.status(403).json({ error: "Forbidden" });
	}
	res.json(order);
};

// Admin
export const getAllOrders = async (req: Request, res: Response) => {
	const orders = await prisma.order.findMany({
		include: {
			user: { select: { id: true, email: true } },
			items: { include: { product: true } },
		},
		orderBy: { createdAt: "desc" },
	});
	res.json(orders);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { status } = req.body;
	const order = await prisma.order.update({
		where: { id },
		data: { status },
	});
	res.json(order);
};
