import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get or create a cart for the user
const getOrCreateCart = async (userId: string | number) => {
	const uid = String(userId);
	let cart = await prisma.cart.findUnique({
		where: { userId: uid },
		include: { items: { include: { product: true } } },
	});
	if (!cart) {
		cart = await prisma.cart.create({
			data: { userId: uid },
			include: { items: { include: { product: true } } },
		});
	}
	return cart;
};

export const getCart = async (req: Request, res: Response) => {
	const cart = await getOrCreateCart(req.user!.userId);
	res.json(cart);
};

export const addToCart = async (req: Request, res: Response) => {
	const { productId, quantity = 1 } = req.body;
	const userId = req.user!.userId;

	// Check stock
	const product = await prisma.product.findUnique({ where: { id: productId } });
	if (!product) return res.status(404).json({ error: "Product not found" });
	if (product.stock < quantity) {
		return res.status(400).json({ error: "Insufficient stock" });
	}

	const cart = await getOrCreateCart(userId);
	const existing = await prisma.cartItem.findUnique({
		where: { cartId_productId: { cartId: cart.id, productId } },
	});

	if (existing) {
		// update quantity
		await prisma.cartItem.update({
			where: { id: existing.id },
			data: { quantity: existing.quantity + quantity },
		});
	} else {
		await prisma.cartItem.create({
			data: { cartId: cart.id, productId, quantity },
		});
	}

	const updatedCart = await getOrCreateCart(userId);
	res.json(updatedCart);
};

export const updateCartItem = async (req: Request, res: Response) => {
	const { itemId } = req.params;
	const { quantity } = req.body;
	if (quantity < 1) {
		return res.status(400).json({ error: "Quantity must be at least 1" });
	}
	await prisma.cartItem.update({
		where: { id: itemId },
		data: { quantity },
	});
	const cart = await getOrCreateCart(req.user!.userId);
	res.json(cart);
};

export const removeFromCart = async (req: Request, res: Response) => {
	const { itemId } = req.params;
	await prisma.cartItem.delete({ where: { id: itemId } });
	const cart = await getOrCreateCart(req.user!.userId);
	res.json(cart);
};

export const clearCart = async (req: Request, res: Response) => {
	const cart = await prisma.cart.findUnique({
		where: { userId: req.user!.userId },
	});
	if (cart) {
		await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
	}
	res.json({ message: "Cart cleared" });
};
