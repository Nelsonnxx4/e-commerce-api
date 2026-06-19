import bcrypt from "bcryptjs";

export const hashPassword = async (plain: string): Promise<string> => {
	return await bcrypt.hash(plain, 10);
};

export const comparePassword = async (
	plain: string,
	hashed: string,
): Promise<boolean> => {
	return await bcrypt.compare(plain, hashed);
};
