import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: number;
				email: string;
				role: string;
			};
		}
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ error: "Authorization header missing or malformed" });
	}

	const token = authHeader.split(" ")[1];
	const decoded = verifyToken(token) as {
		userId: number;
		email: string;
		role: string;
	} | null;
	try {
		if (!decoded) {
			return res.status(401).json({ error: "Invalid or expired token" });
		}
		req.user = decoded;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
