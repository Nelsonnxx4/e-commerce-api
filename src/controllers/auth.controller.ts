import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ error: "Email and Password required for signup" });
		}

		// checking if user already exists
		const existingAcct = await prisma.user.findUnique({ where: { email } });
		if (existingAcct) {
			return res.status(400).json({ error: "User already exists" });
		}

		// Hash the password
		const hashed = await hashPassword(password);
		const newUser = await prisma.user.create({
			data: {
				email,
				password: hashed,
				role: "CUSTOMER",
			},
		});

		// Generate JWT token
		const token = generateToken({
			userId: newUser.id,
			email: newUser.email,
			role: newUser.role,
		});
		res.status(201).json({ message: "User created successfully", token });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and Password required for login" });
		}

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		// Generate JWT token
		const token = generateToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});
		res.status(200).json({ message: "Login successful", token });
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
