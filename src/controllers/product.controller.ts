import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../utils/slug";
import redisClient from "../utils/redis";

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
	const cacheKey = `products:${JSON.stringify(req.query)}`;
	const cached = await redisClient.get(cacheKey);
	if (cached) {
		return res.json(JSON.parse(cached));
	}

	const products = await prisma.product.findMany({
		include: { category: true },
	});

	await redisClient.setEx(cacheKey, 60, JSON.stringify(products));
	res.json(products);
};

export const getProductBySlug = async (req: Request, res: Response) => {
	const { slug } = req.params;
	const product = await prisma.product.findUnique({
		where: { slug },
		include: { category: true },
	});
	if (!product) return res.status(404).json({ error: "Product not found" });
	res.json(product);
};

// ---- Admin only ----
export const createProduct = async (req: Request, res: Response) => {
	const { name, description, price, stock, imageUrl, categoryId } = req.body;
	const slug = generateSlug(name);
	// optional: ensure slug is unique (append random if needed)
	const product = await prisma.product.create({
		data: { name, slug, description, price, stock, imageUrl, categoryId },
	});
	res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, description, price, stock, imageUrl, categoryId } = req.body;
	const data: any = { description, price, stock, imageUrl, categoryId };
	if (name) data.name = name;
	if (name) data.slug = generateSlug(name);
	const product = await prisma.product.update({
		where: { id },
		data,
	});
	res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
	const { id } = req.params;
	await prisma.product.delete({ where: { id } });
	res.status(204).send();
};

// ---- Categories ----
export const getAllCategories = async (req: Request, res: Response) => {
	const categories = await prisma.category.findMany();
	res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
	const { name } = req.body;
	const slug = generateSlug(name);
	const category = await prisma.category.create({ data: { name, slug } });
	res.status(201).json(category);
};
