import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const generateToken = (payload: object): string => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): object | null => {
	try {
		return jwt.verify(token, JWT_SECRET) as object;
	} catch (error) {
		console.error("JWT verification error:", error);
		return null;
	}
};
