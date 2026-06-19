import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redis";

export const rateLimiter = (
	limit: number = 100,
	windowSeconds: number = 60,
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const ip = req.ip || "unknown";
		const key = `rate:${ip}`;
		const current = await redisClient.incr(key);
		if (current === 1) {
			await redisClient.expire(key, windowSeconds);
		}
		if (current > limit) {
			return res.status(429).json({ error: "Too many requests" });
		}
		next();
	};
};
